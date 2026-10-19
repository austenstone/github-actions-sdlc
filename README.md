# GitHub Actions: change, experiment, validate, PR

How far can you get testing workflow changes on a branch, before merging them? What can GitHub check when the changed workflow cannot run on a PR? When is a fork actually necessary?

This is a **workflow-only experiment lab**. No application, custom action, test framework, or script files. The workflows themselves are the subject.

## The developer loop

1. Create a branch and change workflow YAML.
2. Push or manually run that revision on GitHub.
3. Open a normal PR. actionlint, zizmor, and CodeQL inspect the proposed files; the runtime workflow exercises the candidate.
4. Review the actual event, SHA, permissions, and results. Required checks enforce the tested revision, but not every kind of run is eligible.
5. For default-branch events, distinguish testing the workflow's steps from testing GitHub's event delivery. Use a fork/sandbox only for the gap you cannot reproduce safely.

**A branch isolates code changes, not access.** A same-repository branch can access repository secrets and request token permissions. These examples use only random synthetic secrets and a harmless commit-status write.

## What is here

| Workflow | What it demonstrates |
| --- | --- |
| [Validate workflow files](.github/workflows/validate.yml) | actionlint + ShellCheck and zizmor inspect YAML without executing the workflow being inspected |
| [CodeQL](.github/workflows/codeql.yml) | Native Actions-language security analysis and code-scanning merge protection |
| [Runtime experiment](.github/workflows/event-adapter.yml) | Actual branch/PR/manual/default-event execution, printing the workflow and checkout revisions |
| [Manual isolation experiment](.github/workflows/branch-test.yml) | Manual evidence, synthetic secret availability, read/write token probes, and a main-only environment |

The retained filenames let us compare an already registered default-branch workflow with its changed branch version. They do not imply a custom action or deployment application.

## Try it

Prerequisites: Git, authenticated [GitHub CLI](https://cli.github.com/), and write/Actions access to your own authorized copy. No Node, npm, Python, or cloud account is needed. Enabling Actions and copying files does not copy upstream settings or secrets.

```bash
git clone https://github.com/OWNER/REPO.git
cd REPO
git switch --create experiment/workflow-change
# Change MARKER in .github/workflows/event-adapter.yml.
git add .github/workflows/event-adapter.yml
git commit --message "Experiment with a workflow revision"
git push --set-upstream origin experiment/workflow-change
gh run list --workflow event-adapter.yml --branch experiment/workflow-change
```

Replace `OWNER/REPO` with your authorized repository. The push run should print the new marker and candidate SHA. Open its run summary, then create a normal PR with `gh pr create`.

For a registered workflow, repeat manually without making a new commit:

```bash
gh workflow run branch-test.yml --ref experiment/workflow-change
gh run list --workflow branch-test.yml --branch experiment/workflow-change
gh run view RUN_ID --log
```

Replace `RUN_ID` with the returned run ID. Dispatch acceptance is not a successful result. The manual run expects its read-only status request to return HTTP 403 and its write-scoped request to return HTTP 201; the latter adds an informational `Lab write-token probe` status to its own commit, never a required status.

Read the [experiments](docs/experiments.md), [merge-enforcement boundary](docs/enforcement.md), and [recorded results](docs/results.md) before adopting a recommendation.

## Validation versus proof

actionlint checks workflow structure and expressions; ShellCheck covers supported inline shell; zizmor and CodeQL find known security patterns. They can inspect a scheduled workflow in a PR **without its schedule firing**.

None proves that arbitrary workflow code is safe or that GitHub will deliver a different event. A green manual run is useful reviewer evidence but is not automatically an eligible required PR check. See the [documented native boundary](docs/enforcement.md).

## Merge controls

Require `Actionlint`, `Zizmor`, `Analyze (actions)`, and `Runtime experiment`, all from the GitHub Actions app. Keep code-scanning alert protection separate from analysis-job success. Enable secret scanning and push protection. Use code-owner review for a team; this single-maintainer lab does not require self-approval.

Everything is GitHub-hosted. A public repository is enough for these experiments; no enterprise-only feature or fork is assumed. See [contributing](CONTRIBUTING.md) and [security](SECURITY.md).
