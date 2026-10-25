---
description: "A web feature gets ordered, captioned screenshots committed to the evidence branch and embedded in the PR body."
tags: [issue-evidence]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Capture evidence for issue #31, "Add a dark mode toggle to the settings page", now implemented in the worktree /work/issue-31 on branch issue-31-dark-mode. The repo config has run "npm run dev, then open http://localhost:3000 in a browser" and evidence "Take a screenshot of each step with the browser". The repository is acme/webapp. The acceptance points are: the settings page shows a toggle; switching it makes the page dark; the choice survives a reload. Suppose the captures succeed as expected and the evidence-reviewer agent returns pass. Give the PR body block with concrete captions and URLs.
