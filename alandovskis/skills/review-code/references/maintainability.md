# Maintainability lens

Question: can the next engineer understand and change this safely?

Check the changed code for:

- Names that mislead or hide intent; booleans and units that are ambiguous at the call site.
- A function, type or module doing several unrelated jobs, so a change to one forces edits to the others.
- Duplicated logic that must be kept in step, where a divergence would be a bug.
- Hidden coupling: global or shared mutable state, ordering requirements, implicit contracts between modules.
- Dead code, unused parameters or options the change leaves behind or introduces.
- Comments that contradict the code or explain what the code already says, and missing comments on non-obvious invariants.
- Tests that would still pass if the behaviour were wrong: a body that always returned one argument, an assertion that checks nothing, a mocked dependency hiding the real behaviour.
- No test for a new branch, error path or public behaviour, when a named regression would go unnoticed.
- Public API, configuration or schema changes that break existing callers or leave documentation stale.

Not a finding: taste, preferred style, "a library already does this", or a refactor with no named cost.
