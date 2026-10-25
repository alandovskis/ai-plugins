---
description: "A dismissed approval, or a commit pushed after the approval, returns the PR to waiting and it is not merged."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow and merge whatever is ready. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. alex is the repo owner (his reviews have authorAssociation OWNER). The flow's open PRs are: #70 (branch issue/50-print), alex approved it yesterday but then dismissed his review, so its latest review state from alex is DISMISSED; checks passed, mergeable. #71 (branch issue/51-share), alex approved it at commit a1b2c3d, then a new commit e4f5a6b was pushed to the branch, which is now the head; checks passed, mergeable. Nothing new is eligible to pick.
