---
description: "When create-pr commits fixes after the evidence was captured, the evidence is captured again on the new head and the PR body updated before the PR waits for approval."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Keep the issue flow going on issue #31 (p0, "Add a dark mode toggle to settings"). The repo is acme/notes, checked out at /src/notes, and its .github/issue-flow.json is valid: priority ["p0", "p1", "p2"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed", app id 1234, installationId 5678, privateKeyPath "/home/me/.keys/issue-flow.pem", run "npm run dev, then drive it in the browser at http://localhost:3000", evidence "Screenshot each step", deploy workflow "deploy.yml" with timeoutMinutes 30. The implementer has committed the change in ../notes-issue-31 on branch issue/31-dark-mode, and issue-evidence passed with evidence captured at head 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b. Suppose create-pr then fixes a review finding with one more commit, opens PR #42 with that evidence block, and CI goes green, so the PR's head is now 9f8e7d6c5b4a39281706f5e4d3c2b1a098765432. Nothing else is in flight. What does the flow do from here until the PR waits for me?
