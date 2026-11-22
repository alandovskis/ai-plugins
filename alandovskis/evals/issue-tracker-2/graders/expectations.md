---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Says that issues are tracked in Jira, GitHub Issues or Linear and does not create a GitLab issue
- Proposes filing it in the project's tracker instead, or asks which of the three the project uses

FAIL if any is not met.
