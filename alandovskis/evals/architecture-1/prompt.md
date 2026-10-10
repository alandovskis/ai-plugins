---
description: "A new Express service gets C4 diagrams and a patterns catalogue under docs/, each rendered."
tags: [architecture]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Document the architecture of this repo. There are no existing docs. Treat the facts below as what you found in the code, and do not invent anything beyond them.

- `package.json`: Express 4 app, entry point `src/server.ts`
- `docker-compose.yml`: services `api` (built from `Dockerfile`) and `db` (postgres:16)
- `src/routes/orders.ts` has `router.get("/orders")` and `router.post("/orders")`
- `src/repositories/OrderRepository.ts:1` has `class OrderRepository` with `findById`, `save`, `delete`, using the `pg` driver against the `db` service
- `src/payments/StripeClient.ts:1` calls the Stripe API using the `stripe` SDK
- `src/middleware/auth.ts:1` is registered with `app.use(auth)` in `src/server.ts:12`
- Customers call the REST API; there is no message queue
