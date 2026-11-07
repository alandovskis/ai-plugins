# Issue-to-deploy flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skills, agents, a hook and a panel that take GitHub issues for a project to a human-approved, merged and watched-through-deploy change, with step-by-step evidence in each PR.

**Architecture:** The judgement and orchestration live in skills and two-to-three agents that drive `gh` and git worktrees. Three small pieces of code carry the deterministic parts: a config validator, a GitHub App token minter, and a step marker that the hook parses to feed a panel above the prompt. GitHub labels and PRs are the only durable state.

**Tech Stack:** Markdown skills and agents (Agent Skills format), TypeScript run by the Claude Code hooks-module engine and `bun test` via `claude plugin test`, Node `fetch` and `crypto` for the app token, `gh`, git worktrees.

**Spec:** `docs/superpowers/specs/2026-10-25-issue-to-deploy-design.md`

## Global Constraints

- Issues are GitHub Issues, read and written with `gh`; the flow acts as a GitHub App installation, with `GH_TOKEN` set to a minted installation token (about one hour).
- App permissions: Contents, Pull requests, Issues read/write; Actions, Checks read.
- At most 3 PRs awaiting review and at most 3 issues being implemented at once.
- Squash merge only; never `--admin`; never rerun, skip or disable a check or edit a workflow to get green.
- Never merge without the human's approving GitHub review; a dismissed approval or new commits after approval cancel it.
- Missing or incomplete config stops the whole flow; a config that does not say how to run or drive the app labels only that issue as needing setup.
- Evidence images live on a dedicated branch, not the PR branch, and are linked from the PR body.
- Repo rules: conventional commits; `scripts/validate.sh` passes; every skill ships evals in `alandovskis/evals/<skill>-<n>/` (`prompt.md`, `graders/expectations.md`, `graders/skill-fired.md`) and a symlink `.agents/skills/<name>` → `../../alandovskis/skills/<name>`; skill frontmatter is `name` and `description` only; skills describe operations, not host tool names; hooks observe and never block; the version bump is its own commit.

## Review Focus

- An issue with two priority labels, or none: highest counts; none is skipped (Task 3).
- An approved PR that conflicts with `main` after another merge: rebase, re-check, fresh evidence if behaviour changed, otherwise needs-review (Task 7).
- Approval dismissed, or a commit pushed after approval: the PR returns to waiting, not merged (Task 7).
- A token that expires mid-run, or a private key that is missing or unreadable: the flow refreshes it, or stops with a clear message (Task 2).
- A pure refactor or library change with nothing to screenshot: the evidence is test or log output, not an infeasible verdict (Task 5).
- An issue the human re-queues by removing needs-review is judged again, not skipped as already judged (Task 3).

---

### Task 1: Project config schema and validator

**Files:**
- Create: `alandovskis/issue-flow/config.ts`
- Create: `alandovskis/tests/issue-flow-config.test.ts`
- Create: `alandovskis/skills/issue-flow/references/config.md` (the schema, with an example; written here, linked from later skills)

**Interfaces:**
- Produces: `type IssueFlowConfig = { priority: string[] /* labels, highest first */; labels: { feasible: string; needsReview: string; needsSetup: string; deployFailed: string }; app: { id: number; installationId: number; privateKeyPath: string }; run: string /* how to launch and drive the app */; evidence: string /* how to capture evidence */; deploy: { workflow: string; timeoutMinutes: number } }`
- Produces: `validateConfig(raw: unknown): { ok: true; config: IssueFlowConfig } | { ok: false; problems: string[] }`
- The file is `.github/issue-flow.json` in the target repo. `run` and `evidence` may be empty strings only for validation to report them as `needsSetup` (below); every other field is required.
- Produces: `needsSetup(config: IssueFlowConfig): boolean`, true when `run` or `evidence` is blank.

- [ ] **Step 1: Write failing tests** in `issue-flow-config.test.ts`: `validateConfig` accepts a full example; rejects a missing `priority`, an empty `priority` array, a non-numeric `app.id`, a relative `privateKeyPath`, and `timeoutMinutes <= 0`, each with a `problems` entry naming the field; returns every problem at once; `needsSetup` is true for a blank `run` and for a blank `evidence`, false otherwise.
- [ ] **Step 2: Run** `claude plugin test alandovskis` — expect the new tests to FAIL (module missing).
- [ ] **Step 3: Implement** the type and both functions in `config.ts`; hand-written validation, no schema library.
- [ ] **Step 4: Run** `claude plugin test alandovskis` — expect PASS.
- [ ] **Step 5: Write `references/config.md`** from the type, with a complete JSON example and one sentence per field.
- [ ] **Step 6: Commit** `feat(issue-flow): validate the project config`.

### Task 2: GitHub App installation token

**Files:**
- Create: `alandovskis/issue-flow/token.ts`
- Create: `alandovskis/issue-flow/token-cli.ts`
- Create: `alandovskis/tests/issue-flow-token.test.ts`

**Interfaces:**
- Consumes: `IssueFlowConfig['app']` from Task 1.
- Produces: `signAppJwt(app: { id: number; privateKeyPem: string }, nowSeconds: number): string` — RS256, `iat = now - 60`, `exp = now + 540`, `iss = id`.
- Produces: `mintInstallationToken(app: IssueFlowConfig['app'], deps?: { fetch?: typeof fetch; now?: () => number; readFile?: (path: string) => string }): Promise<{ token: string; expiresAt: number }>` — POST `https://api.github.com/app/installations/{installationId}/access_tokens`.
- Produces: `token-cli.ts` — reads `.github/issue-flow.json`, prints only the token to stdout; exit 1 with a one-line message on stderr on any failure.

- [ ] **Step 1: Write failing tests**: `signAppJwt` produces a three-part token whose header is `{"alg":"RS256","typ":"JWT"}`, whose payload has the exact `iat`/`exp`/`iss` above, and whose signature verifies against the matching public key (generate a key pair in the test); `mintInstallationToken` calls the URL above with `Authorization: Bearer <jwt>` and returns `token` and `expiresAt` in epoch seconds from the response's `expires_at`; it rejects with a message containing the HTTP status on a 401; it rejects with a message naming the path when the key file cannot be read.
- [ ] **Step 2: Run** the tests — expect FAIL.
- [ ] **Step 3: Implement** with `node:crypto` (`createSign('RSA-SHA256')`) and injected `fetch`; no dependency.
- [ ] **Step 4: Run** the tests — expect PASS.
- [ ] **Step 5: Implement `token-cli.ts`**; verify by hand against a throwaway app only if the user has one, otherwise by the unit tests.
- [ ] **Step 6: Commit** `feat(issue-flow): mint a GitHub App installation token`.

### Task 3: Skill `issue-queue` — pick the next issue

**Files:**
- Create: `alandovskis/skills/issue-queue/SKILL.md`
- Create: `alandovskis/evals/issue-queue-1/` … `issue-queue-3/`
- Create symlink: `.agents/skills/issue-queue`

**Interfaces:**
- Consumes: config from Task 1 (`priority`, `labels`).
- Produces: a defined procedure other skills call: "pick the next issue" returns one issue number or "none", and "capacity" returns whether the caps (3 awaiting review, 3 implementing) allow another.

- [ ] **Step 1: Write the evals first** (they define the behaviour; each `prompt.md` is a natural request such as "Pick the next issue to work on"; the system note says no services are connected, so the reply lists the `gh` commands it would run):
  - `-1`: picks the highest-ranked priority label, oldest first on a tie; skips issues with no priority label, issues already linked to an open PR or branch, and issues carrying the needs-review, needs-setup or feasible label.
  - `-2`: with 3 PRs awaiting review it stops and says it is paused, without picking.
  - `-3`: an issue whose needs-review label was removed is eligible again and is judged, not skipped.
- [ ] **Step 2: Run** `claude plugin eval alandovskis --runs 1 --no-publish` limited to `issue-queue-*` (see `AGENTS.md`) — expect FAIL, skill missing.
- [ ] **Step 3: Write `SKILL.md`**: frontmatter `name: issue-queue`, description starting "Use when…"; the procedure with `gh issue list --state open --json number,title,labels,createdAt,assignees` and `gh pr list --json number,headRefName,body,reviewDecision` for linkage; ranking by `priority` order, highest label wins, ties oldest first; the caps; the exact skip rules above.
- [ ] **Step 4: Add the symlink; run** the evals and `scripts/validate.sh` — expect PASS.
- [ ] **Step 5: Commit** `feat(skills): add issue-queue`.

### Task 4: Agent `feasibility-judge` and skill `issue-feasibility`

**Files:**
- Create: `alandovskis/agents/feasibility-judge.md` (read-only: `Read, Glob, Grep, Bash`; frontmatter `name`, `description`, `tools`)
- Create: `alandovskis/skills/issue-feasibility/SKILL.md`
- Create: `alandovskis/evals/issue-feasibility-1/` … `-3/`; symlink `.agents/skills/issue-feasibility`

**Interfaces:**
- Consumes: one issue number; config from Task 1.
- Produces: the judge returns `{ verdict: 'feasible' | 'infeasible' | 'needs-setup', howToBuild: string, howToExercise: string, question?: string }`; the skill applies the matching label, and for infeasible and needs-setup adds a comment holding `question` or the setup gap.

- [ ] **Step 1: Write evals**: `-1` a clear, small issue is labelled feasible with a stated way to build and to exercise it; `-2` an ambiguous issue needing a design decision is labelled needs-review with the question in a comment, not guessed; `-3` a project whose config leaves `run` blank gets needs-setup on that issue only, not a stop of the flow.
- [ ] **Step 2: Run** the evals — expect FAIL.
- [ ] **Step 3: Write the agent**: read the issue (`gh issue view <n> --json title,body,comments`) and the codebase; feasible only when it can state both `howToBuild` and `howToExercise`; ambiguity or a needed decision is infeasible with `question`; it never edits files.
- [ ] **Step 4: Write the skill**: dispatch the agent, apply labels with `gh issue edit <n> --add-label …`, comment with `gh issue comment`, mark the step (Task 8 marker) `judging`.
- [ ] **Step 5: Symlink; run** evals and validate — expect PASS.
- [ ] **Step 6: Commit** `feat(skills): add issue-feasibility and its judge agent`.

### Task 5: Evidence — skill `issue-evidence` and agents `implementer`, `evidence-reviewer`

**Files:**
- Create: `alandovskis/agents/implementer.md` (tools: all; works only inside the worktree it is given)
- Create: `alandovskis/agents/evidence-reviewer.md` (read-only; checks evidence against the issue)
- Create: `alandovskis/skills/issue-evidence/SKILL.md`
- Create: `alandovskis/evals/issue-evidence-1/` … `-3/`; symlink `.agents/skills/issue-evidence`

**Interfaces:**
- Consumes: the worktree path, the issue number, the config's `run` and `evidence` text.
- Produces: `issue-evidence` captures a numbered sequence of steps, each `{ caption, file }`, pushes the files to the branch `issue-flow-evidence` under `issue-<n>/`, and returns a Markdown block of embedded raw URLs for the PR body; the reviewer returns `pass` or a list of gaps against the issue's acceptance points.

- [ ] **Step 1: Write evals**: `-1` a GUI or web feature: ordered screenshots, each captioned with the action and result; `-2` a CLI or library change: terminal captures or test/log output stand in for screenshots and the verdict is still evidence-complete; `-3` the evidence reviewer rejects evidence that never shows the changed behaviour, and the PR is not opened.
- [ ] **Step 2: Run** evals — expect FAIL.
- [ ] **Step 3: Write the two agents and the skill**: the skill follows the project's own `run` and `evidence` text (it uses `run`-style launching and driving, never assumes a browser), uses a separate worktree checkout of `issue-flow-evidence` to commit images so they stay out of the PR branch, and dispatches the reviewer before returning.
- [ ] **Step 4: Symlink; run** evals and validate — expect PASS.
- [ ] **Step 5: Commit** `feat(skills): add issue-evidence with implementer and reviewer agents`.

### Task 6: Let `create-pr` stop before the merge

**Files:**
- Modify: `alandovskis/skills/create-pr/SKILL.md` (opening paragraph and step 7)
- Create: `alandovskis/evals/create-pr-4/`

**Interfaces:**
- Produces: when the requester says to leave the merge for later (for example "stop at an open, green PR"), the skill runs steps 1–6, skips step 7, and reports the PR URL and that it is waiting. The default behaviour, which treats the request as authorisation to merge, is unchanged.

- [ ] **Step 1: Write `create-pr-4`**: prompt "Open a PR for this branch but don't merge it; I'll approve it first"; expectations: reviews, fixes, opens, watches CI, does not run `gh pr merge`, reports waiting for approval.
- [ ] **Step 2: Run** `create-pr-*` evals — expect `-4` FAIL, `-1` to `-3` PASS.
- [ ] **Step 3: Edit** the skill so the authorisation line and step 7 carry the exception.
- [ ] **Step 4: Run** evals and validate — expect all PASS.
- [ ] **Step 5: Commit** `feat(create-pr): allow stopping before the merge`.

### Task 7: Skill `issue-flow` — the orchestrator

**Files:**
- Create: `alandovskis/skills/issue-flow/SKILL.md`
- Create: `alandovskis/evals/issue-flow-1/` … `-6/`; symlink `.agents/skills/issue-flow`

**Interfaces:**
- Consumes: `issue-queue` (Task 3), `issue-feasibility` (Task 4), `issue-evidence` and the `implementer` agent (Task 5), `create-pr` stop-before-merge (Task 6), the token CLI (Task 2), the config validator (Task 1), the step marker (Task 8).
- Produces: `/issue-flow` run from inside the target repo: validate config (stop and ask on problems), mint `GH_TOKEN`, then loop: find approved PRs to merge, pick up new issues while capacity allows, watch deploys.

- [ ] **Step 1: Write evals**: `-1` the happy path, in order: validate config → token → pick → judge → worktree → implement → evidence → PR (stopping before merge) → wait; `-2` incomplete config stops everything with the problems listed; `-3` merge only after an approving review, and not on checks failing or pending; `-4` an approved PR that conflicts after another merge is rebased, re-checked, and escalated if unresolved; `-5` a dismissed approval or a later commit returns the PR to waiting; `-6` after merge it finds the workflow run for the merge commit, watches it up to `deploy.timeoutMinutes`, and on failure labels the PR, reopens the issue and comments with the run link, without trying a fix.
- [ ] **Step 2: Run** evals — expect FAIL.
- [ ] **Step 3: Write `SKILL.md`**: the loop and the worktree-per-issue rule (`git worktree add ../<repo>-issue-<n> -b issue/<n>-<slug>`), the 3/3 caps, token refresh when under five minutes remain, and the rules from Global Constraints; each phase calls the step marker. Link `references/config.md`.
- [ ] **Step 4: Symlink; run** evals and validate — expect PASS (`-3` to `-6` are judge-sensitive; read failures before editing the skill).
- [ ] **Step 5: Commit** `feat(skills): add issue-flow`.

### Task 8: Step marker, state and the panel

**Files:**
- Create: `alandovskis/issue-flow/step.ts` (marker format and parser, pure)
- Create: `alandovskis/hooks/issueflow.tsx` (state reducer and panel view, pure, modelled on `subagents.tsx`)
- Modify: `alandovskis/hooks/register.tsx` (hook Bash tool results through the parser; mount the panel)
- Modify: `alandovskis/types/index.d.ts` (the `IssueRun` type)
- Create: `alandovskis/tests/issue-flow-step.test.ts`, `alandovskis/tests/issueflow.test.tsx`

**Interfaces:**
- Produces: `STEPS = ['picking','judging','implementing','evidence','pr-open','awaiting-approval','merging','deploying','done','escalated','failed']`; `stepMarker(issue: number, step: Step, waitingOn?: string): string` returns `issue-flow: step issue=<n> step=<step>` plus ` waiting=<text>` when given; `parseStep(output: string): { issue: number; step: Step; waitingOn?: string } | null`.
- Produces: `stepped(list: readonly IssueRun[], found: { issue; step; waitingOn? }, at: number): IssueRun[]` and `issueView(tables, runs, room)`, with `IssueRun = { issue: number; step: Step; waitingOn?: string; since: number }`.
- Consumes: the way `register.tsx` hooks Bash results for `PLACE_TOOLS`; follow it.
- The orchestrator prints the marker with `echo`; the hook only reads it.

- [ ] **Step 1: Write failing tests** for `step.ts`: round trip for every step, with and without `waitingOn`; `parseStep` returns null for noise, an unknown step, and a non-numeric issue; it finds the marker amid other output lines.
- [ ] **Step 2: Run** — expect FAIL. **Step 3: Implement** `step.ts`. **Step 4: Run** — expect PASS.
- [ ] **Step 5: Write failing tests** for `issueflow.tsx`: `stepped` adds a new issue, updates an existing one's step and `since`, and keeps `done` entries only for 30 seconds in the view; the view lists issues in flight with step and `waitingOn`, shows `No issues in flight` when empty, and puts those waiting on the human first (the empty band text and the row/frame budget follow `subagents.tsx`).
- [ ] **Step 6: Run** — expect FAIL. **Step 7: Implement** the reducer and view. **Step 8: Run** — expect PASS.
- [ ] **Step 9: Wire `register.tsx`**: an atom `issueRuns`, update it from Bash results that `parseStep` recognises, render the panel above the prompt beside the existing session panel and band, hide it with `/issues`, mirroring `/subagents`. Check how the compiled `.js` siblings are produced (`git log -- alandovskis/hooks/*.js`) and regenerate them the same way.
- [ ] **Step 10: Run** `claude plugin test alandovskis` and `tsc -p alandovskis` — expect PASS; then run `claude --plugin-dir ./alandovskis` and confirm the panel shows a hand-fed marker.
- [ ] **Step 11: Commit** `feat(hooks): show issues in flight above the prompt`.

### Task 9: Documentation and release wiring

**Files:**
- Modify: `alandovskis/README.md` (skills table for `issue-flow`, `issue-queue`, `issue-feasibility`, `issue-evidence`; a Mods entry for the panel; the evals list; the final "Not included" line, since agents now exist; a "GitHub App setup" section)
- Modify: `README.md` (prerequisites: the GitHub App and its key)
- Modify: `.claude-plugin/marketplace.json` (description mentions the panel)

**Interfaces:** none.

- [ ] **Step 1: Write the GitHub App setup section**: create the app, the exact permissions from Global Constraints, install it on chosen repos, store the key outside the repo, and write `.github/issue-flow.json` per `references/config.md`.
- [ ] **Step 2: Update** the other docs listed above.
- [ ] **Step 3: Run** `scripts/validate.sh` and the full eval set for the new skills — expect PASS.
- [ ] **Step 4: Commit** `docs: document the issue-to-deploy flow`.
- [ ] **Step 5: Bump** the version in `.claude-plugin/plugin.json`, `.codex-plugin/plugin.json` and `gemini-extension.json` together, as its own commit `chore: bump version to 0.10.0`.
