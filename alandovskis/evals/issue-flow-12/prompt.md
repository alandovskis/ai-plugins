---
description: "Leftover branches of closed or escalated issues are not in flight and not resumed, and a resumed issue judged not feasible is cleaned up like an escalation."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Start the issue flow again; the last session was closed mid-run. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. There are no PRs of any kind. Origin has three branches the flow pushed, none with a PR: issue/20-cache, whose issue #20 is open and carries needs-review; issue/21-zip, whose issue #21 is closed; and issue/22-log, whose issue #22 (p0) is open and carries feasible. Suppose that judging #22 again now returns infeasible, with the question "Which log format should the export use?". No other issue is eligible.
