---
description: "Branches left behind by merged or closed PRs do not fill the implementing cap."
tags: [issue-queue]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Pick the next issue to work on. The repo config has priority ["p0", "p1"] and labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", deployFailed "deploy-failed". There are no open PRs. Origin has three branches: issue/3-login, whose PR #13 was merged; issue/4-logout, whose PR #14 was closed without merging by a maintainer; and issue/5-profile, whose PR #15 was closed without merging by a maintainer. The open issues are #4 (p0, PR #14 closed by a maintainer) and #9 (p1, no PR or branch).
