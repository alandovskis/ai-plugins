---
type: llm
focus: last_message
---

Expected outcome: The server is added as a remote HTTP MCP server with the current endpoint, followed by authentication and verification.

PASS if the response satisfies every one of these expectations:
- Existing Atlassian tools are checked for before adding anything
- The endpoint is confirmed against the current official Atlassian documentation rather than taken from memory
- The server is added with `claude mcp add --transport http atlassian <endpoint>` or an equivalent remote HTTP configuration
- The user is told to complete OAuth sign-in themselves (for example via /mcp) and is not asked for passwords or tokens
- Setup is verified by calling getAccessibleAtlassianResources

FAIL if any expectation is not met.
