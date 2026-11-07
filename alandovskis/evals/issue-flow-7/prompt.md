---
description: "After a failed deploy, the next pass neither picks nor resumes the reopened issue."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow again. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. On the last run, PR #80 (branch issue/31-dark-mode, now deleted) was squash-merged and its deploy failed, so the flow labelled #80 deploy-failed, posted its App-authored "<!-- issue-flow: deploy-failed -->" comment on #80, and reopened issue #31. Issue #31 is open again and carries the labels p0 and feasible (not deploy-failed); it has no issue/31-* branch and no open PR. The only other open issue is #33 (p1), with no PR or branch. No PRs are open and nothing is being implemented.
