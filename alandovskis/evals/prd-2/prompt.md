---
description: "The Objective stays outcome-focused, unknowns are dashes, and save/publish is offered."
tags: [prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed using the details in the user message. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every document you would create."
---

Create a PRD for a bulk CSV export on the reports page. Analysts currently copy tables into spreadsheets by hand. I think we should add a Celery worker that writes the CSV to S3 and returns a presigned URL, behind a new /v2/export endpoint. Feature owner is Mia Chen (PM). Status Draft. I do not have a ship date, milestones, designs, metrics or any open questions yet. One requirement for now: analysts can export the current report as CSV (Must).
