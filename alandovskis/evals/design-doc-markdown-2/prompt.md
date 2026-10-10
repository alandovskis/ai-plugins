---
description: "The design doc uses GitHub-flavored Markdown with a Mermaid diagram, not Confluence markup."
tags: [design-doc-markdown]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Reverse-engineer a design doc for the session handling below. It will be pasted into a GitLab wiki, so make it ready to paste. Show how a request flows through it.

`internal/session/store.go`
```go
14: func (s *Store) Get(id string) (*Session, error)   // reads from Redis, returns ErrExpired if TTL elapsed
30: func (s *Store) Touch(id string) error              // extends TTL by 30m
```
`internal/http/middleware.go`
```go
8:  func SessionMiddleware(next http.Handler) http.Handler  // reads cookie "sid", calls Store.Get, 401 on ErrExpired, else Touch and next
```
