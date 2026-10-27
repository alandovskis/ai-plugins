---
description: "A clear, small issue is labelled feasible with a way to build and to exercise it."
tags: [issue-feasibility]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and state the outcome you would reach for the data given."
---

Judge whether issue #21 is feasible. The repo config has labels feasible "feasible", needsReview "needs-review", needsSetup "needs-setup", and run "cargo run --release", evidence "Record the terminal session with asciinema". Issue #21 is titled "Print version with --version" and says: add a --version flag to the CLI that prints the crate version from Cargo.toml and exits 0.
