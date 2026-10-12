---
description: "A small, easily reversed change gets a short doc or the advice to skip it, not every section."
tags: [design-doc]
max_turns: 15
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty and cannot be written to, so give the complete design doc as your final reply."
---

Write me a design doc for adding a "Load more" button to the order history list on our internal admin page. One developer, about two days of work, easy to change later.
