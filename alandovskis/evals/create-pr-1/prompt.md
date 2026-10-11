---
description: "The branch is reviewed and fixed before the PR is opened, then CI is watched and the PR merged."
tags: [create-pr]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty and no repository, GitHub or CI is connected, so describe exactly what you would do. Your final reply must list the steps and the commands you would run, in order."
---

My branch feature/export-csv is finished and committed. Create a PR for it and get it merged.
