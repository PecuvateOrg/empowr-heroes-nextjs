/**
 * verify-event-ownership.ts
 *
 * Run:  npm run verify:ownership      (from src/)
 *   or: node --test ops/scripts/verify-event-ownership.ts
 *
 * Proves the dispatch-level ownership gate in src/core/event-ownership.ts both
 * ACCEPTS Heroes' own events and REJECTS another app's. The rejection cases are
 * the point: a suite that only feeds Heroes' own events proves the handler
 * works, not that the guard does.
 *
 * Fixtures mirror the real payload shapes observed on the live Empowr CIC
 * account on 2026-08-26 (subscription sub_1TRWLc..., invoice in_1TRWKy...),
 * including the current API version's
 * `invoice.lines.data[].pricing.price_details.product` and
 * `invoice.parent.subscription_details.subscription` — NOT the older
 * `lines.data[].price` / `invoice.subscription` shapes the SDK types still
 * suggest. If Stripe moves these again, this file should fail first.
 */

import test from 'node:test'
import assert from 'node:assert/strict'
import type Stripe from 'stripe'
import {
  resolveEventOwnership,
  invoiceSubscriptionId,
  HEROES_PRODUCT_IDS,
} from '../../src/core/event-ownership.ts'

const HEROES_SEED_PRODUCT = 'prod_UA4laHe4vy0xhl' // 🌱 Seed Hero, £10/month
const MEMBERS_PLAN_PRODUCT = 'prod_MembersSkateJamSub' // a Members subscription plan

function event(type: string, object: unknown): Stripe.Event {
  return { id: 'evt_test', type, data: { object } } as unknown as Stripe.Event
}

function subscriptionWithProducts(...productIds: string[]) {
  return {
    id: 'sub_test',
    items: { data: productIds.map((product) => ({ price: { product } })) },
  }
}

function invoiceWithProducts(...productIds: string[]) {
  return {
    id: 'in_test',
    lines: {
      data: productIds.map((product) => ({
        pricing: { price_details: { price: 'price_test', product } },
      })),
    },
    parent: { subscription_details: { subscription: 'sub_test' } },
  }
}

test('the six Heroes products are registered', () => {
  assert.equal(HEROES_PRODUCT_IDS.size, 6)
  assert.ok(HEROES_PRODUCT_IDS.has(HEROES_SEED_PRODUCT))
})

test('ACCEPTS a Heroes checkout session (came from a Payment Link)', () => {
  const result = resolveEventOwnership(
    event('checkout.session.completed', { id: 'cs_live_x', payment_link: 'plink_1TBkcU' })
  )
  assert.equal(result.ours, true)
})

test('REJECTS a Members checkout session (API-created, no Payment Link)', () => {
  const result = resolveEventOwnership(
    event('checkout.session.completed', { id: 'cs_live_y', payment_link: null })
  )
  assert.equal(result.ours, false)
})

test('ACCEPTS a Heroes subscription cancellation', () => {
  const result = resolveEventOwnership(
    event('customer.subscription.deleted', subscriptionWithProducts(HEROES_SEED_PRODUCT))
  )
  assert.equal(result.ours, true)
})

// The regression this whole change exists for. Before the dispatch-level gate,
// this reached handleCancellationEvent and wrote a Members subscriber into the
// Heroes donor Notion database.
test('REJECTS a Members subscription cancellation', () => {
  const result = resolveEventOwnership(
    event('customer.subscription.deleted', subscriptionWithProducts(MEMBERS_PLAN_PRODUCT))
  )
  assert.equal(result.ours, false)
  assert.match((result as { reason: string }).reason, /not Heroes products/)
})

test('REJECTS a Members failed invoice', () => {
  const result = resolveEventOwnership(
    event('invoice.payment_failed', invoiceWithProducts(MEMBERS_PLAN_PRODUCT))
  )
  assert.equal(result.ours, false)
})

test('ACCEPTS a Heroes failed invoice', () => {
  const result = resolveEventOwnership(
    event('invoice.payment_failed', invoiceWithProducts(HEROES_SEED_PRODUCT))
  )
  assert.equal(result.ours, true)
})

test('REJECTS a subscription mixing Heroes and foreign products', () => {
  const result = resolveEventOwnership(
    event(
      'customer.subscription.deleted',
      subscriptionWithProducts(HEROES_SEED_PRODUCT, MEMBERS_PLAN_PRODUCT)
    )
  )
  assert.equal(result.ours, false)
})

test('REJECTS an object with no line items at all', () => {
  const result = resolveEventOwnership(event('customer.subscription.deleted', subscriptionWithProducts()))
  assert.equal(result.ours, false)
})

test('DEFAULT DENY: an unclassified event type is rejected, and says so', () => {
  const result = resolveEventOwnership(event('payment_intent.succeeded', { id: 'pi_x' }))
  assert.equal(result.ours, false)
  assert.match((result as { reason: string }).reason, /not classified/)
})

test('invoiceSubscriptionId reads the CURRENT API shape', () => {
  const invoice = invoiceWithProducts(HEROES_SEED_PRODUCT) as unknown as Stripe.Invoice
  assert.equal(invoiceSubscriptionId(invoice), 'sub_test')
})

test('invoiceSubscriptionId returns null on the OLD shape rather than undefined', () => {
  // The pre-fix code read `invoice.subscription`, which this shape does have —
  // proving the helper ignores it and does not silently resurrect the old bug.
  const legacy = { id: 'in_old', subscription: 'sub_legacy' } as unknown as Stripe.Invoice
  assert.equal(invoiceSubscriptionId(legacy), null)
})
