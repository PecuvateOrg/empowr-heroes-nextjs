# docs/ — Process Documentation

This workspace holds operational documentation — how the system works, not how the code is structured.

---

## What lives here

| File | Purpose |
|---|---|
| `tech-stack.md` | Full tech stack, infrastructure, design system (colors, typography, layout), architectural decisions |
| `donation-flow.md` | End-to-end donation flow: Stripe → webhook → Resend → Notion |
| `email-guide.md` | How the email system works — template structure, testing, updating copy |

---

## Audience

These docs are written for:
- A developer (or agent) picking up the project cold
- Future debugging — understanding intent, not just implementation

---

## What does NOT live here

- Code — that lives in `src/`
- Operational runbooks (how to do something) — those live in `ops/runbooks/`
- Architecture decisions — those live in `planning/decisions/`
- Recent session notes — those live in `../../workspace-docs/empowr-heroes-nextjs/DEVLOG.md`, in the private hub
