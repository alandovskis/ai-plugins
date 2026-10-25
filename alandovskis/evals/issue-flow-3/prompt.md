---
description: "An approved PR is merged only after an approving human review with required checks passed; failing or pending checks, or no human approval, keep it open."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow; check whether anything can be merged. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. alex is the repo owner (his reviews have authorAssociation OWNER). The flow's open PRs, all opened by the app's bot account, are: #50 (branch issue/41-export-csv), approved by alex on its head commit, all checks passed, mergeable with mergeStateStatus CLEAN; #51 (branch issue/42-tags), approved by alex on its head commit, the required test check failed; #52 (branch issue/43-search), approved by alex on its head commit, required checks still pending; #53 (branch issue/44-sort), no reviews except a comment from alex, checks passed. Nothing new is eligible to pick.
