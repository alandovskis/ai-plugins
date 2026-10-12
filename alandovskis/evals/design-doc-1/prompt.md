---
description: "A design doc for a complex project is drafted with the article's sections and reviewed by three parallel lens subagents."
tags: [design-doc]
max_turns: 25
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty and cannot be written to, so give the complete design doc as your final reply."
---

Write a design doc for replacing our nightly CSV export with a streaming export service. Three teams consume the export, it has to run in production for years, and finance data is in it. Today the job takes 6 hours and fails about once a week.
