# Campaign UTM Taxonomy — Spec

**Status:** proposed, not yet applied
**Date:** 2026-07-30
**Applies to:** every link published as part of the Heroes fundraising campaign

---

## What this is and why it exists

A fixed naming convention for the `utm_*` tags on every link pointing at `hero.empowrcic.org`.

It exists because tags are **baked into published links** — an Instagram post, a sent newsletter, a printed QR code. Once published they cannot be retagged. If tagging is improvised per-post, `instagram` / `Instagram` / `ig` / `insta` become four separate, unmergeable rows in PostHog and the campaign becomes unattributable.

**The problem it solves:** as of 2026-07-30, **96% of Heroes traffic reports as `$direct`** — a black hole. That is not really "direct". Instagram in-app browser sessions are already landing on Heroes and sitting in `$direct` because Instagram strips referrers. WhatsApp shares and QR scans behave the same way. UTM tags are the only mechanism that converts that black hole into named channels.

---

## Channel roster

### Active — the campaign core

| Channel | `utm_source` | `utm_medium` | Notes |
|---|---|---|---|
| WhatsApp / direct sharing | `whatsapp` | `direct-share` | Primary channel |
| Instagram | `instagram` | `organic-social` | Split by placement via `utm_content` |
| LinkedIn | `linkedin` | `organic-social` | Provisional |

### Defined but dormant — ready when used

| Channel | `utm_source` | `utm_medium` |
|---|---|---|
| Facebook | `facebook` | `organic-social` |
| Email newsletter | `newsletter` | `email` |
| QR codes at sessions | `qr-sessions` | `qr` |

### Future — reserve the names now, do not use yet

| Channel | `utm_source` | `utm_medium` |
|---|---|---|
| Partner / venue websites | *(partner slug)* | `referral` |
| Paid social | `instagram` / `facebook` | `paid-social` |

### Existing internal convention — already live, do not change

`utm_source=empowr-main` + `utm_medium=internal` (Main Site → Heroes)
`utm_source=empowr-heroes` + `utm_medium=internal` (Heroes → Main Site)

---

## The convention

| Parameter | Means | Rule |
|---|---|---|
| `utm_source` | where the click came from | one value per platform, from the roster above |
| `utm_medium` | type of placement | `organic-social` · `paid-social` · `email` · `qr` · `direct-share` · `internal` · `referral` |
| `utm_campaign` | the push, as one unit | `heroes-launch-2026` across **every** channel |
| `utm_content` | placement within a channel | Instagram only: `bio` · `post` · `story` |

**Rules**

- lowercase, hyphens, no spaces, no capitals — UTM values are case-sensitive
- one `utm_campaign` value for the whole push, so it measures as a unit and still splits by source
- never invent a source at post time — if a channel is not on the roster, add it here first
- all campaign links point at **`/become`**, not `/` — the visitor has already responded to an ask, so land them on the tier chooser rather than the mission page

---

## Ready-made links

Copy these. Do not hand-build tagged URLs at post time — pre-made links are what keeps a convention alive.

**WhatsApp / direct sharing**
```
https://hero.empowrcic.org/become?utm_source=whatsapp&utm_medium=direct-share&utm_campaign=heroes-launch-2026
```

**Instagram — bio link**
```
https://hero.empowrcic.org/become?utm_source=instagram&utm_medium=organic-social&utm_campaign=heroes-launch-2026&utm_content=bio
```

**Instagram — feed post**
```
https://hero.empowrcic.org/become?utm_source=instagram&utm_medium=organic-social&utm_campaign=heroes-launch-2026&utm_content=post
```

**Instagram — story link sticker**
```
https://hero.empowrcic.org/become?utm_source=instagram&utm_medium=organic-social&utm_campaign=heroes-launch-2026&utm_content=story
```

**LinkedIn**
```
https://hero.empowrcic.org/become?utm_source=linkedin&utm_medium=organic-social&utm_campaign=heroes-launch-2026
```

**Facebook** *(dormant)*
```
https://hero.empowrcic.org/become?utm_source=facebook&utm_medium=organic-social&utm_campaign=heroes-launch-2026
```

**Email newsletter** *(dormant)*
```
https://hero.empowrcic.org/become?utm_source=newsletter&utm_medium=email&utm_campaign=heroes-launch-2026
```

**QR code at sessions** *(dormant)*
```
https://hero.empowrcic.org/become?utm_source=qr-sessions&utm_medium=qr&utm_campaign=heroes-launch-2026
```

---

## Channel notes

**WhatsApp** — tagged links survive forwarding. That is a feature: attribution is retained down the share chain. It does mean `whatsapp` should be read as "shared into personal networks", not strictly "sent via WhatsApp". Link previews use the site's Open Graph tags; `og-image.png` is already in place.

**Instagram** — the three placements behave very differently (bio is persistent, post and story are time-boxed). `utm_content` keeps them separate while still rolling up to one `instagram` source.

**QR codes** — encode the full tagged URL in the QR itself. Nobody types it, so length does not matter. Do not print the tagged URL as human-readable text alongside it.

---

## Technical constraint — how to actually query this

Heroes runs `person_profiles: 'identified_only'` with `cookieless_mode: 'always'`, so anonymous visitors have **no person profile**. PostHog's person-level `$initial_utm_*` properties are therefore not reliable here.

UTM values are captured as event properties on the pageview whose URL carried them — **the entry pageview only**. A visitor who lands on `/become?utm_source=instagram` and then navigates to `/checkout` produces a `/checkout` pageview with **no** `utm_source`.

Attribution must therefore be resolved at session level, by taking the session's first pageview:

```sql
SELECT
  src,
  count()                                         AS sessions,
  countIf(converted = 1)                          AS donations,
  round(100.0 * countIf(converted = 1) / count(), 2) AS conv_pct
FROM (
  SELECT
    properties.$session_id                                    AS sid,
    coalesce(argMin(properties.utm_source, timestamp), '(direct)') AS src,
    max(startsWith(properties.$pathname, '/thankyou'))        AS converted
  FROM events
  WHERE event = '$pageview'
    AND timestamp >= now() - INTERVAL 30 DAY
    AND properties.site_id = 'empowr-heroes'
  GROUP BY sid
)
GROUP BY src
ORDER BY sessions DESC
```

This `argMin`-over-session shape is verified working against the live PostHog project. Add the standard bot filter from `/posthog-analyse` before using it for reporting.

---

## Dependencies

| Blocker | Why it blocks |
|---|---|
| `capture_pageview: 'history_change'` | Heroes currently sets `capture_pageview: true`, which disables client-side route-change tracking. `/thankyou` still records (hard load from Stripe), so the conversion query above works either way — but every intermediate funnel step (`/become` → `/checkout`) is invisible until this is fixed. |
| Stripe post-payment redirect | Never exercised — zero completed donations to date. If the 6 Payment Links have no redirect to `/thankyou`, the conversion query returns zero regardless of real donations. **Verify before campaign launch.** |
| Campaign links land on `/become` | Requires no code change for campaign links (they are authored per this spec), but the Main Site "Support Us" CTA still points at `/` and should be repointed. |

---

## Risks

- **Case drift.** `Instagram` and `instagram` are different sources forever. Publish from the ready-made links above, never retyped.
- **Untagged sharing.** Anything shared without tags falls back into `$direct` and is unrecoverable. Accept a residual `$direct` share; do not try to infer it.
- **Volume.** At current traffic (~70 pageviews / 30 days) no channel will reach statistical significance quickly. Read the first weeks directionally, not as a verdict on any channel.
