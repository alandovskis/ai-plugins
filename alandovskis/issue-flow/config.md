# Project config

Each target repo keeps its issue-flow settings in `.github/issue-flow.json`. `validateConfig` in
`config.ts` (compiled to `config.js` beside it) checks it and reports every problem at once.
Every field is required.

```json
{
  "priority": ["p0", "p1", "p2"],
  "labels": {
    "feasible": "feasible",
    "needsReview": "needs-review",
    "needsSetup": "needs-setup",
    "deployFailed": "deploy-failed"
  },
  "app": {
    "id": 1234,
    "installationId": 5678,
    "privateKeyPath": "/home/me/.keys/issue-flow.pem"
  },
  "run": "cargo run --release",
  "evidence": "Record the terminal session with asciinema and attach the cast",
  "deploy": {
    "workflow": "deploy.yml",
    "timeoutMinutes": 30
  }
}
```

| Field | Meaning |
| --- | --- |
| `priority` | Issue labels in priority order, highest first; a non-empty array. |
| `labels.feasible` | Label that marks an issue as feasible to take on. |
| `labels.needsReview` | Label put on an issue that needs a person's review. |
| `labels.needsSetup` | Label put on an issue when `run` or `evidence` is blank. |
| `labels.deployFailed` | Label put on the merged PR when its deploy fails; the issue is reopened and labelled too, so it is not picked again. |
| `app.id` | The GitHub App's numeric ID (a positive integer). |
| `app.installationId` | The numeric ID of the App's installation on the repo (a positive integer). |
| `app.privateKeyPath` | Absolute path to the App's private key file; relative paths and `~` are rejected. |
| `run` | How to launch and drive the app. May be blank, but then the repo needs setup. |
| `evidence` | How to capture evidence that a change works. May be blank, but then the repo needs setup. |
| `deploy.workflow` | File name of the GitHub Actions workflow that deploys. |
| `deploy.timeoutMinutes` | Minutes to wait for the deploy before treating it as failed; above 0. |

`needsSetup(config)` is true when `run` or `evidence` is blank (whitespace only counts as blank).
