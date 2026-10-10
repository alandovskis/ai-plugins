---
description: "A reverse-engineered design doc covers every required section with a table of contents and code references."
tags: [design-doc-markdown]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Write a design doc for our retry queue in Markdown. Here is the relevant code, there is nothing else in the area:

`src/retry/queue.go`
```go
10: type Job struct { ID string; Attempts int; Payload []byte }
22: func (q *Queue) Enqueue(j Job) error { ... }          // pushes to Redis list "retry:jobs"
41: func (q *Queue) backoff(n int) time.Duration {        // 2^n seconds, capped at 5m
48:   return min(time.Duration(1<<n)*time.Second, 5*time.Minute)
52: }
60: func (q *Queue) run() { ... }                          // worker loop, moves jobs to "retry:dead" after 5 attempts
```
`config/retry.yaml`: `max_attempts: 5`, `redis_url: redis://localhost:6379`
