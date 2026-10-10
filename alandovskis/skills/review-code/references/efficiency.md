# Efficiency lens

Question: does it waste CPU, memory, I/O or round trips on a path that runs often enough to matter?

Check the changed code for:

- Work repeated inside a loop that could be done once: parsing, allocation, regex compilation, lookups.
- Queries or remote calls per item (N+1) where one batched call would do.
- Needless copies, conversions or intermediate collections; whole-input buffering where streaming would work.
- Selecting or transferring more data than is used (`SELECT *`, full objects when an id is enough).
- Blocking calls on a hot path, a lock held across I/O, synchronous work that could overlap.
- A worse algorithm or data structure than the input size warrants (quadratic search, linear lookup in a list).
- Missing batching, caching or indexes where the access pattern clearly needs them; caches with no invalidation.
- In embedded or constrained code: stack and heap use, copies of large buffers, time spent with interrupts disabled.

State the path's frequency or input size as an assumption when the diff does not show it. Not a finding: micro-optimisation of cold code.
