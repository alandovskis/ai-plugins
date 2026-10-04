---
type: llm
focus: last_message
---

Expected outcome: The assistant respects the explicit request but flags the deviation from the default stack.

PASS if the response satisfies every one of these expectations:
- The assistant notes that the default stack is Rust/WASM and acknowledges the user explicitly requested React
- It asks or confirms before deviating rather than silently choosing either option

FAIL if any expectation is not met.
