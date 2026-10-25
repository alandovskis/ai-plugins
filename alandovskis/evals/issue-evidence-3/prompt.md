---
description: "When the evidence reviewer finds the evidence never shows the changed behaviour, the PR must not be opened."
tags: [issue-evidence]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Capture evidence for issue #52, "Show an error banner when login fails", now implemented in the worktree /work/issue-52 on branch issue-52-login-error. The repo config has run "npm run dev, then open http://localhost:3000 in a browser" and evidence "Take a screenshot of each step with the browser". The repository is acme/webapp. Suppose the evidence-reviewer agent returns the gap: "No capture shows the banner; every screenshot is the login form before submit." Report what you do next.
