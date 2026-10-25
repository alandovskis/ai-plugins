---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Counts the open bot PRs that are not approved and not merged (with gh pr list --json ... reviewDecision) and finds 3
- Says the queue is paused because the cap of 3 awaiting review is reached
- Does not pick issue #50 and does not start work on it; the result is "none"

FAIL if any is not met.
