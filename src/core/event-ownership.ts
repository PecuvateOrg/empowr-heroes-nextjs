/**
 * core/event-ownership.ts
 *
 * WHY THIS EXISTS
 * ---------------
 * Heroes does not have a Stripe account to itself. It shares the Empowr CIC
 * account (`acct_1TBhN2CpJGJ55gu5`) with the Members platform, and Stripe
 * delivers every event of a subscribed type to EVERY webhook endpoint on the
 * account. Delivery is not scoped by API key: the restricted key each app uses
 * controls what that app may CALL, not what it is TOLD ABOUT. The per-endpoint
 * signing secret only proves Stripe sent it — it does not prove the event
 * belongs to this app.
 *
 * So every event arriving here is "some event on the Empowr CIC account", and
 * Heroes must positively identify its own before acting on it. It has already
 * gone wrong once: on 2026-08-18 a Members session booking triggered a genuine
 * Heroes donation thank-you email, because an unresolved tier fell through to
 * "assume it's still a donation".
 *
 * DESIGN RULES (do not weaken these)
 * ----------------------------------
 * 1. POSITIVE identification only. Assert the object IS Heroes'. Never assert
 *    it is not somebody else's — a future app that doesn't set the marker we
 *    happen to check would sail straight through.
 * 2. DEFAULT DENY. Anything we cannot classify is ignored and logged. A missed
 *    Heroes event is visible and recoverable (Stripe retries, and events can be
 *    replayed from the dashboard). Acting on another app's event is neither —
 *    by the time anyone notices, Notion has been written and email has been sent.
 * 3. CHECKED ONCE, AT DISPATCH. `handleDonation` resolves ownership before it
 *    routes. Handlers never re-check, and a NEW EVENT TYPE CANNOT BYPASS THIS —
 *    if you add a handler for an event type this file doesn't classify, it will
 *    be ignored until you teach the resolver about it. That is deliberate.
 *
 * The structural signal is the Stripe Product ID, because it is the one thing
 * on the event that a human cannot casually change in the dashboard, and it
 * works retroactively for objects created before any of this existed.
 * Metadata is deliberately NOT the primary signal: Heroes' own recurring
 * Payment Links carry `subscription_data.metadata = {}`, so Heroes' real
 * subscriptions have NO metadata on the Subscription object. A metadata-based
 * check would reject genuine donors.
 */

import type Stripe from 'stripe'

/**
 * Heroes' own Stripe Products on the shared live account, resolved from the
 * six donation Payment Links on 2026-08-26.
 *
 * ADDING A TIER: add its Product ID here too, or its subscription and invoice
 * events will be silently ignored. See ops/runbooks/add-a-tier.md.
 *
 * Product IDs (not Price IDs) on purpose — re-pricing a tier mints a new Price
 * under the same Product, and that must not break the guard.
 */
export const HEROES_PRODUCT_IDS: ReadonlySet<string> = new Set([
  'prod_UA4laHe4vy0xhl', // 🌱 Seed Hero              £10/month
  'prod_UA4loaxqh8DZwA', // 🚀 Momentum Hero          £25/month
  'prod_UA4l23FOrDBCbA', // 🫂 Community Hero         £50/month
  'prod_UA4lPgq9SlIGbW', // 🏆 Champion Hero          £250/month
  'prod_UA4l4BSnCVjwzm', // 💎 Legacy Hero            £500/month
  'prod_UAj03yBk4wAEix', // 💝 One-Time Hero Contribution
])

export type Ownership =
  | { ours: true; via: string }
  | { ours: false; reason: string }

/**
 * Fields we read that the pinned `stripe` SDK types trail the account's API
 * version on. Declared explicitly and cast ONCE here, rather than sprinkling
 * `as any` at each use — that is how `invoice.subscription` silently became
 * permanently undefined and shipped null subscription IDs into Notion.
 *
 * Current account API version returns:
 *   invoice.lines.data[].pricing.price_details.{price,product}
 *   invoice.parent.subscription_details.subscription
 * NOT the older `invoice.lines.data[].price` / `invoice.subscription`.
 */
type InvoiceLinePricing = {
  pricing?: { price_details?: { price?: string; product?: string } }
}
type InvoiceParent = {
  parent?: { subscription_details?: { subscription?: string | null } | null } | null
}

/** A subscription/price `product` may arrive as an ID string or an expanded object. */
function productIdOf(product: unknown): string | null {
  if (typeof product === 'string') return product
  if (product && typeof product === 'object' && 'id' in product) {
    const id = (product as { id?: unknown }).id
    return typeof id === 'string' ? id : null
  }
  return null
}

/**
 * Every product referenced must be one of ours, and there must be at least one.
 * A mixed object is treated as NOT ours: it cannot occur in practice (two apps
 * never build one subscription), so if it ever does, something is wrong enough
 * that acting on it is the wrong response.
 */
function allProductsAreOurs(productIds: (string | null)[]): boolean {
  if (productIds.length === 0) return false
  return productIds.every((id) => id !== null && HEROES_PRODUCT_IDS.has(id))
}

/** Read the subscription ID off an invoice on the current API shape. */
export function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = (invoice as unknown as InvoiceParent).parent
  return parent?.subscription_details?.subscription ?? null
}

/**
 * Resolve whether a Stripe event belongs to Heroes. Called once, at dispatch,
 * before any handler runs. Purely structural — no network calls, because every
 * signal it needs is already embedded in the event payload.
 */
export function resolveEventOwnership(event: Stripe.Event): Ownership {
  switch (event.type) {
    // Heroes takes donations EXCLUSIVELY through dashboard-configured Payment
    // Links. Every other app on the account builds its own sessions via the API
    // with `price_data`, which never carries a `payment_link`.
    case 'checkout.session.completed':
    case 'checkout.session.expired': {
      const session = event.data.object as Stripe.Checkout.Session
      if (!session.payment_link) {
        return { ours: false, reason: 'checkout session did not come from a Payment Link' }
      }
      return { ours: true, via: 'payment_link' }
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const productIds = (subscription.items?.data ?? []).map((item) =>
        productIdOf(item.price?.product)
      )
      if (!allProductsAreOurs(productIds)) {
        return {
          ours: false,
          reason: `subscription products [${productIds.join(', ') || 'none'}] are not Heroes products`,
        }
      }
      return { ours: true, via: 'product_id' }
    }

    case 'invoice.payment_failed':
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const lines = (invoice.lines?.data ?? []) as unknown as InvoiceLinePricing[]
      const productIds = lines.map((line) => line.pricing?.price_details?.product ?? null)
      if (!allProductsAreOurs(productIds)) {
        return {
          ours: false,
          reason: `invoice line products [${productIds.join(', ') || 'none'}] are not Heroes products`,
        }
      }
      return { ours: true, via: 'product_id' }
    }

    // Default deny. If you are adding a handler for a new event type, add a
    // case above that positively identifies it as Heroes' — otherwise it will
    // never reach your handler.
    default:
      return { ours: false, reason: `event type ${event.type} is not classified by resolveEventOwnership` }
  }
}
