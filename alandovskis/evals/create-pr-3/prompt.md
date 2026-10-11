---
description: "A blocker found in review is fixed before the PR is opened, and unfixed findings go in the PR description."
tags: [create-pr]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty and no repository, GitHub or CI is connected, so describe exactly what you would do. Your final reply must list the steps and the commands you would run, in order."
---

Ship this branch: open the PR and merge it once CI passes. The branch diff is below.

```diff
+def find_user(db, request):
+    return db.query("SELECT * FROM users WHERE name = '" + request.args["name"] + "'")
```
