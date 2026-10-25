---
description: "A CLI change gets terminal or log output as evidence in place of screenshots, and the evidence is still complete."
tags: [issue-evidence]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Capture evidence for issue #44, "Add a --json flag to the report command", now implemented in the worktree /work/issue-44 on branch issue-44-json-flag. The repo config has run "cargo run --release -- report" and evidence "Capture the terminal output of the command". The repository is acme/reporter. It is a command-line tool with no browser or GUI. The acceptance points are: report --json prints valid JSON; report without the flag prints the table as before. Suppose the captures succeed as expected and the evidence-reviewer agent returns pass. Give the PR body block with concrete captions, file names and URLs, using placeholder text for the captured output.
