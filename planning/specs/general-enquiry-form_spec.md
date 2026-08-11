# General Enquiry Form — Spec

**Status:** applied 2026-08-11
**Date:** 2026-08-11
**Applies to:** a new `/contact` route on `hero.empowrcic.org` — general questions about tiers, giving, membership, and press. Not the Founding Patron path — see [`patron-enquiry-form_spec.md`](patron-enquiry-form_spec.md).

---

## What this is and why it exists

Replace the `mailto:hero@empowrcic.org` CTA on `/tiers` ("Contact Us →", [`src/app/tiers/page.tsx:57`](../../src/app/tiers/page.tsx#L57)) with a submitted form on a new `/contact` page, delivering through Empowr's own authenticated Resend path.

**Same spam vector as the patron enquiry, same fix.** The link carries no subject and no body — `mailto:hero@empowrcic.org` — so a message composed on the visitor's own mail client, with a blank subject, from an unknown consumer domain with no prior correspondence, reaches a Gmail-filtered Google Workspace inbox. That is a textbook spam classification, verified for the patron case in the DNS check on 2026-08-10 (see the patron spec) and structurally identical here — same MX, same SPF, same inbox family. A form inverts the direction exactly as it does there: the visitor submits over HTTPS, the notification originates from Empowr's own verified domain.

---

## Relationship to the patron enquiry form

Two different forms, deliberately not one shared component — see the **Architecture** section of the patron spec for why (different required fields, different recipient, different tone; a generic form would just move the difference into config).

What *is* shared: `src/core/enquiry-handler.js` holds both `handlePatronEnquiry()` and `handleGeneralEnquiry()`, plus the small helpers both need (`escapeHtml`, honeypot check, the Resend send wrapper). Build whichever of the two lands second by adding to that file, not duplicating it.

| | Patron | General |
|---|---|---|
| Trigger | £100k+ prospects, very low volume | Anyone with a question, potentially higher volume |
| Placement | Inline on `/patron` (no new route) | New `/contact` page (this spec) |
| Tone | High-touch, personal, first touch in a six-figure relationship | Straightforward support/FAQ tone |
| CRM | No — email only (decision 2 in patron spec) | No — same reasoning, lower stakes still |

---

## Placement

**New route: `src/app/contact/page.tsx`.**

Unlike the patron form (deliberately kept off a dedicated route to minimise friction on a rare, high-value path), a general enquiry benefits from a stable, linkable URL — it's referenced from `/tiers`, and potentially the footer, without needing to carry a whole form inline on a page that isn't really about contacting anyone.

**Links to add:**
- `/tiers` — replace the `mailto:` CTA at line 57 with `<Link href="/contact">`
- `Footer.tsx` — add a "Contact" link to the `FooterSection heading="Find Us"` (or a new section) so the form is reachable from every page, not just `/tiers`

**Not added to `Nav.tsx`.** The main nav (`Our Mission` / `Become a Hero` / `Hero Tiers`) is conversion-focused; a support link competing for attention there works against the funnel. Footer is the right shelf for it. Revisit if `/contact` traffic shows people are hunting for it.

---

## Form fields

| Field | Name | Type | Required |
|---|---|---|---|
| Full name | `name` | text | ✅ |
| Email | `email` | email | ✅ |
| Topic | `topic` | select | ✅ |
| Message | `message` | textarea | ✅ |
| **Honeypot** | `company` | text, visually hidden | must stay empty |

`topic` options, defined in `src/lib/enquiry-topics.ts` (new — see **Future extension point** below):
- General question about tiers or giving
- Membership or billing question
- Press or media enquiry
- Something else

**Honeypot uses `company`** (Main Site's convention) rather than `website` — this form has no organisation field to collide with, unlike the patron form which reserves `company` for that reason.

No phone field, no organisation field — per your answer, kept to the minimum plus the topic dropdown for triage.

---

## Future extension point — Calendly / scheduling (not built now)

You've flagged wanting to eventually route some enquiries into a Calendly booking flow (Zoom/Google Meet). Nothing here builds that — but the topic taxonomy lives in its own file (`src/lib/enquiry-topics.ts`) rather than inline in the form component specifically so that later, a specific topic can branch into a scheduling embed without renaming or restructuring anything that ships now. Don't add a "Book a call" option today that doesn't actually book a call — a non-functional option is worse than no option. When you're ready to build that, it's a new topic value plus a conditional render in `GeneralEnquiryForm.tsx`, not a rewrite.

---

## Architecture

```
src/lib/enquiry-topics.ts               topic list — shared type + labels, own file per the extension point above
src/components/GeneralEnquiryForm.tsx   client component — form state, validation, POST
src/core/enquiry-handler.js             handlePatronEnquiry() + handleGeneralEnquiry() — see patron spec
src/netlify/functions/general-enquiry.js thin adapter — HTTP in, handler out
```

---

## Function behaviour

Identical shape to the patron form's function behaviour (see that spec) — same honeypot-returns-200 pattern, same escaping, same status codes. The only differences are the recipient, the required-field list, and the email copy.

---

## Emails

Both sent via Resend using the existing `RESEND_API_KEY`.

**Sender: `Empowr Heroes <hero@empowrcic.org>`** — same address the donation handler and cancellation notifications already use successfully.

### Internal notification

| | |
|---|---|
| To | `hero@empowrcic.org` (via `GENERAL_EMAIL`, fallback `hero@empowrcic.org`) |
| Subject | `General enquiry: {name} — {topic}` |
| Reply-To | the visitor's email |
| Body | name, email, topic, message — escaped |

### Visitor acknowledgement

| | |
|---|---|
| To | the visitor |
| Subject | `Thanks for reaching out — Empowr Heroes` |
| Body | confirmation of receipt and a realistic response window. Lighter register than the patron acknowledgement — this is a support reply, not the first touch in a six-figure relationship. |

---

## Environment variables

No new secrets. `RESEND_API_KEY` already set with `all` context.

Add one, matching the `PATRON_EMAIL` pattern from the patron spec:

| Key | Value | Scope |
|---|---|---|
| `GENERAL_EMAIL` | `hero@empowrcic.org` | all contexts |

Read as `process.env.GENERAL_EMAIL` with a hardcoded `hero@empowrcic.org` fallback — same reasoning as the patron spec: a missing env var must not silently black-hole an enquiry.

---

## Analytics

Fire **`general_enquiry_submitted`** on a successful 200, with `topic` as the only property. No name, email, or message — PostHog runs cookieless and must stay free of PII, same rule as the patron spec's `patron_enquiry_submitted`.

---

## What NOT to copy from Main Site or the patron spec

- ❌ CRM routing — same reasoning as the patron spec, lower stakes still
- ❌ `commitment` / indicative-value field — that's patron-specific qualification, meaningless here
- ❌ `organisation` / `phone` fields — you chose to keep this one minimal
- ❌ The `website` honeypot name — that's the patron form's; this one uses `company`
- ✅ **Do** copy: honeypot-returns-200, `escapeHtml`, `replyTo`, the acknowledgement-email pattern, the shared `enquiry-handler.js` helpers

---

## Acceptance criteria

- [x] `/contact` exists, renders the form
- [x] `/tiers` "Contact Us →" links to `/contact` instead of `mailto:`
- [x] Footer links to `/contact`
- [x] Submitting with the honeypot populated returns 200 and sends no mail — verified locally via `netlify dev`
- [x] Submitting with a required field blank returns 400 and no mail — verified locally
- [x] A valid submission delivers to `hero@empowrcic.org` **and** to the visitor — verified locally with a real Resend send to `hero@empowrcic.org` on both sides
- [x] Replying to the internal notification addresses the visitor, not `hero@`
- [x] HTML in any field arrives escaped, not rendered
- [x] `general_enquiry_submitted` appears in PostHog with only `topic` as a property
- [x] `npx tsc --noEmit` passes
- [x] `contact-routing.md` updated — `hero@empowrcic.org` already listed there for donations; add that it now also receives general enquiries via this form
- [x] `_config/registry/env-vars.md` updated with `GENERAL_EMAIL`

**Also done, not in the original checklist:** `/contact` added to `sitemap.ts` (real landing page, not a transient flow step, unlike `/checkout`/`/thankyou`).

---

## Out of scope

- Calendly / video-call scheduling — see **Future extension point** above
- Everything the patron spec already excludes (stack revamp, DMARC, `donation_started` instrumentation) — unrelated to this feature
