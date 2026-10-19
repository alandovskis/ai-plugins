# ai-plugins

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace. It currently contains one plugin,
[`alandovskis`](alandovskis/README.md): agent skills for requirements docs (BRD/PRD), planning and implementation,
code review, plus Claude Code mods: a `/flow` sidebar showing the conversation flow, and a band above the prompt
  showing what subagents are doing.

These skills are opinionated and built around my own workflow. They assume, for example, Jira and Confluence for
requirements and issues (through an Atlassian MCP connector), GitHub Actions for CI, Rust/WebAssembly for web apps
and English/French bilingual apps. Fork and edit them to suit yours.

## Prerequisites

- **Atlassian MCP connector** for `brd`, `prd`, `brd-to-prd`, `plan-prd`, `implement-prd`, `prd-to-jira` and `issue-tracker`.
- **Node.js** (for the bundled Context7 MCP server, run through `npx`).

## Install

```
/plugin marketplace add alandovskis/ai-plugins
/plugin install alandovskis@alandovskis
```

See [`alandovskis/README.md`](alandovskis/README.md) for the skill list, other runtimes (Junie, Codex, Gemini CLI) and
runtime requirements.

## Layout

- `.claude-plugin/marketplace.json`: the marketplace manifest.
- `alandovskis/`: the plugin (skills, evals, manifests, and the hooks module with its tests).
- `scripts/validate.sh`: validates the manifests and skill layout and runs the hooks module's tests (run by CI).
- `AGENTS.md`: contributor instructions (skill evals, issue tracking).

## License

[MIT](LICENSE)
