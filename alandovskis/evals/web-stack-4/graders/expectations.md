---
type: llm
focus: last_message
---

Expected outcome: A GitHub Actions workflow with the Rust/WASM build steps.

PASS if the response satisfies every one of these expectations:
- The workflow installs the wasm32-unknown-unknown target
- It runs cargo fmt --check, cargo clippy -- -D warnings, cargo test and a Trunk release build
- It is a GitHub Actions workflow, consistent with the ci skill

FAIL if any expectation is not met.
