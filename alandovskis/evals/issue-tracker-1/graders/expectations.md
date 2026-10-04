---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Plans to create a Jira issue with the Atlassian MCP tools (for example createJiraIssue)
- Does not create a GitHub Issue and does not use curl, REST calls or a Jira CLI
- Resolves the Jira site first (for example getAccessibleAtlassianResources) and asks if several sites exist

FAIL if any is not met.
