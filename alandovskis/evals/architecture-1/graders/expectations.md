---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Plans to write out the full content of docs/c4-context.md, docs/c4-containers.md and docs/architecture-patterns.md (docs/c4-components.md is optional because the internals are small), with each file's full content given in the reply
- The planned C4 file contents use Mermaid native C4 syntax (C4Context and C4Container code blocks with Person, System, Container, ContainerDb and Rel elements)
- Only components evidenced in the facts appear (the API, the Postgres database, Stripe as an external system, the customer); no queue, cache or other invented element
- Plans to run mmdc on each diagram file immediately after writing it, before moving on to the next file (a described ordered step such as write c4-context.md, then mmdc, then write c4-containers.md is sufficient)
- The planned docs/architecture-patterns.md is a table of pattern, category, usage and evidence, listing at least Repository and Middleware with a file reference such as src/repositories/OrderRepository.ts:1 for each
- Each planned file content keeps the template marker comments and a "Last updated" line, and the C4 file contents include the manually maintained marker below the diagram

FAIL if any is not met.
