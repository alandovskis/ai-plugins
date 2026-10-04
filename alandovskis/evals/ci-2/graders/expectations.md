---
type: llm
focus: last_message
---

Expected outcome: The assistant does not silently introduce a non-GitHub CI system.

PASS if the response satisfies every one of these expectations:
- The assistant recognises the user explicitly asked for GitLab CI and either honours that request or confirms it
- It does not substitute GitHub Actions without saying so
- If the project already used another CI system, it asks before migrating instead of rewriting

FAIL if any expectation is not met.
