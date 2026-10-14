---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Reports findings under all three lenses (clarity, conciseness and consistency), with `No findings.` for a lens that has none, rather than only clarity or only one issue
- Flags the 13-month versus 12-month archive age, or the 4-hour restore goal versus the 24-hour restore SLO, under consistency
- Flags the design changing the ledger write path, which the non-goals exclude, under consistency
- Flags table partitioning rejected without a reason
- Does not rewrite the draft or return an edited version of it

FAIL if any is not met.
