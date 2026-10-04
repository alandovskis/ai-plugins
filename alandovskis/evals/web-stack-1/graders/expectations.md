---
type: llm
focus: last_message
---

Expected outcome: A Rust/WebAssembly project using Leptos and Trunk, not a JavaScript framework.

PASS if the response satisfies every one of these expectations:
- The app is a Cargo workspace targeting wasm32-unknown-unknown with Leptos as the UI framework
- Trunk is used for bundling and the dev server
- No React, Vue, Svelte or Next.js is introduced
- en and fr i18n resources and a GitHub Actions workflow are scaffolded up front
- Current crate versions were looked up rather than taken from memory

FAIL if any expectation is not met.
