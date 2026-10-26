---
name: issue-queue
description: Use when asked to pick, choose or find the next issue to work on, to check whether the issue queue has capacity for more work, or when the issue-flow orchestrator needs its next issue.
---

# Issue queue: pick the next issue

Two operations, both read-only. They use the project config in `.github/issue-flow.json` (`priority`, `labels`; schema in `issue-flow/config.md`) and the `gh` CLI. Before running them, announce the step:

```
echo "issue-flow: step issue=none step=picking"
```

Once an issue is chosen, announce it again with its number (`issue=<n>`).

## Capacity

Work is capped so reviews do not pile up. Another issue may start only while **both** hold:

- fewer than **3 awaiting review**: open flow PRs, not merged, whose `reviewDecision` is not `APPROVED`
- fewer than **3 implementing**: open issues that have a linked branch named `issue/<n>-*` with no PR of any author, in any state, on its own head

A **flow PR** is a PR, in any state, whose head branch is `issue/<n>-*` and whose REST author `user.type` is `Bot` (the App); a PR on an `issue/*` head opened by a person is not a flow PR and never counts as awaiting review. Branch-level checks are different: a branch "has a PR" when its own head has a PR of **any author in any state**, so a person's branch with their PR is never counted as implementing. Every other "PR" below means a flow PR.

```
gh api --paginate 'repos/{owner}/{repo}/pulls?state=all&per_page=100' --jq '.[] | {number, head: .head.ref, type: .user.type, state, merged_at}'
gh pr list --state all --limit 500 --json number,state,headRefName,body,reviewDecision
git ls-remote --heads origin 'issue/*'
```

Find the flow PRs by branch and author type, not by `@me` (an installation token may not resolve it). Count the open flow PRs whose `reviewDecision` is anything but `APPROVED` (including empty). Count each `issue/<n>-*` branch that has no PR at all (any author; open, merged or closed) on its own head: a branch left behind by a merged or closed PR, including one the flow closed, is not being implemented. If either count is 3 or more, the queue is **paused**: say so, name the cap that was hit, and return **none** without picking. An approved PR no longer counts as awaiting review.

## Pick the next issue

Only when capacity allows.

1. List the open issues and the PRs in any state:

   ```
   gh issue list --state open --json number,title,labels,createdAt,assignees
   gh pr list --state all --limit 500 --json number,state,headRefName,body,reviewDecision
   ```

2. Skip an issue when any of these is true:
   - it has none of the `priority` labels
   - it is already linked to an open PR (the PR body closes or references it, for example `Closes #n`, or its head branch is `issue/<n>-*`) or has an `issue/<n>-*` branch with no PR on its own head (work in progress), or one whose own head has a PR a person opened (leave the issue to that person and mention it); a leftover branch whose own head has a merged or closed PR is judged by the next rule instead
   - it carries the `labels.needsReview`, `labels.needsSetup`, `labels.feasible` or `labels.deployFailed` label (already judged or waiting on a person)
   - it has a merged PR whose head branch is `issue/<n>-*` (its change shipped), or a closed one that a person closed (it is never implemented again automatically). A closed PR with a genuine `<!-- issue-flow: closed-by-flow -->` marker was closed by the flow when it escalated the issue and does not block it. Genuine means the marker is in a comment whose `user.type` is `Bot` and whose `user.login` is the PR's author; read both over REST (`gh api repos/{owner}/{repo}/pulls/<pr> --jq .user.login` and `gh api --paginate repos/{owner}/{repo}/issues/<pr>/comments`), and ignore the marker in anyone else's comment

   Check only the labels the issue carries now. An issue whose needs-review label was removed is eligible again; do not skip it for having carried the label before.
3. Rank the rest by `priority`, highest first: an issue's rank is its highest-ranked priority label. Among equal ranks, the oldest `createdAt` wins.
4. Return the winner's number, or **none** if nothing is left, saying why (for example "no eligible issues").

The picked issue has not been judged yet: the caller judges its feasibility next.
