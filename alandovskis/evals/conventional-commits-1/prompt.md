---
description: "Unrelated changes are committed as separate conventional commits."
tags: [conventional-commits]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Commit everything I have. Here is the repo state, nothing is staged:

```
$ git status --short
 M .vimrc
 M .gitconfig
 M package.json
 M package-lock.json
 M src/search/index.ts
?? tests/search/index.test.ts
```

`.vimrc` switches to 2-space indent, `.gitconfig` sets rebase as the default pull strategy, `package.json` and `package-lock.json` bump eslint from 8 to 9, and `src/search/index.ts` plus its new test add a full-text index on user email.
