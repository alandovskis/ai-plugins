# Correctness lens

Question: does it do what it is meant to, on every path?

Check the changed code for:

- Boundary and off-by-one errors; empty, null, missing, duplicated, oversized or malformed input.
- Errors ignored, swallowed or turned into a success; partial results returned as complete ones.
- Resources not released on every path: connections, file handles, locks, memory, goroutines or threads.
- Concurrency: unsynchronised shared state, lock ordering, a lock not released on panic or early return, check-then-act races.
- Retry, restart and repeat behaviour: non-idempotent writes, duplicate delivery, partial completion with no rollback, transactions that are never committed.
- Integer overflow, signedness and truncation; floating-point comparison; time zones, clocks and ordering assumptions.
- Behaviour changes that break existing callers, serialised formats, schemas or configuration.
- Logic that contradicts its own documentation, name, or the stated intent of the change.
- A branch, case or enum value the new code does not handle.

Trace the path rather than inferring from names. Not a finding: a path that cannot be reached from any caller you can name.
