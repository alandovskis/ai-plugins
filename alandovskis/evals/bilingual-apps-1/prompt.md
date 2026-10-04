---
description: "A login form whose text comes from en and fr locale resources, with an i18n setup, language switching, and no hardcoded strings."
tags: [bilingual-apps]
max_turns: 20
timeout_seconds: 600
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
allowed_tools: [Read, Glob, Grep, Skill]
---

Build a small React login form with email and password fields, a submit button, and validation errors for an empty or malformed email.
