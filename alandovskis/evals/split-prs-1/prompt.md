---
description: "A mixed branch is grouped by area and turned into one PR per group."
tags: [split-prs]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

My branch has gotten too big for one review. Split it into separate PRs. Repo state (clean working tree, branch is local only, main is up to date):

```
$ git branch --show-current
feature/big-batch
$ git log main..HEAD --oneline
9a8b7c6 docs: document the orders endpoint
5d4e3f2 feat(ui): add order history table
1c2d3e4 feat(api): add GET /orders endpoint
7f8e9d0 feat(api): add order pagination
$ git diff main...HEAD --name-status
M	docs/api.md
A	frontend/src/OrderHistory.tsx
A	backend/src/orders.kt
M	backend/src/pagination.kt
```
