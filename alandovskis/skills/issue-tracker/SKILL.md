---
name: issue-tracker
description: Jira is the issue tracker, accessed through the Atlassian MCP. Use whenever filing, finding, updating, linking or commenting on an issue, bug, ticket, task, story or epic, or when a plan or document says where work is tracked.
---

# Issue tracker: Jira

Issues are tracked in **Jira**. Do not create GitHub Issues, and do not suggest another tracker (Linear, GitLab issues, TODO files) unless the user asks.

- Use the **Atlassian MCP** tools for all Jira work: creating, reading, searching, updating, linking and commenting. Do not use the Jira web UI, raw REST calls or other Jira CLIs.
- Resolve the site with `getAccessibleAtlassianResources` first. If it returns several sites or the project is unclear, ask the user rather than guessing.
- If no Atlassian tools are available, say so and ask the user to connect the Atlassian MCP. Do not fall back to GitHub Issues.
- Reference issues by their Jira key (for example `ABC-123`) in commits, branches, pull requests and documents.
- Confirm before bulk or destructive changes to Jira.
