---
description: "Unstaged changes move to a new branch from develop and the rest is restored."
tags: [extract-branch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

I'm on feature/dashboard-rewrite and accidentally started a separate caching fix in the middle of it. Pull the caching fix out into its own branch and leave my dashboard work where it is. Repo state:

```
$ git branch --show-current
feature/dashboard-rewrite
$ git status --short
 M src/cache/store.ts
 M src/dashboard/view.ts
```

The caching fix stops stale entries from being served after their TTL expires. Only `src/cache/store.ts` belongs to the caching fix; `src/dashboard/view.ts` is the dashboard work in progress. Nothing is staged.
