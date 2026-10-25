---
description: "An approval from an outside contributor or a bot does not cause a merge; only an owner, member or collaborator's approval does."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow and merge whatever is ready. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. The flow's open PRs, all opened by the app's bot account acme-flow[bot], each have every check passed and mergeStateStatus CLEAN: #90 (branch issue/60-tags), whose only review is APPROVED on its head commit by randomdev with authorAssociation CONTRIBUTOR; #91 (branch issue/61-sync), whose only review is APPROVED on its head commit by helper-app[bot] with authorAssociation COLLABORATOR; #92 (branch issue/62-print, head commit c0ffee1), whose only review is APPROVED on its head commit by alex with authorAssociation OWNER. Nothing new is eligible to pick.
