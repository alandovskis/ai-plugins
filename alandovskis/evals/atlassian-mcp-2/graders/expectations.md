---
type: llm
focus: last_message
---

Expected outcome: The assistant diagnoses a missing or unauthenticated Atlassian MCP and fixes it.

PASS if the response satisfies every one of these expectations:
- The assistant checks whether an atlassian MCP server is configured and authenticated before changing anything
- It adds the server or re-authenticates as appropriate
- It verifies by listing accessible resources before resuming the Jira task

FAIL if any expectation is not met.
