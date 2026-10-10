---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The complete document text is written out in full in the reply (it may sit in a fenced block for a file and may be preceded by a short list of steps), not only a plan or outline of what it would contain
- It has an Executive Summary, System Overview, Architecture, Implementation Details, Operational Procedures, Design Rationale and Future Enhancements section
- It has a table of contents with anchor links (for example [Architecture](#architecture)) and appendices for a glossary and file references
- Code references in the body use the format `file_path:line_number` (for example `src/retry/queue.go:41`), and the line numbers used match the supplied code (Job at 10, Enqueue at 22, backoff at 41, run at 60)
- Content is grounded in the supplied code (Redis list retry:jobs, exponential backoff capped at 5 minutes, dead list after 5 attempts) and includes example configuration and troubleshooting scenarios

FAIL if any is not met.
