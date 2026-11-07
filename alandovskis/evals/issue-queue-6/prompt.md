---
description: "A person's issue/* branch with their own open PR does not take an implementing slot, and its issue is left to that person."
tags: [issue-queue]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Pick the next issue to work on. The repo config has priority ["p0", "p1"] and labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed". Origin has three issue/* branches: issue/8-search and issue/9-sort, which the flow pushed and which have no PR yet; and issue/7-fix, on which alex (REST user.type User) opened PR #17, still open. There are no other PRs. The open issues, carrying only their priority labels, are: #7 (p0), #8 (p0), #9 (p0) and #12 (p1, no PR or branch).
