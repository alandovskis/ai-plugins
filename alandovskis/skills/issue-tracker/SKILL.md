---
name: issue-tracker
description: Issues are tracked in Jira (Atlassian MCP) or GitHub Issues (gh), whichever the project uses. Use whenever filing, finding, updating, linking or commenting on an issue, bug, ticket, task, story or epic, or when a plan or document says where work is tracked.
---

# Issue tracker: Jira or GitHub Issues

Issues are tracked in **Jira** or **GitHub Issues**, depending on the project. Use the one the project already uses (look at its docs, existing issue keys, branch and PR names). If it is unclear, ask the user. Do not use or suggest another tracker (Linear, GitLab issues, TODO files), even if the user asks for one by name: say that issues are tracked in Jira or GitHub Issues and file it in the project's tracker instead.

## Jira

- Use the **Atlassian MCP** tools for all Jira work: creating, reading, searching, updating, linking and commenting. Do not use the Jira web UI, raw REST calls or other Jira CLIs.
- Resolve the site with `getAccessibleAtlassianResources` first. If it returns several sites or the project is unclear, ask the user rather than guessing.
- If no Atlassian tools are available, say so and ask the user to connect the Atlassian MCP.
- Reference issues by their Jira key (for example `ABC-123`) in commits, branches, pull requests and documents.

## GitHub Issues

- Use the **`gh`** CLI (`gh issue create`, `view`, `list`, `edit`, `comment`) for all GitHub issue work. Do not use the web UI or raw REST calls.
- If `gh` is missing or not authenticated, say so and ask the user to fix it.
- Reference issues by number (for example `#123`) in commits, branches, pull requests and documents.

Confirm before bulk or destructive changes in either tracker.
