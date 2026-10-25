---
description: "An approved PR that conflicts with main after another merge is rebased and re-checked, and escalated with needs-review and a comment when the conflict cannot be resolved."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Keep the issue flow going. The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. PR #59 just merged. Two other flow PRs were approved by alex on their head commits and now conflict with main: #60 (branch issue/45-avatars, worktree ../notes-issue-45), whose rebase onto main resolves cleanly with only an import-order conflict and changes no behaviour; and #61 (branch issue/46-autosave, worktree ../notes-issue-46), where #59 rewrote the same save function in an incompatible way so the rebase conflict cannot be resolved without a design decision. What does the flow do with each?
