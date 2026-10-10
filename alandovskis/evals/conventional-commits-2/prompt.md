---
description: "No commits are made while a merge conflict is in progress."
tags: [conventional-commits]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Commit my changes please. I just ran `git pull` and this is what git says:

```
$ git status
On branch feature/billing
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   src/billing/invoice.ts

Changes to be committed:
	modified:   src/billing/tax.ts
```
