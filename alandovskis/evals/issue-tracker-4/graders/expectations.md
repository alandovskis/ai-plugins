---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The reference #123 appears in the commit message and the PR title (or the PR body closes it)
- Does not use a Jira key or the Atlassian MCP

FAIL if any is not met.
