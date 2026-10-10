---
type: llm
focus: last_message
---

PASS if the reply meets all of these:
- Headers use the h1./h2./h3. syntax, bold uses *text*, italic uses _text_, inline code uses {{code}}, and code blocks use {code} or {code:language}
- Tables use || heading || for the header row and | cell | for rows (the error case table), not Markdown pipes with a |---| separator
- The request flow diagram is ASCII art inside a code block, not a Mermaid block
- Lists use * for bullets and # for numbered items, horizontal rules use ----, and links use [text|url] or [text|#anchor]
- No Markdown headers (#), **bold**, backtick code or fenced ``` blocks appear inside the document body (an outer fence wrapping the whole paste-ready document and any chat text around it are ignored; a line starting with # followed by text is a Confluence numbered list item, not a Markdown header)

FAIL if any is not met.
