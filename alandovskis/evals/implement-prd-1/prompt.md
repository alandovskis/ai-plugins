---
description: "A plan is implemented test-first with a checklist and a report published as a child of the plan."
tags: [implement-prd]
max_turns: 20
timeout_seconds: 600
allowed_tools: [Read, Glob, Grep, Skill]
append_system_prompt: "This is an automated evaluation with no human to answer questions. Do not ask clarifying questions; state reasonable assumptions about the project and proceed. The workspace is empty and no external services (such as Atlassian or GitHub) are connected, so describe exactly what you would do. Your final reply must list the steps and tool calls or commands you would use and include the full content of every file you would create."
---

Implement the Confluence implementation plan "Implementation Plan: URL Shortener" (ENG space) in ./shortener, in Python. I can't answer questions, so use this page content and proceed. In your reply, show IMPLEMENTATION_CHECKLIST.md exactly as you would first write it (before any work starts), then describe how it is updated, and name the Confluence call and parameters you would use to publish the final report.

```markdown
# Implementation Plan: URL Shortener

## REQ-001 Shorten a URL
##### Backend Engineer
| Task ID | Task | Type | Target Files / Modules | Dependencies | Estimate | Acceptance Criteria | Validation |
|---|---|---|---|---|---|---|---|
| IMP-REQ-001-01 | Code generator | Backend | src/codegen.py | None | S | generate() returns a 7-character base62 string | pytest tests/unit/test_codegen.py |
| IMP-REQ-001-02 | POST /shorten handler | Backend | src/routes/shorten.py | IMP-REQ-001-01 | M | Returns 201 with the code for a valid URL, 400 for an invalid URL | pytest tests/integration/test_shorten.py |

### Test Plan Implementation Breakdown
| Test Case ID | Test Objective | Supporting Code / Fixture / Harness Work | Implementation Task IDs | Validation |
|---|---|---|---|---|
| TC-REQ001-1 | Valid URL returns 201 and a 7-character code | HTTP test client fixture | IMP-REQ-001-01, IMP-REQ-001-02 | pytest tests/system/test_shorten.py |
| TC-REQ001-2 | Invalid URL returns 400 | HTTP test client fixture | IMP-REQ-001-02 | pytest tests/system/test_shorten.py |

### Execution Order
1. IMP-REQ-001-01  2. IMP-REQ-001-02

### Autonomous Execution Contract
Unit: pytest tests/unit. Integration: pytest tests/integration. System: pytest tests/system.
```
