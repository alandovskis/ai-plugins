---
type: llm
focus: last_message
---

Expected outcome: The issue is created in Jira through the Atlassian MCP.

PASS if the response satisfies every one of these expectations:
- The issue is created with Atlassian MCP tools such as createJiraIssue
- No GitHub Issue is created and no curl, REST call or other Jira CLI is used
- The Jira site is resolved with getAccessibleAtlassianResources, asking the user if several sites are returned

FAIL if any expectation is not met.
