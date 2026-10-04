---
description: "The assistant respects the explicit request but flags the deviation from the default stack."
tags: [web-stack]
max_turns: 20
timeout_seconds: 600
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
allowed_tools: [Read, Glob, Grep, Skill]
---

I need a quick React frontend for this admin tool, set it up.
