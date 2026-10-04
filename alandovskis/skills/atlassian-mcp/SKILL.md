---
name: atlassian-mcp
description: Connect an agent runtime to the Atlassian Rovo MCP server (Jira and Confluence). Use when setting up or troubleshooting Atlassian/Jira/Confluence access, when a Jira or Confluence skill (brd, prd, brd-to-prd, plan-prd, implement-prd, prd-to-jira) finds no Atlassian tools, or when the user asks to wire up, install, authenticate or fix the Atlassian MCP.
---

# Atlassian MCP

Jira is the issue tracker and Confluence holds requirements documents, so the Atlassian Rovo MCP server is the integration point. It is a remote server using OAuth 2.1; nothing needs to be installed locally.

## Steps

1. **Check first.** Look for existing Atlassian tools (for example `getAccessibleAtlassianResources`, `getConfluencePage`, `createJiraIssue`). If they are present, skip to step 4.
2. **Confirm the endpoint.** Read the current official page, "Getting started with the Atlassian Rovo MCP Server" on support.atlassian.com, and use the endpoint it gives. Do not rely on memory: the endpoint is versioned and older versions are being retired. At the time of writing it is `https://mcp.atlassian.com/v2/mcp`.
3. **Add the server** using the runtime's own mechanism, as a remote streamable-HTTP server:
   - **Claude Code:** `claude mcp add --transport http atlassian <endpoint>`. Add `--scope user` to make it available in every project, or `--scope project` to write it to a shared `.mcp.json`.
   - **Codex:** add an entry for the endpoint to its MCP configuration.
   - **Gemini CLI:** add an `httpUrl` entry for the endpoint under `mcpServers` in its settings.
   - **Other runtimes:** use the runtime's remote/HTTP MCP setting with the same endpoint.
4. **Authenticate.** The user signs in through the OAuth flow (in Claude Code, run `/mcp`, select `atlassian`, and complete the browser sign-in). The user must do this step themselves; do not ask for or handle passwords or API tokens. Prefer OAuth over personal API tokens.
5. **Verify.** Call `getAccessibleAtlassianResources` and confirm it returns the expected site. Report the site name and the tools found.

## Troubleshooting

- **Tools missing after adding:** restart the session, then recheck `/mcp` for `needs authentication` or `failed`.
- **Sign-in loops or stale auth, or an older endpoint was used before:** clear the cached credentials for the server and authenticate again.
- **Wrong site:** `getAccessibleAtlassianResources` can return several sites. Ask the user which to use rather than taking the first.
- **Permission errors:** the MCP acts with the user's own Atlassian permissions. An admin may need to allow the app or grant access to the product.

## Rules

- Never write tokens or credentials into the repository or any config file under version control.
- The MCP can act on every connected product with the user's permissions. Confirm before any bulk or destructive Jira or Confluence change.
- Do not add Atlassian to the plugin's bundled `.mcp.json`; connecting is a per-user choice.
