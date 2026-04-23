# planning/ — Pre-Code Thinking

This workspace is for thinking before building. Nothing here is deployed. Nothing here is code.

---

## What lives here

| Folder | Purpose |
|---|---|
| `specs/` | Feature specifications — written before implementation starts |
| `decisions/` | Architectural decision records (ADRs) — why past choices were made |

---

## When to use this workspace

- Before implementing any new feature, write a spec in `specs/`.
- When a significant architectural choice is made (a library, a pattern, an infrastructure decision), record it in `decisions/`.

---

## Spec format

File naming: `feature-name_spec.md`

A spec should answer:
- What is this feature and why does it exist?
- What does it do from the user's perspective?
- What are the edge cases?
- What files will be created or changed?
- What dependencies or risks are involved?

---

## Decision record format

File naming: `YYYY-MM-DD-decision-title.md`

A decision record should answer:
- What was the decision?
- What were the alternatives considered?
- Why was this option chosen?
- What are the trade-offs?
