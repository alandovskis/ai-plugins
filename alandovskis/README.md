# alandovskis

Agent skills in the open [Agent Skills](https://agentskills.io) format: each skill is `skills/<name>/SKILL.md`
with `name` and `description` frontmatter, plus optional `references/`. No runtime-specific frontmatter or tool
names, so any runtime that reads `SKILL.md` can use them. Thin manifests make it installable as a plugin.

## Skills

| Skill | Purpose |
|---|---|
| brd, prd, brd-to-prd | Requirements documents, published to Confluence |
| plan-prd, implement-prd | PRD → SDD/test plan/implementation plan → test-first implementation |
| prd-to-jira | Jira epic/stories from a PRD |
| issue-tracker | Jira is the issue tracker, used through the Atlassian MCP |
| review-code | Code review through maintainability, efficiency, correctness, observability, scalability and security lenses, plus UX (accessibility, responsive, theming, via impeccable audit) for web UI |
| create-pr | Review with review-code, fix, open the PR, watch CI, merge |
| bilingual-apps | Apps are bilingual EN/FR: externalised strings, locale formatting, parity checks |
| web-stack | Web apps use Rust / WebAssembly |
| ci | Use GitHub Actions for CI/CD |
| design-doc-confluence | Reverse-engineer design docs in Confluence wiki markup |

## Install

- **Claude Code**: add the repo as a marketplace, then install the plugin:
  `/plugin marketplace add alandovskis/ai-plugins` then `/plugin install alandovskis@alandovskis`.
  For local development, use `claude --plugin-dir ./alandovskis`.
- **Codex**: `.codex-plugin/plugin.json` points at `./skills/`.
- **Gemini CLI**: `gemini extensions install ./alandovskis` (skills auto-discovered from `skills/`).
- **Anything else** (Cursor, Copilot, OpenCode, ...): copy or symlink `skills/*` into the runtime's skills directory.

## Runtime requirements

**Context7 MCP** (`@upstash/context7-mcp`, run via `npx`; requires Node.js) is declared as a dependency for up-to-date library
documentation, replacing the former anti-hallucination skill. It is bundled in `.mcp.json` (Claude Code, Codex) and
`gemini-extension.json` (Gemini CLI). For other runtimes, add it to their MCP config.

Skills describe operations, not host tool names. The Confluence/Jira skills (brd, prd, brd-to-prd, plan-prd,
implement-prd, prd-to-jira) need an Atlassian MCP connector exposing `getAccessibleAtlassianResources`,
`getConfluencePage`, `createJiraIssue`, etc. `implement-prd` uses read-only
subagents where the runtime supports them, and can run them sequentially otherwise.

Evals: `evals/<skill>-<n>/` in the `claude plugin eval` format (see `AGENTS.md` at the repo root); present for
`bilingual-apps`, `ci`, `issue-tracker`, `review-code` and `web-stack`.

Not included (Claude-specific, not skills): hooks, rules, routines, settings, agent definitions.
