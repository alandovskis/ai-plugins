---
description: "Uncommitted changes and pushed commits are handled before splitting."
tags: [split-prs]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Break my current branch into smaller PRs. Repo state:

```
$ git branch --show-current
feature/reports
$ git status --short
 M backend/src/reports.kt
?? scratch/notes.txt
$ git log main..HEAD --oneline
e1f2a3b feat(ui): add report filters
c4d5e6f feat(api): add report export
$ git status -sb | head -1
## feature/reports...origin/feature/reports
```

Both commits are already pushed to origin/feature/reports.
