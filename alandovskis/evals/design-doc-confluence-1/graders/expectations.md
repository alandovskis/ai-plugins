---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The complete document is written directly in the reply, not a plan or outline
- It has an Executive Summary, System Overview, Architecture, Implementation Details, Operational Procedures, Design Rationale and Future Enhancements section
- It has a table of contents with anchor links and appendices for a glossary and file references
- Code references use the format {{file_path:line_number}} (for example {{src/retry/queue.go:41}}) and match the supplied code
- Content is grounded in the supplied code (Redis list retry:jobs, exponential backoff capped at 5 minutes, dead list after 5 attempts) and includes example configuration and troubleshooting scenarios

FAIL if any is not met.
