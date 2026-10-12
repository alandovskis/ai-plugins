---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Reports findings under clarity, conciseness and consistency, with `No findings.` for a lens that has none
- Flags the vague objective or the unmeasurable goal "Be performant" under clarity
- Flags the contradictory p99 latency targets (200 ms and 500 ms) under consistency
- Flags the inconsistent names for the retry component (Sync Service, sync agent, Replicator) or the REST polling that conflicts with the gRPC-for-all goal under consistency
- Each finding quotes the text and suggests a change

FAIL if any is not met.
