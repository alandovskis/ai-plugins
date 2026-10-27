---
description: "An incomplete config stops the whole flow before anything else, with every problem listed."
tags: [issue-flow]
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Run the issue flow here. The repo is acme/notes at /src/notes. Its .github/issue-flow.json has priority ["p0", "p1"], labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup" (no deployFailed), app id 1234 and installationId 5678 with privateKeyPath "~/.keys/issue-flow.pem", run "npm run dev", evidence "Screenshot each step", and deploy workflow "deploy.yml" with no timeoutMinutes. Suppose the validator reports exactly these problems: labels.deployFailed must be a non-empty string; app.privateKeyPath must be an absolute path; deploy.timeoutMinutes must be a number above 0. There are open p0 issues #5 and #6.
