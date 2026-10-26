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
| issue-tracker | Jira (Atlassian MCP) or GitHub Issues (`gh`), whichever the project uses |
| review-code | Code review through maintainability, efficiency, correctness, observability, scalability and security lenses, plus UX (accessibility, responsive, theming, via impeccable audit) for web UI |
| create-pr | Review with review-code, fix, open the PR, watch CI, merge |
| bilingual-apps | Apps are bilingual EN/FR: externalised strings, locale formatting, parity checks |
| web-stack | Web apps use Rust / WebAssembly |
| ci | Use GitHub Actions for CI/CD |
| design-doc | Write a design doc (objective, goals, SLOs, alternatives, open issues), reviewed with review-design-doc and fixed |
| review-design-doc | Review a design doc draft through clarity, conciseness and consistency subagents, leaving the text unedited |
| design-doc-confluence | Reverse-engineer design docs in Confluence wiki markup |

## Mods (Claude Code only)

A Claude Code hooks module: `hooks/register.tsx` wires each event to the features, whose state changes and
drawing live in `hooks/flow.tsx`, `hooks/session.tsx`, `hooks/issueflow.tsx` and `hooks/subagents.tsx`; the state
contract is in `types/` and the tests in `tests/`.

**Conversation flow:** `/flow` toggles a sidebar that shows the conversation one line per event:

```
● You Fix the parser
├ ✓ Read src/parser.ts
├ ✗ Bash rm -rf /
├ ✓ ⇢ Explore (Haiku 5.5) Find callers
│ ├ ✓ Read src/lexer.ts
└ ◆ Claude 4.2s · All done.
```

- `●` your prompt (its first line).
- `├` a tool call with its main argument and status: `…` running, `✓` done, `✗` failed or refused, `⊘` refused
  by another plugin's hook. A call you or a settings hook refuse reaches the sidebar as a failed call, so it shows `✗`.
- `⇢` a subagent, with the model it runs on, coloured as in the band; its own tool calls are drawn under it, even
  when several subagents run at once. Each of a workflow's agents gets a `⇢` row of its own under its `Workflow` call.
- `└ ◆` Claude's answer: how long the turn took and its first line. An interrupted or failed turn shows `└ ✗` and
  the reason (`aborted`, `error`, `refusal` with its explanation).

It docks beside the transcript in the fullscreen layout from 110 columns; elsewhere it opens above the prompt. The flow
starts when the plugin loads, empties on `/clear` and `/resume`, and keeps the last 400 lines; on each line the tool
name is cut to 48 characters and the detail to 120. It only observes: it never changes or blocks a prompt or a tool
call.

**Session panel:** a framed panel titled "Session" sits at the top of the band above the prompt, over the subagent
band, and shows the session's figures as the status line has them:

```
╭─ Session ─────────────────────────────────────────────────────────────────────────────────╮
│ Opus 5.5  Context ██░░░░░░░░ 18%  5h ██████░░░░ 55% ↻ 2h 10m  Week ████████░░ 81% ↻ 3d 4h │
╰───────────────────────────────────────────────────────────────────────────────────────────╯
```

- The model the session runs on, as a badge coloured as in the subagent band.
- `Context`: how full the session's context window is, from its latest response; `5h` and `Week`: how much of the
  five-hour and the weekly rate limit is used. Each is a bar of ten cells and its percentage: green under 50%, yellow
  from 50%, red from 80%.
- `↻` after a limit: how long until it resets, rounded up to the minute (`42m`, `2h 10m`, or `3d 4h` from a day). It is
  left out when the engine gives no reset time, and once the time has passed.
- A figure the session has none for is left out: the context before the first response, the rate limits off a
  subscription. The figures are read every second, so a `/model` switch shows within a second.
- It yields the band to a survey, as the subagent band does. `/subagents` hides only the subagent band.

**Issue panel:** a framed panel titled "Issues" under the session panel lists every issue the `issue-flow` skill has in
flight, from the step markers its skills echo (`issue-flow: step issue=<n> step=<step> waiting=<text>`, read from
`Bash` output; the hook only reads it):

```
╭─ Issues ──────────────────────────────────────────────────────────────────────────────────╮
│ ◆ #8 awaiting-approval · approving review on PR #34 2m 10s                                │
│ ✗ #4 failed · deploy failed: https://github.com/o/r/actions/runs/1 40s                    │
│ ⇢ #7 implementing 12s                                                                     │
╰───────────────────────────────────────────────────────────────────────────────────────────╯
```

- Each row: the issue's number, its step, what it waits on, and how long it has been at that step. A step the flow
  announces again on a later pass keeps its time and takes what it waits on now; a new step starts the time over.
- Issues waiting on the human come first (`◆` awaiting approval or escalated, `✗` a failed deploy), then the
  ones the flow is working on (`⇢`), each group in the order announced. `✓` done stays for 30 seconds.
- Failed and escalated entries stay until the issue's next marker, or `/clear`; the panel only shows them and acts on
  nothing.
- It shows at most six, as many as its rows allow, and counts the rest (`+2 more`). It says `No issues in flight`
  when none is, and empties on `/clear` and `/resume`. Empty, it yields its rows to a subagent band with subagents in
  it; with issues in it, it comes first and the band takes the rows left.

`/issues` hides the panel, and shows it again; the choice is kept across sessions.

**Subagent band:** while subagents run, a framed band titled "Subagents" under the session panel shows what each
one is doing:

```
╭─ Subagents · plugins ⎇ main ──────────────────────────────────────────────────────────────╮
│ Haiku 5.5 ⇢ Explore ██░░░░░░░░ 18% 12s · 7 calls                                          │
│    Find callers of parse()                                                                │
│    … Grep parse\(                                                                         │
│ Sonnet 5.5 ✓ Plan ██████░░░░ 57% agent-a2 ⎇ worktree-a2 8s · 9 calls                      │
│    Design the lexer split                                                                 │
╰───────────────────────────────────────────────────────────────────────────────────────────╯
```

- The title shows the session's git worktree (its directory's name) and branch, or the commit's short hash on a
  detached HEAD, and nothing outside git. It is read again as each subagent starts, and after the main conversation's
  `Bash`, `EnterWorktree` and `ExitWorktree` calls while the band shows.
- Each entry starts with the model the subagent runs on, without its `claude-` prefix, as a badge coloured by family
  (opus orange, sonnet blue, haiku purple, fable teal, any other grey), with its description on the line under it.
- After its type, a bar of ten cells shows how full its context window is, from its latest response: green under 50%,
  yellow from 50%, red from 80%. A subagent on the session's model is measured against the session's window; any
  other against its model's (1M for current models, 200K for those before Claude 4.6). No bar shows before its first
  response.
- `⇢` a running subagent: its type (a workflow agent's name); its own worktree and branch where they differ from the
  session's, as in an isolated worktree (read on its first tool call); how long it has run and its tool calls so far,
  with its latest call under its description (`…` running, `✓`, `✗`, `⊘`).
- `✓` or `✗` a finished subagent, with its total time; it stays for 30 seconds, then leaves the band.
- Running subagents come first. The band shows at most six, as many as its rows allow, and counts the rest
  (`+2 more`). It says `No subagents` while none has run for 30 seconds, and empties on `/clear` and `/resume`.

`/subagents` hides the band, and shows it again; the choice is kept across sessions.

To work on them: `claude --plugin-dir ./alandovskis` loads the plugin and reloads it as files change;
`claude plugin test alandovskis` runs the tests. Once loaded, the engine writes the API types to
`.claude-plugin/types/` (git-ignored), which `tsconfig.json` extends, so `tsc -p alandovskis` type-checks the module.

## Install

- **Claude Code**: add the repo as a marketplace, then install the plugin:
  `/plugin marketplace add alandovskis/ai-plugins` then `/plugin install alandovskis@alandovskis`.
  For local development, use `claude --plugin-dir ./alandovskis`.
- **Codex**: `.codex-plugin/plugin.json` points at `./skills/`.
- **Gemini CLI**: `gemini extensions install ./alandovskis` (skills auto-discovered from `skills/`).
- **Junie**: copy or symlink `alandovskis/skills/*` into the project's `.junie/skills/` directory (or the user's
  `~/.junie/skills/` directory). Junie reads the standard `SKILL.md` files directly; no Junie-specific manifest is
  required.
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
`bilingual-apps`, `ci`, `design-doc`, `issue-tracker`, `review-code`, `review-design-doc` and `web-stack`.

Not included (Claude-specific, not skills): rules, routines, settings, agent definitions. The one exception is the
Claude Code hooks module above, which other runtimes ignore.
