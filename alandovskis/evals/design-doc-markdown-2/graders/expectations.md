---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- The document uses GitHub-flavored Markdown (#/## headers, **bold**, backtick code, fenced code blocks with a language, tables with a |---| separator) and no Confluence wiki markup (no h1. headers, {code} blocks, {{inline}} code or || table headers)
- The request flow is shown as a Mermaid diagram in a fenced ```mermaid block (flowchart or sequence diagram), not only as ASCII art
- Code references use the format `file_path:line_number`, for example `internal/http/middleware.go:8`
- The document is output directly, ready to paste, with a table of contents using Markdown anchor links

FAIL if any is not met.
