---
description: "After a merge the flow finds the run for the merge commit, watches it up to deploy.timeoutMinutes, and on failure labels the PR, reopens the issue and comments with the run link, without trying a fix."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Keep the issue flow going. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. PR #80 (branch issue/31-dark-mode, closes #31) has just been squash-merged; its merge commit is 9f8e7d6c. Suppose the deploy.yml run started by that merge commit is run 4242 at https://github.com/acme/notes/actions/runs/4242 and it fails after 12 minutes in the publish step. What does the flow do from the merge onwards?
