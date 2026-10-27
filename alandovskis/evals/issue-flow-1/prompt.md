---
description: "The happy path runs in order: validate the config, mint the token, pick, judge, worktree, implement, evidence, a PR that stops before merging, then waiting for approval."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow on this repo. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. No PRs are open and nothing is being implemented. The only eligible issue is #31 (p0) "Add a dark mode toggle to settings". Suppose the feasibility judge returns feasible, the implementer commits the change, the evidence reviewer passes the screenshots, and CI on the new PR goes green. Walk through the whole run up to the point where it waits for me.
