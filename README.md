# ai-plugins

A personal [Claude Code](https://claude.com/claude-code) plugin marketplace. It currently contains one plugin,
[`alandovskis`](alandovskis/README.md): agent skills for requirements docs (BRD/PRD), planning and implementation,
code review, commits and architecture docs.

## Install

```
/plugin marketplace add alandovskis/ai-plugins
/plugin install alandovskis@alandovskis
```

See [`alandovskis/README.md`](alandovskis/README.md) for the skill list, other runtimes (Codex, Gemini CLI) and
runtime requirements.

## Layout

- `.claude-plugin/marketplace.json`: the marketplace manifest.
- `alandovskis/`: the plugin (skills, evals, manifests).
- `AGENTS.md`: contributor instructions (skill evals, issue tracking).

## License

[MIT](LICENSE)
