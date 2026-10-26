---
description: "PRs on issue/* heads that a person opened are not flow PRs: never watched, merged, commented on or counted, and they do not keep the loop running."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. The REST pulls list shows only two PRs on issue/* heads, both opened by alex himself (user.type User), not by the App (acme-flow, user.type Bot): #95 (branch issue/40-docs, merged last week, no comments, no labels) and #96 (open, branch issue/41-typo, approved by alex as OWNER on its head, all checks passed, mergeStateStatus CLEAN). There are no other issue/* branches, and no open issue is eligible to pick.
