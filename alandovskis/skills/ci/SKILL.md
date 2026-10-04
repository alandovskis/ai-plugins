---
name: ci
description: Use GitHub Actions for continuous integration and delivery. Use whenever setting up, changing or discussing CI/CD, build or test automation, linting pipelines, release or deploy workflows, or when a project has no CI yet.
---

# CI: GitHub Actions

Continuous integration for every project uses **GitHub Actions**. Do not introduce other CI systems (GitLab CI, CircleCI, Jenkins, Travis, etc.) unless the user explicitly asks.

## Rules

1. **Workflows live in `.github/workflows/*.yml`.** One workflow per concern (for example `ci.yml` for build, lint and test; `release.yml` for releases).
2. **Run on pull requests and pushes to the default branch** (`on: pull_request` and `on: push` with `branches: [main]`), plus `workflow_dispatch` for manual runs.
3. **Use current action versions.** Look up the latest release of each action before writing it (for example `actions/checkout`, `actions/setup-node`) and pin to its major version, or to a full commit SHA for third-party actions.
4. **Least privilege.** Set top-level `permissions: contents: read` and grant extra permissions per job only when needed.
5. **Cache dependencies** with the setup action's built-in cache option or `actions/cache`.
6. **Use a build matrix** only when supporting several runtimes or operating systems is a real requirement.
7. **Secrets** come from GitHub Actions secrets or environments, never from files in the repository. Use environments with required reviewers for production deploys.
8. **Set `concurrency`** with `cancel-in-progress: true` for pull request runs, and a `timeout-minutes` on each job.
9. **Keep logic in the repository** (a Makefile, script or package task) and have the workflow call it, so the same command runs locally and in CI.
10. **Validate before committing** with `actionlint` when available, and check the run with `gh run list` / `gh run watch` after pushing.

## Workflow

- If a project has no CI, add `.github/workflows/ci.yml` that runs the project's existing build, lint and test commands.
- If the project uses another CI system, ask the user before migrating.
- Mention CI expectations (required checks on pull requests) in requirements and plans.
