---
type: llm
focus: last_message
---

Expected outcome: The assistant asks which site to use.

PASS if the response satisfies every one of these expectations:
- The assistant asks the user which site to use instead of taking the first result
- No Jira issue is created before the site is confirmed

FAIL if any expectation is not met.
