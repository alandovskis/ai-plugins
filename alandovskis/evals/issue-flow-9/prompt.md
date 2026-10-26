---
description: "A PR the human closed is not recreated and the issue is reported, a PR the flow closed itself does not block re-queueing, and interrupted work resumes."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Start the issue flow again; the last session was closed mid-run. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. Issue #35 (p0) is open and carries the feasible label; its PR #85 (branch issue/35-export) was closed without merging by alex, and the branch issue/35-export still exists on origin. Issue #36 (p0) is open and carries the feasible label, with no issue/36-* branch and no PR of any kind. Issue #37 (p0) is open with no other labels: the flow escalated it last week, closing its red PR #87 (branch issue/37-sync, since deleted) after posting the comment "<!-- issue-flow: closed-by-flow --> Closed by issue-flow: CI kept failing" (REST: user.login acme-flow, user.type Bot, the same login as PR #87's author), and labelled it needs-review; alex has now answered and removed needs-review. No PRs are open and no other issues are eligible.
