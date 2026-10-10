# Scalability lens

Question: does it hold up as load, data volume or concurrency grows?

Check the changed code for:

- State that grows without bound: caches, maps, queues, buffers, logs, keyed by attacker- or user-controlled values.
- Per-request or per-run work proportional to total data rather than to the request: full scans, whole-table loads.
- Global locks and shared mutable state that serialise requests; a lock held across I/O or a client write.
- Missing pagination, limits, timeouts, backpressure or rate limits on a path that accepts unbounded input.
- Designs that cannot run as several instances: in-process state, local files, leader assumptions, sticky sessions.
- Pagination or iteration that skips or repeats items as data changes; no resume point after a failure.
- Fan-out and retry storms: unbounded concurrency, retries without backoff or jitter, thundering herds.
- Resource pools that one slow request can exhaust: connections, threads, file descriptors.
- Schema or key choices that become hot spots (monotonic keys, a single partition, an unindexed filter).

State the growth dimension (users, rows, requests, tenants) and the assumed size. Not a finding: a limit far beyond any realistic load.
