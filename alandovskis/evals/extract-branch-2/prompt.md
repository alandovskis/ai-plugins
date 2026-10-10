---
description: "An existing commit is cherry-picked to a new branch and removed from the original."
tags: [extract-branch]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

One of my commits on this branch should have been its own branch. Move the logging commit onto a new branch off the base branch and take it off this one. State:

```
$ git branch --show-current
feature/export-csv
$ git status --short
$ git log --oneline develop..HEAD
d4e5f6a feat(export): add csv column selection
b2c3d4e fix(logging): redact tokens in request logs
a1b2c3d feat(export): add csv export endpoint
```

The working tree is clean.
