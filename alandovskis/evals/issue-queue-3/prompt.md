---
description: "An issue whose needs-review label was removed is eligible again and is judged."
tags: [issue-queue]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Pick the next issue to work on. The repo config has priority ["p0", "p1"] and labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup". Nothing is awaiting review or being implemented. The only open issue is #7 (p0). It used to carry needs-review, but a maintainer removed that label after answering the questions on it. It has no PR or branch.
