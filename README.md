# ai-plugins

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace. It currently contains one plugin,
[`alandovskis`](alandovskis/README.md): agent skills for requirements docs (BRD/PRD), planning and implementation,
code review, an issue-to-deploy flow that takes GitHub issues to merged, deployed changes, plus Claude Code mods: a
`/flow` sidebar showing the conversation flow, and panels above the prompt showing the session, the issues in flight
and what subagents are doing.

These skills are opinionated and built around my own workflow. They assume, for example, Jira and Confluence for
requirements and issues (through an Atlassian MCP connector), GitHub Actions for CI, Rust/WebAssembly for web apps
and English/French bilingual apps. Fork and edit them to suit yours.

## Prerequisites

- **Atlassian MCP connector** for `brd`, `prd`, `brd-to-prd`, `plan-prd`, `implement-prd`, and `prd-to-jira`.
- **GitHub CLI (`gh`)** for `issue-tracker` when the project tracks issues in GitHub Issues, for `create-pr`, and for
  the issue flow. The Atlassian MCP connector is needed instead when it uses Jira.
- **A GitHub App and its private key** for the issue flow (`issue-flow`), installed on the repos it works on, and
  Node.js 20.19+ or 22.7+ to run its token CLI. See
  [Issue-to-deploy flow: GitHub App setup](alandovskis/README.md#issue-to-deploy-flow-github-app-setup).
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
