# Verification evidence

This file records observed results, not intended configuration. Verification date: **2026-10-19**. Do not infer a passing check, protected branch, or delivered event from the presence of workflow files.

## Verified locally

The published code at `7d615ab0a71fb39aedaad59ba28892fe2c65a625` was cloned into a new directory and exercised with a fresh `npm ci` and a fresh Python virtual environment on macOS, using Node 26.11.1. This was a clean checkout, not a pristine OS image. The native runs below additionally confirm the Node 24 toolchain and hosted runners.

| Check | Observed result |
| --- | --- |
| Formatting and strict TypeScript checking | Passed |
| Unit, policy, and actual gate-command tests | 42 passed |
| Planner / event-normalizer coverage thresholds | 100% lines, statements, branches, and functions for those two small modules |
| Bundled action process / output protocol tests | 6 passed |
| Rebuild comparison against committed bundle and notices | Passed with no diff |
| actionlint 1.7.12 and ShellCheck | Passed |
| zizmor 1.31.1, offline, strict collection, pedantic | No unsuppressed findings; [six bounded compatibility exceptions](validation.md#temporary-self-repository-syntax-exception) |
| Deliberately invalid/insecure workflow fixtures | Rejected with the expected diagnostics |
| npm dependency audit | Zero reported vulnerabilities at validation time |
| Local documentation file links | Passed |
| Public reference links | HTTP responses checked; availability is not permanent |

## Native execution confirmed

The following run conclusions and relevant logs were read from GitHub. The default-branch CI exercised source checks, workflow validators, the fail-closed gate, the reusable workflow, and the actual action on Linux, Windows, and macOS.

| Experiment | Evidence | Observed result |
| --- | --- | --- |
| Default-branch CI at `7d615ab` | [CI](https://github.com/austenstone/github-actions-sdlc/actions/runs/39281223796) | All seven jobs passed, including the three native operating systems and required gate |
| Workflow and source security analysis at `7d615ab` | [CodeQL](https://github.com/austenstone/github-actions-sdlc/actions/runs/39281223785) | Both analyses passed; uploaded `actions` and `javascript-typescript` results each reported zero findings and no analysis error |
| Candidate workflow with default changed from `1.2.3` to `2.0.0` | [Branch dispatch](https://github.com/austenstone/github-actions-sdlc/actions/runs/39280889262) | Passed; logs show version `2.0.0`, asserted JSON output, and matching workflow/checkout SHA `6579baae2afba64b8a09e0ba9935d2305b4d2d65`, while the change remained unmerged |
| Full CI against that candidate | [Candidate CI](https://github.com/austenstone/github-actions-sdlc/actions/runs/39280892087) | Passed through explicit branch dispatch without a placeholder PR |
| Deliberately invalid version | [Negative dispatch](https://github.com/austenstone/github-actions-sdlc/actions/runs/39281147346) | Failed as expected with the version-validation diagnostic, not a tool or runner failure |
| Explicit base/head dependency comparison | [Dependency review](https://github.com/austenstone/github-actions-sdlc/actions/runs/39280896012) | Passed for the supplied non-vulnerable diff; not a demonstrated vulnerable-PR rejection |
| Real `repository_dispatch` | [Default-branch adapter](https://github.com/austenstone/github-actions-sdlc/actions/runs/39280901499) | Input normalization and the called preview-plan workflow both passed |

The full current default-branch results are on the [Actions page](https://github.com/austenstone/github-actions-sdlc/actions). No test PR was opened or merged as part of bootstrap. Dependabot independently generated update PRs, which also exercised the PR workflows. The two `demo/` branches are intentionally unmerged examples, not production release branches.

## Security configuration observed

- Public repository; default `GITHUB_TOKEN` permission is read-only, and workflow PR creation/approval is disabled.
- Secret scanning, repository push protection, and Dependabot security updates are enabled.
- Private vulnerability reporting is enabled.
- CodeQL uses the committed advanced workflow; conflicting default setup is not enabled.
- An active [CodeQL merge-protection ruleset](https://github.com/austenstone/github-actions-sdlc/rules/25416281) targets `main`, with no bypass actors, high-or-higher security alerts, and error-level code-scanning alerts.

Required-check branch protection is applied after this bootstrap evidence commit: pull requests, an up-to-date branch, conversation resolution, no force pushes or branch deletion, and administrator enforcement. The required contexts are `Required gate`, `Analyze (actions)`, `Analyze (javascript-typescript)`, and `Dependency review`, bound to the GitHub Actions app.

This is a single-maintainer demo, so mandatory approval count is zero and code-owner approval is not required. That avoids self-approval deadlock but does not provide independent review. Query the live [branch-protection API](https://api.github.com/repos/austenstone/github-actions-sdlc/branches/main/protection) with authorized `gh api` access for the authoritative state. The configuration and team-strengthening steps are in [repository setup](repository-setup.md).

## Still unverified

Real PR merge blocking, code-scanning alert blocking, cron delivery, merge-queue execution, fork approval behavior, and production deployment behavior have not been demonstrated by the evidence above. Configured rules are not a substitute for those experiments. The repository intentionally performs no production deployments.

The first commits were direct default-branch bootstrap commits, before required-check protection could govern normal contributions. Subsequent work should follow the documented PR lifecycle.
