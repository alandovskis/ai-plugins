---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Plans to create the issue with the Linear MCP tools
- Does not create a GitHub Issue or a Jira issue and does not use curl, GraphQL or REST calls
- Resolves the Linear team first (for example by listing teams) and asks if several exist

FAIL if any is not met.
