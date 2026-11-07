# Issue-to-deploy flow: design

## Intent

Take GitHub issues for a project all the way to a deployed change with the human only deciding at two points: reviewing
escalated issues, and approving pull requests. The automation picks the next most important issue, judges whether it can
be done, implements it, proves it works by exercising the real app, opens a pull request, and, once the pull request is
approved, merges it and watches the deploy.

Why: today the human sits in the middle of every step. The wish is to hand over a queue and come back to reviewable work
with evidence, not to review code blind.

## Goals

- Pick the next open issue by priority label and judge its feasibility without a human.
- Escalate infeasible issues for the human's periodic review, with the reason.
- Implement feasible issues and open a pull request containing step-by-step screenshots of the AI exercising the
  feature.
- On human approval, merge and watch the project's deploy; report the outcome.
- Work on several issues at once, up to a cap of pull requests awaiting review.
- Show every issue in flight, its step and where it waits on the human, in the Claude Code session.
- Work for any kind of project (web, CLI, desktop, library, embedded). Nothing in the flow assumes a browser.

## Non-goals

- Creating, triaging or prioritising issues. Priority comes from labels the human maintains.
- Deploying. Each project's GitHub Actions workflow deploys on merge; the flow only watches it.
- Fixing a failed deploy automatically.
- Replacing Jira support. `issue-tracker` already allows Jira or GitHub Issues (merged in #5); this flow is for projects
  that use GitHub Issues.
- Scheduling in the first version.

## Anti-goals

Failures even if it technically works:

- A pull request without evidence, or with screenshots that do not show the feature being exercised.
- Merging without a human approval.
- Guessing how to run, drive or deploy a project that does not say. It stops and asks instead.
- Working around a failing check, a flaky test or branch protection to get a PR through.

## Decisions made with the human

1. **Source:** GitHub Issues, read with `gh`.
2. **Next issue:** the open issue with the highest-ranked priority label.
3. **Feasibility:** judged by the automation and recorded as a label. Infeasible issues get the needs-review label and a
   comment saying why, and the flow moves on. The human reviews that label periodically.
4. **Per issue, feasible:** implement, then open a PR for human review. The PR includes step-by-step screenshots of the
   AI exercising the feature.
5. **After approval:** merge, then the project's GitHub Actions workflow deploys on merge; the flow watches the run.
6. **Project-agnostic:** each project says how to launch and drive its app and how to capture evidence.
7. **Identity and approval:** the flow acts as a GitHub App installation (a bot), so its PRs and commits are not the
   human's. The human's approving GitHub review is the approval; no second human account is needed.
8. **Concurrency:** when a PR is open and waiting, start the next issue. At most 3 PRs may wait for review at once; at
   3, pause picking new issues.
9. **Labels:** each project chooses its own label names (priority ranking, feasible, needs-review).
10. **Visibility:** the session shows the current issue, the step each is on, and where it waits for the human.

## Decisions made by the designer (not yet confirmed by the human)

- Ties between equal priority labels go to the oldest issue.
- Configuration lives in one file in the project's repository, holding: the priority labels in rank order; the names of
  the feasible, needs-review and any status labels; how to launch and drive the app; how to capture evidence; the
  deploy workflow name. If the file is missing or incomplete, the flow stops and asks.
- Each issue is implemented in its own git worktree on its own branch, so issues in flight do not interfere.
- Approval is detected by polling GitHub for approved PRs.
- The flow is started by a command the human runs. Scheduling can be added later.
- A failed deploy gets a label and a comment linking the failing run. No automatic fix.
- A project that does not say how to run it is labelled as needing setup and escalated like an infeasible issue.
- Reuse the existing `create-pr` skill for the review, fix, PR and merge steps; add deploy watching and evidence on top.
- Components, in the style of the existing plugin (`alandovskis/`):
  - **Skills:** pick the next issue, judge feasibility, capture evidence, run the flow. Each ships evals in
    `alandovskis/evals/<skill>-<n>/` and a symlink in `.agents/skills/`.
  - **Agents** (new `alandovskis/agents/` directory): a feasibility judge (read-only) and an implementer.
  - **Hook:** observes the flow's steps and records state per issue.
  - **Mod:** a panel above the prompt listing every issue in flight, its step and what it waits on, built the way the
    session panel and subagent band are.
  - The root and plugin READMEs are updated, including the line saying agent definitions are not included.

## Further designer calls (from the builder check)

- **GitHub App:** the app needs read/write on Contents, Pull requests and Issues, and read on Actions and Checks, and is
  installed only on chosen repos. The project config references the app ID, installation ID and the location of the
  private key, which is stored outside the repo. A small script in the plugin mints the short-lived installation token
  (about an hour) and passes it to `gh` as `GH_TOKEN`; the flow refreshes it when needed. App tokens trigger CI and
  deploy workflows, unlike the default Actions `GITHUB_TOKEN`. Creating the app is a one-time manual step documented in
  the plugin README.
- **Run location:** the flow runs from inside the target project's checkout; worktrees and the config file are found
  from there.
- **State:** GitHub is the source of truth (labels and PRs), so the flow is stateless and rebuilds its view each run and
  poll. The hook's per-issue state only feeds the panel and is not needed to resume. The flow runs inside one session
  and can be re-invoked after the session closes.
- **Caps:** at most 3 PRs await review and at most 3 issues are being implemented at once.
- **Merge:** squash, as `create-pr` does, only when required checks pass and the PR is mergeable. If an approved PR
  conflicts with `main`, rebase and re-run the checks; if the rebase changes behaviour, capture fresh evidence; if it
  cannot be resolved, label it needs-review with a comment. The human's approving review is the approval. A dismissed approval or new commits after approval cancel
  the approval and the PR goes back to waiting.
- **Feasibility:** an issue is feasible only if the judge can state how it will be implemented and how it will be
  exercised. Ambiguous issues, or ones needing a design decision, are infeasible with the question in the comment. A
  missing or incomplete config stops the whole flow; a config that does not say how to run or drive the app labels only
  that issue as needing setup.
- **Evidence:** evidence is whatever shows the feature exercised in that project: screenshots for GUIs, terminal
  captures for CLIs, logs or test output for libraries and embedded work. A separate evidence-review agent checks it
  against the issue before the PR opens. Images go on a dedicated branch of the repo (not the PR branch) and are linked
  from the PR body.
- **Failed deploy:** the label and comment go on the merged PR and the issue is reopened. The flow watches the run
  started by the merge commit and gives up after a timeout set in the config. A failed deploy does not count against
  the caps.
- **Queue edge cases:** with several priority labels, the highest counts. Issues with no priority label are skipped.
  Issues already linked to an open PR or branch are skipped. Removing the needs-review label re-queues an issue to be
  judged again.

## Constraints

- Follow the repo: conventional commits, `scripts/validate.sh` passes, evals with each skill, version bump as its own
  commit.
- Skills describe operations, not host tool names; Claude-specific pieces (agents, hooks, mod) are documented as such.
- Hooks observe and never block.
- Never use `--admin` or bypass branch protection; never rerun, skip or disable a check to get green.

## Left to the builder

- Exact label and config-file names and format.
- Feasibility criteria and how the judge reads the issue and codebase.
- How evidence is captured per project type and how it is attached to a PR (images cannot be uploaded through the
  GitHub API directly; pick a hosting approach, such as committing them to the PR branch or a dedicated branch).
- Polling interval and how the flow runs between polls.
- Panel layout.
- Ordering of the implementation in the plan (the tracker switch is already done).
