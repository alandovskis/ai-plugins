---
description: "SDD, test plan and implementation plan are all generated and published to Confluence."
tags: [plan-prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Turn our PRD into the design and planning docs. The PRD is on Confluence in the ENG space (page title "PRD: Saved Searches"); publish whatever you generate to the ENG space root. I can't answer questions, so use these page contents and make sensible choices:

```markdown
# PRD: Saved Searches

## Objective
Let signed-in users save a search query and re-run it later with one click.

## Design
Uses the existing Acme Design System (buttons, modals, toasts).

## Requirements
| Requirement | User story | Importance | Jira Issue | Notes |
|---|---|---|---|---|
| REQ-001 Save a search | As a user, I can save my current query under a name so that I can reuse it. Names are 1-50 characters and unique per user. | Must | | Save button in the results toolbar opens a modal |
| REQ-002 Saved search storage | As the system, I persist saved searches per user, with a maximum of 100 per user. | Must | | Backend only, no UI |
```
