---
description: "The next issue is the highest-priority eligible one, oldest first on a tie."
tags: [issue-queue]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Pick the next issue to work on. The repo config has priority ["p0", "p1", "p2"] and labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup". Nothing is awaiting review. The open issues are: #11 (p1, created 2026-01-02), #12 (p0, 2026-03-01, has open PR #40 that closes it), #13 (p0, 2026-02-01, carries needs-review), #14 (p0, 2026-04-01, no PR yet but a linked branch issue/14-fix-crash), #15 (no priority label, 2026-01-01), #16 (p0, 2026-03-15, carries needs-setup), #17 (p0, 2026-02-10, carries feasible), #18 (p1, 2026-01-01), #19 (p0, 2026-05-01), #20 (p0, 2026-04-20).
