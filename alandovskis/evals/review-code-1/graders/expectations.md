---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Has a section for each of the six lenses: maintainability, efficiency, correctness, observability, scalability and security
- Reports the SQL injection from string-built queries under security
- Reports the per-order query (N+1) under efficiency or scalability
- Reports the swallowed exception under observability or correctness
- Each finding names a location and a severity of blocker, major, minor or nit

FAIL if any is not met.
