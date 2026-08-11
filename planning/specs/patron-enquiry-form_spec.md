# Founding Patron Enquiry Form — Spec

**Status:** applied 2026-08-11
**Date:** 2026-08-10
**Applies to:** `/patron` on `hero.empowrcic.org` — the Founding Patron (£100,000+) enquiry path only

---

## What this is and why it exists

Replace the `mailto:` CTA on `/patron` with a submitted form that delivers through Empowr's own authenticated mail path.

**The problem it solves:** enquiries sent to the patron address from Outlook are landing in the spam folder; the same message sent in-house from Gmail arrives normally. This is not fixable with DNS, because the mail in question is composed on the *prospect's* infrastructure — Empowr controls none of its authentication, reputation, or formatting.

Verified DNS for `empowrcic.org` (2026-08-10):

| Record | Value | Meaning |
|---|---|---|
| MX | `aspmx.l.google.com` (Google Workspace) | inbound filtering is Gmail's |
| SPF | `v=spf1 include:_spf.google.com -all` | authorises Google only |
| DKIM | `resend._domainkey` present | ✅ |
| Return-path | `send.empowrcic.org` → `feedback-smtp.eu-west-1.amazonses.com` | Resend correctly configured |
| DMARC | `v=DMARC1; p=none; rua=…@vali.email` | monitor-only |

Two things follow. First, **outbound mail from `@empowrcic.org` via Resend is fully authenticated** — SPF passes via the return-path, DKIM aligns, DMARC passes. Second, **the current CTA carries no subject and no body** (`mailto:patron@empowrcic.org`, [`src/lib/links.ts`](../../src/lib/links.ts)) — so a blank-subject message reaches a Gmail-filtered mailbox from an unknown consumer domain with no prior correspondence. That is a textbook spam classification.

A form inverts the direction: the prospect submits over HTTPS, and the notification originates from Empowr's own verified domain into Empowr's own mailbox. The spam vector is removed rather than mitigated.

---

## Open decisions — resolve before building

### 1. Which inbox receives patron enquiries? — **RESOLVED 2026-08-10**

**`patron@empowrcic.org`** — confirmed by the user as a real, live mailbox. Patron enquiries stay separate from donation traffic. No change to `LINKS.email.patron`.

**Follow-up required:** `Empowr CIC/guides/contact-routing.md` is the single source of truth for enquiry routing and does **not** list `patron@empowrcic.org` anywhere — not as a platform, role, or system address. Line 23 currently attributes patron enquiries to `hero@empowrcic.org`. The doc is wrong and must be corrected per its own procedure (§ *Changing an Address or Routing Decision*):

| Table | Change |
|---|---|
| Platform-by-Platform Routing | amend the Heroes row — `hero@empowrcic.org` handles **donations**, not patron enquiries |
| Platform-by-Platform Routing | add a Heroes row: `patron@empowrcic.org` → Founding Patron enquiries |
| Where Addresses Live in Code | add `patron@empowrcic.org` → `empowr-heroes-nextjs/src/lib/links.ts` |

### 2. Does this route into PecuvateCRM?

Main Site's contact function posts to the CRM Escalations dashboard first and falls back to email. Patron enquiries are high-touch and very low-volume.

*Recommendation:* **no CRM.** Email-only, direct to a human. Fewer moving parts on the highest-value path, and no dependency that can silently degrade. Revisit if volume ever justifies it.

### 3. Ask for an indicative commitment band?

Asking for a number early can end a conversation before it starts; not asking costs qualification signal.

*Recommendation:* include the field, **optional**, with "Prefer to discuss" as the default. Your call — this is a fundraising judgement, not a technical one.

---

## Architecture

**Follow the Heroes core/adapter split. Do not clone Main Site's function wholesale.**

Main Site's `contact.ts` is a single file holding transport, validation, and business logic. Heroes deliberately separates them, and this project's `CLAUDE.md` requires it:

```
src/components/PatronEnquiryForm.tsx   client component — form state, validation, POST
src/core/enquiry-handler.js            all business logic, platform-agnostic — shared with general enquiries
src/netlify/functions/patron-enquiry.js thin adapter — HTTP in, handler out
```

**Shared with [`general-enquiry-form_spec.md`](general-enquiry-form_spec.md):** both enquiry types live in one `src/core/enquiry-handler.js`, exporting `handlePatronEnquiry()` and `handleGeneralEnquiry()` as two functions sharing small helpers (`escapeHtml`, honeypot check, the Resend send wrapper) — not a single generic config-driven function. The two enquiries have different required fields, recipients, and tone; forcing them through one parameterised function would just move the difference into a config object instead of removing it. Each keeps its own Netlify function (`patron-enquiry.js` / `general-enquiry.js`) so the client never controls which inbox a submission routes to.

`src/core/` must stay free of Netlify-specific code, matching [`donation-handler.js`](../../src/core/donation-handler.js). Use CommonJS in `core/` and `netlify/functions/` to match the existing files there.

**Placement:** render the form inline on `/patron`, replacing the `btn-patron-contact` CTA inside the existing `.patron-contact` block. No new route.

Rationale: a separate `/patron/enquire` page would give a clean pageview to measure, but adds a click to a high-value, low-volume funnel where friction is the main enemy. Measurement is solved by the custom event below instead.

---

## Form fields

| Field | Name | Type | Required |
|---|---|---|---|
| Full name | `name` | text | ✅ |
| Email | `email` | email | ✅ |
| Organisation / foundation | `organisation` | text | — |
| Phone | `phone` | tel | — |
| Nature of interest | `interest` | select | ✅ |
| Indicative commitment | `commitment` | select | — (see decision 3) |
| Message | `message` | textarea | ✅ |
| **Honeypot** | `website` | text, visually hidden | must stay empty |

`interest` options: Personal giving · Corporate or foundation · Legacy or estate · Exploring — not sure yet

`commitment` options: Prefer to discuss *(default)* · £100k–£250k · £250k–£500k · £500k+

**Honeypot naming matters here.** Main Site uses `company` as its honeypot; this form has a real organisation field, so the trap must be a different name or genuine submissions get silently dropped. Use `website`.

---

## Function behaviour

Mirror the *behaviours* of [`Empowr Main Site/src/netlify/functions/contact.ts`](../../../Empowr%20Main%20Site/src/netlify/functions/contact.ts), reimplemented in the core/adapter split:

1. Reject non-`POST` with 405
2. Parse JSON; malformed body → 400
3. **Honeypot** — if `website` is non-empty, log and return **200 with `{success:true}`** so the bot believes it succeeded and does not retry. Send nothing.
4. Validate required fields present and non-empty → 400 if not
5. `escapeHtml()` every interpolated value before it enters an HTML email body
6. Send internal notification (below)
7. Send prospect acknowledgement (below)
8. 200 `{success:true}` on success; 500 `{error:…}` on send failure — never leak the underlying error text to the client

---

## Emails

Both sent via Resend using the existing `RESEND_API_KEY` already present on the site.

**Sender: `Empowr Heroes <hero@empowrcic.org>`** — the address the donation handler already uses successfully, on the apex domain that is properly authenticated.

> ⚠️ Do **not** use `heroes@hero.empowrcic.org`. `CLAUDE.md`, `memory.md`, and `docs/donation-flow.md` all claim that is the sending address. It is not, and it would not work: `hero.empowrcic.org` has **no MX, no SPF, no DKIM and no DMARC** — verified 2026-08-10. Mail from it would fail outright. Those three documents need correcting separately.

### Internal notification

| | |
|---|---|
| To | `patron@empowrcic.org` (via `PATRON_EMAIL`) |
| Subject | `Founding Patron enquiry: {name}{ — organisation if given}` |
| Reply-To | **the prospect's email** — so replying works normally |
| Body | every submitted field, escaped, with empty optionals omitted |

`Reply-To` is the detail that makes this a drop-in replacement for the mailto. Without it the team has to copy addresses by hand.

### Prospect acknowledgement

| | |
|---|---|
| To | the prospect |
| Subject | `Thank you for your enquiry — Empowr CIC` |
| Body | confirmation of receipt, a realistic response window, and that Founding Patron conversations are handled personally by the leadership team |

Match the tone of `.patron-contact-text` on the page. This is the first touch in a six-figure relationship — it should not read like a ticket receipt.

---

## Environment variables

No new secrets. `RESEND_API_KEY` is already set on the site with `all` context (verified 2026-08-10).

Add one:

| Key | Value | Scope |
|---|---|---|
| `PATRON_EMAIL` | `patron@empowrcic.org` | all contexts |

Read it as `process.env.PATRON_EMAIL` with a hardcoded fallback, matching how `SITE_URL` is handled in [`stripe-webhook.js`](../../src/netlify/functions/stripe-webhook.js). A missing env var must not silently black-hole a six-figure enquiry.

---

## Analytics

Fire **`patron_enquiry_submitted`** on a successful 200, with `interest` and whether `commitment` was disclosed as properties. Do not include name, email, phone, or message — PostHog is running cookieless and must stay free of PII.

This is the site's **first custom event** — currently only `$pageview`, `$autocapture` and `$pageleave` have ever fired. It establishes the pattern that `donation_started` should follow later.

---

## What NOT to copy from Main Site

A cold session told only "copy the Main Site contact form" will get these wrong:

- ❌ CRM routing (`notifyCrm`, `CRM_CONTACT_API_URL`, `CRM_CONTACT_API_KEY`) — see decision 2
- ❌ `SUBJECT_ROUTING` / `OPPORTUNITIES_EMAIL` — single recipient here
- ❌ `sanitiseSource` / `?source=` attribution — Main Site's prospectus mechanism, not needed
- ❌ The `company` honeypot name — collides with a real field here
- ❌ Monolithic single-file function — violates this project's core/adapter rule
- ✅ **Do** copy: honeypot-returns-200, `escapeHtml`, `replyTo`, the acknowledgement-email pattern, the status/error handling shape in `ContactForm.tsx`

---

## Acceptance criteria

- [x] `/patron` renders the form; no `mailto:` CTA remains on the page
- [x] Submitting with the honeypot populated returns 200 and sends no mail — verified locally via `netlify dev`
- [x] Submitting with a required field blank returns 400 and no mail — verified locally
- [x] A valid submission delivers to the chosen inbox **and** to the prospect — verified locally with a real Resend send to `patron@empowrcic.org` on both sides
- [x] Replying to the internal notification addresses the prospect, not `hero@`
- [x] HTML in any field arrives escaped, not rendered
- [x] `patron_enquiry_submitted` appears in PostHog with no PII (`interest` + whether `commitment` was disclosed only)
- [x] `npx tsc --noEmit` passes
- [x] `contact-routing.md` updated with the resolved recipient

---

## Out of scope

Tracked in the 2026-08-10 platform audit, deliberately excluded here:

- The Heroes stack revamp (Tailwind migration, eslint, Next 16.2.6)
- Correcting the `heroes@hero.empowrcic.org` claim in the three docs — do this now, separately; it is a live landmine
- DMARC `p=none` → `p=quarantine` — needs the vali.email reports read first
- `donation_started` instrumentation and the PostHog bot filter fix
