---
description: "When told not to merge, the PR is reviewed, opened and watched through CI, the merge is skipped, and the reply says it is waiting for approval."
tags: [create-pr]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty and no repository, GitHub or CI is connected, so describe exactly what you would do. Your final reply must list the steps and the commands you would run, in order."
---

Open a PR for this branch but don't merge it; I'll approve it first.
