# Observability lens

Question: can an operator tell what this is doing and why it failed?

Check the changed code for:

- Errors swallowed or discarded with no log, metric or signal, so a failure looks like success.
- Log lines without the context needed to act: identifiers, inputs, the underlying error, the step that failed.
- Wrong level (errors at debug, noise at error), or a log per item on a hot path.
- A new request, job or external call with no metric, trace span or outcome count; no way to see rate, latency or error rate.
- Health and readiness signals that stay green when the new dependency is down.
- Secrets, tokens or personal data written to logs, traces or error messages.
- Error messages returned to callers that leak internals, or that are too vague to act on.
- Alerts, dashboards or runbooks that the change makes wrong or incomplete.
- In embedded code: no way to read fault state, reset cause or counters after a failure.

Do not duplicate error-handling defects that belong to Correctness; report the missing signal only.
