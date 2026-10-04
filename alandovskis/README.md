# alandovskis

Agent skills in the open [Agent Skills](https://agentskills.io) format: each skill is `skills/<name>/SKILL.md`
with `name` and `description` frontmatter, plus optional `references/`. No runtime-specific frontmatter or tool
names, so any runtime that reads `SKILL.md` can use them. Thin manifests make it installable as a plugin.

## Skills

| Skill | Purpose |
|---|---|
| architecture | C4 + Mermaid architecture docs |
| brd, prd, brd-to-prd | Requirements documents, published to Confluence |
| plan-prd, implement-prd | PRD → SDD/test plan/implementation plan → test-first implementation |
| prd-to-jira | Jira epic/stories from a PRD |
| issue-tracker | Jira is the issue tracker, used through the Atlassian MCP |
| skeptical-code-review | Evidence-based change review |
| bilingual-apps | Apps are bilingual EN/FR: externalised strings, locale formatting, parity checks |
| web-stack | Web apps use Rust / WebAssembly |
| ci | Use GitHub Actions for CI/CD |
| conventional-commits | Logical-group conventional commits |
| design-doc-markdown, design-doc-confluence | Reverse-engineer design docs |
| extract-branch, split-prs, mr-description | Git/branch/MR workflows (formerly Claude Code slash commands) |

## Install

- **Claude Code**: `claude --plugin-dir ./alandovskis`, or add the repo root as a marketplace: `/plugin marketplace add <path-or-git-url>` then `/plugin install alandovskis@alandovskis`.
- **Codex**: `.codex-plugin/plugin.json` points at `./skills/`.
- **Gemini CLI**: `gemini extensions install ./alandovskis` (skills auto-discovered from `skills/`).
- **Anything else** (Cursor, Copilot, OpenCode, ...): copy or symlink `skills/*` into the runtime's skills directory.

## Runtime requirements

**Context7 MCP** (`@upstash/context7-mcp`, run via `npx`; requires Node.js) is declared as a dependency for up-to-date library
documentation, replacing the former anti-hallucination skill. It is bundled in `.mcp.json` (Claude Code, Codex) and
`gemini-extension.json` (Gemini CLI). For other runtimes, add it to their MCP config.

Skills describe operations, not host tool names. The Confluence/Jira skills (brd, prd, brd-to-prd, plan-prd,
implement-prd, prd-to-jira) need an Atlassian MCP connector exposing `getAccessibleAtlassianResources`,
`getConfluencePage`, `createJiraIssue`, etc. `skeptical-code-review` and `implement-prd` use read-only
subagents where the runtime supports them, and can run them sequentially otherwise.

Evals: `skills/<name>/evals/evals.json` (prompt + expectations, skill-creator format) where present; currently `bilingual-apps`.

Not included (Claude-specific, not skills): hooks, rules, routines, settings, agent definitions.
