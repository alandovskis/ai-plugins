---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Plans to update docs/c4-containers.md, writing out the full updated file content, by replacing only the Mermaid block (refreshing the "Last updated" date is allowed); the paragraph about the load balancer and Redis ownership, and the ADR-4 text below the manually maintained marker, are preserved verbatim
- The planned new diagram removes the Redis cache and adds the worker container (Python) and a RabbitMQ queue (for example ContainerQueue), with the worker consuming from the queue
- Relationships are only drawn where the facts give evidence (for example no arrow from the API to RabbitMQ unless stated)
- Plans to run mmdc on docs/c4-containers.md immediately after the edit (a described ordered step is sufficient)
- The closing report (written as the planned outcome) says which files were created vs updated, which elements were added and removed, and flags gaps needing manual input (for example who publishes to the invoices queue is unknown)

FAIL if any is not met.
