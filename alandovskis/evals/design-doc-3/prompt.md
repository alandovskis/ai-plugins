---
description: "An existing draft is reviewed through clarity, conciseness and consistency, by lens subagents."
tags: [design-doc]
max_turns: 25
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill, Agent]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions and proceed. The workspace is empty, so review only the draft in the user's message and give the complete findings as your final reply."
---

Review my design doc draft.

```markdown
# Project Falcon

## Objective
Falcon makes the sync layer better.

## Goals
- Adopt gRPC for all internal calls.
- Be performant.

## Non-goals
- Replacing the REST gateway.

## Design
The Sync Service pushes changes to clients over gRPC. Clients poll the REST gateway every 30 seconds for the change list. The sync agent retries failed pushes. p99 push latency must be under 200 ms; the Replicator handles retries, and p99 push latency must be under 500 ms.

## Timeline
Milestone 1: ship in Q3.
```
