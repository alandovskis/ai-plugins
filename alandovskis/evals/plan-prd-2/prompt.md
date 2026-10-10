---
description: "The test plan includes a performance case only when the requirement states a measurable target."
tags: [plan-prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Generate the planning docs from this PRD (Confluence, ENG space, "PRD: Report Export"). Publish them to the ENG space root. Use the content below.

```markdown
# PRD: Report Export

## Objective
Let analysts export a report as CSV.

## Requirements
| Requirement | User story | Importance | Jira Issue | Notes |
|---|---|---|---|---|
| REQ-001 CSV export | As an analyst, I can export a report of up to 100,000 rows as CSV. The export must complete in under 5 seconds at p95 with 50 concurrent users. | Must | | Download button on the report page |
| REQ-002 Export audit log | As an auditor, every export is recorded with the user, report ID and timestamp. | Should | | No latency target |
```
