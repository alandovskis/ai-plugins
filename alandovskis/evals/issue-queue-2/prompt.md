---
description: "With 3 PRs awaiting review the queue is paused and nothing is picked."
tags: [issue-queue]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Pick the next issue to work on. The repo config has priority ["p0", "p1"]. The bot has three open PRs (#31, #32, #33), none merged, with review decisions REVIEW_REQUIRED, CHANGES_REQUESTED and REVIEW_REQUIRED. Open issue #50 is labelled p0 and is otherwise eligible.
