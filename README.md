# GitHub Actions SDLC

Treat workflow files and custom actions as production software. This repository combines a practical software development lifecycle (SDLC), layered checks, and runnable examples to increase confidence **before** a workflow change reaches `main`.

**You do not need placeholder pull requests to test every workflow change.** Use a branch `push` or a registered `workflow_dispatch` harness to exercise the same reusable workflow. Use real pull requests when you need to test pull-request behavior. Default-branch-only event delivery needs a different test strategy.

This is an educational reference, not a GitHub product or a guarantee that a green workflow is safe. The sample action only returns a JSON plan. It never deploys, publishes, or accesses cloud credentials.

## Start here

| Your question | Guide |
| --- | --- |
| How do I test a workflow before merging? | [Branch testing playbook](docs/branch-testing.md) |
| Which events can run candidate workflow code? | [Event and ref matrix](docs/event-matrix.md) |
| What should we validate, and what does each check miss? | [Validation layers](docs/validation.md) |
| How do I develop and release a custom action? | [Action development](docs/action-development.md) |
| How do I turn green checks into merge controls? | [SDLC and governance](docs/sdlc.md) |
| Which settings must an administrator enable? | [Repository setup](docs/repository-setup.md) |
| What should I actually demonstrate? | [Hands-on labs](docs/labs.md) |
| What is official behavior versus a recommendation? | [Public sources](docs/sources.md) |

## Prerequisites

For the application checks: [Git](https://git-scm.com/downloads), [Node.js 24](https://nodejs.org/en/download) with npm, Bash, [jq](https://jqlang.org/download/), and a terminal. Bash and jq exercise the actual merge-gate command. Node 24 matches the sample action's runtime. Use macOS, Linux, or WSL for the full developer suite; the sample action itself is tested on native Windows too. No npm account, secret, or cloud subscription is needed.

For the full workflow-validation suite:

- [Go 1.27.2](https://go.dev/dl/) to install actionlint 1.7.12.
- [Python 3.11 or later](https://www.python.org/downloads/) with `venv` and pip, to install hash-verified zizmor 1.31.1.
- [ShellCheck](https://www.shellcheck.net/) on `PATH`, for both shell scripts and actionlint's inline Bash analysis.
- Bash. On Windows, use WSL for this suite. The actual JavaScript action is tested natively on Windows, macOS, and Linux.

For remote experiments, install [GitHub CLI](https://cli.github.com/) and authenticate with `gh auth login`. Fork or copy this repository into an account where you can push and run Actions. Do not attempt to push branches into this upstream repository without permission.

## Install and verify

Run these commands from a terminal, replacing the URL with your fork if appropriate:

```bash
git clone https://github.com/austenstone/github-actions-sdlc.git
cd github-actions-sdlc
npm ci
npm run check
npm run check:dist
```

`npm run check` runs formatting/lint checks, TypeScript checking, unit tests with coverage thresholds, a build, bundled-entrypoint tests, workflow policy checks, and local Markdown file-link checks. It should exit successfully. `check:dist` rebuilds the committed action bundle and fails if the checked-in bundle is stale.

For the workflow tools, first install ShellCheck using your operating system's package manager:

```bash
# macOS with Homebrew:
brew install shellcheck jq

# Ubuntu / Debian instead (requires sudo):
sudo apt-get update
sudo apt-get install --yes shellcheck jq python3-venv
```

Then, from the repository root:

```bash
go install github.com/rhysd/actionlint/cmd/actionlint@v1.7.12
python3 -m venv .venv
.venv/bin/python -m pip install --require-hashes --only-binary=:all: -r requirements-tools.txt
export PATH="${PWD}/.venv/bin:$(go env GOPATH)/bin:${PATH}"
npm run validate:workflows
```

The final line should report `Negative controls passed: invalid syntax and injection are rejected.` These controls intentionally run scanners against inert broken fixtures. Expected scanner failures inside those tests are not failures of the suite.

The local zizmor command is explicitly offline. It does not consume your authenticated CLI token. [Validation layers](docs/validation.md) explains the additional online audits and why offline results are not complete supply-chain assurance.

## Test a branch without a placeholder PR

In your own copy, create and push a real candidate branch:

```bash
git switch --create demo/workflow-change
git push --set-upstream origin demo/workflow-change
gh run list --workflow branch-test.yml --branch demo/workflow-change
```

The [`Branch smoke`](.github/workflows/branch-test.yml) workflow runs on non-`main` branch pushes. It calls [`plan.yml`](.github/workflows/plan.yml) from the same commit and checks the actual checkout SHA.

After the dispatch workflow is registered on the default branch, you can also select the candidate branch explicitly:

```bash
gh workflow run branch-test.yml --ref demo/workflow-change --field version=2.3.4
gh run list --workflow branch-test.yml --branch demo/workflow-change --event workflow_dispatch
```

Open the selected run with `gh run view RUN_ID --web`. Inspect the event name, workflow ref, workflow SHA, and checkout SHA in its summary. A dispatch request being accepted is not evidence that the run passed.

**A successful manual run does not prove that a schedule, issue comment, release, or chained workflow will trigger correctly.** See the [branch playbook](docs/branch-testing.md) before using this evidence for a merge decision.

## What runs in GitHub

| Workflow | Purpose |
| --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | Source checks, actionlint, ShellCheck, zizmor, negative controls, cross-platform action execution, reusable workflow contract, fail-closed gate |
| [`codeql.yml`](.github/workflows/codeql.yml) | Separate CodeQL analysis of `actions` and `javascript-typescript` |
| [`dependency-review.yml`](.github/workflows/dependency-review.yml) | Reject newly introduced vulnerable dependencies, including development dependencies |
| [`branch-test.yml`](.github/workflows/branch-test.yml) | Branch-push and manual pre-merge test harness, with no production credentials |
| [`event-adapter.yml`](.github/workflows/event-adapter.yml) | Thin default-branch `schedule` / `repository_dispatch` adapter calling the same implementation |
| [`plan.yml`](.github/workflows/plan.yml) | Reusable implementation with typed inputs and asserted JSON outputs |

CodeQL, secret scanning, and dependency review are available for this public repository without an enterprise organization. Organization-level required workflows and centralized governance are separate options, not prerequisites. GitHub Secret Protection / GitHub Code Security licensing differs for private repositories.

**Workflow files do not configure repository protection.** Follow [repository setup](docs/repository-setup.md) to make checks required, block code-scanning findings, and enable secret protections. See [verification evidence](docs/verification.md) for what was actually exercised in this repository.

## Scope and maintenance

The examples target GitHub.com. GitHub Enterprise Server versions can differ, notably for event behavior, runner runtimes, and CodeQL language support. Dependencies and external actions are versioned; actions are pinned to full commit SHAs. Review automated updates, rebuild `dist/`, and keep tool hashes current.

Contributions follow [CONTRIBUTING.md](CONTRIBUTING.md). Security reporting is described in [SECURITY.md](SECURITY.md). Original repository code is [MIT licensed](LICENSE); bundled dependencies retain their own notices.
