---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Picks issue #7 as the next issue
- Treats the removed needs-review label as clearing the skip: does not skip #7 for having carried that label earlier
- Says #7 is to be judged (feasibility is assessed again) rather than assumed feasible or implemented directly

FAIL if any is not met.
