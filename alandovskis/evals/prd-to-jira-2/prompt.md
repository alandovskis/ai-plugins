---
description: "Rows that already have a Jira key and Won't rows are skipped by default."
tags: [prd-to-jira]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Generate Jira issues from the PRD at https://acme.atlassian.net/wiki/x/AbCdEf in project MYAPP. Use the defaults for everything else; I can't answer questions. The page content is:

```markdown
# Bulk Import

## Objective
Let admins import users from a CSV file.

## Requirements
| Requirement | User story | Importance | Jira Issue | Notes |
|---|---|---|---|---|
| Upload CSV | As an admin, I can upload a CSV of users. | Must | | Max 5 MB |
| Validate rows | As an admin, I see row-level validation errors. | Must | MYAPP-17 | Already ticketed |
| Import history | As an admin, I can see past imports. | Should | | |
| Scheduled imports | As an admin, I can schedule imports. | Won't | | Next release |
```
