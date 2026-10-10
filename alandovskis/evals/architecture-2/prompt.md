---
description: "An existing container diagram is refreshed without overwriting manually written text."
tags: [architecture]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Update the architecture docs, the code has changed. Treat the facts below as what you found in the code and do not invent anything beyond them.

Changes since the last run: the Redis cache was removed from `docker-compose.yml`, and a new `worker` service (`worker/main.py`, Python, consumes the `invoices` queue on RabbitMQ with `pika`) was added.

Current `docs/c4-containers.md`:

````markdown
<!-- architecture: auto-generated — edit the Mermaid block only, keep other text -->
# Container Diagram

> Last updated: 2025-01-10

The API is deployed behind our own load balancer. Ops owns the Redis instance.

```mermaid
C4Container
  title Billing – Container Diagram
  Person(user, "Customer", "Pays invoices")
  System_Boundary(b, "Billing") {
    Container(api, "API", "Go, net/http", "Serves REST")
    ContainerDb(cache, "Cache", "Redis", "Session cache")
    ContainerDb(db, "Database", "PostgreSQL", "Invoices")
  }
  Rel(user, api, "Uses", "HTTPS")
  Rel(api, cache, "Reads/writes")
  Rel(api, db, "Reads/writes")
```

<!-- manually maintained: add notes, decisions, or ADRs below this line -->
ADR-4: we chose PostgreSQL over MySQL for JSONB support.
````
