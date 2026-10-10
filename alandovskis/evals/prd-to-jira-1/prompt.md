---
description: "An Epic and one linked Story per requirement are created in the given Jira project."
tags: [prd-to-jira]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Create Jira tickets from the PRD at https://acme.atlassian.net/wiki/spaces/ENG/pages/424242/PRD+Dark+Mode. Use the MYAPP project and the defaults for everything else. I can't answer questions; here is the page content. Describe each call you would make, and show the final report using illustrative keys (MYAPP-1 for the Epic, MYAPP-2 onward for the Stories):

```markdown
# Dark Mode

## Objective
Give users a dark colour theme to reduce eye strain at night.

## Requirements
| Requirement | User story | Importance | Jira Issue | Notes |
|---|---|---|---|---|
| Theme toggle | As a user, I can switch between light and dark themes from settings. | Must | | Toggle in Settings > Appearance |
| Remember choice | As a user, my theme choice persists across sessions. | Should | | Store per account |
| Follow system | As a user, I can choose to follow my operating system theme. | Could | | |
```
