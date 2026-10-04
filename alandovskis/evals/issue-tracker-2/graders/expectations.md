---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Says that issues are tracked in Jira and proposes creating it there instead
- Does not create a GitHub Issue unless it first confirms this with the user

FAIL if any is not met.
