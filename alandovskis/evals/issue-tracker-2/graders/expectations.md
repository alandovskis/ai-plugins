---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Says that issues are tracked in Jira or GitHub Issues and does not create a Linear issue
- Proposes filing it in the project's tracker instead, or asks which of the two the project uses

FAIL if any is not met.
