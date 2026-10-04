---
type: llm
focus: last_message
---

Expected outcome: The design names Rust/WASM as the web stack.

PASS if the response satisfies every one of these expectations:
- The design names Rust compiled to WebAssembly with Leptos as the web stack
- Any exception to the stack is stated with its reason and approval
- The design mentions semantic HTML and accessibility, and a Rust backend sharing types through a common crate

FAIL if any expectation is not met.
