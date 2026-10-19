# What GitHub actually enforces

There are two separate questions: **can the candidate run?** and **does this result count toward merging this PR?**

## Native checks versus linked evidence

| Evidence | Useful for review | Native required PR check |
| --- | --- | --- |
| actionlint / zizmor / CodeQL scanning proposed YAML on `pull_request` | Yes, including files whose triggers do not fire on PRs | Yes, with the corresponding context and app required |
| Runtime job on `pull_request` | Yes, normally at the merge revision | Yes |
| Runtime job on `push` | Yes, at the pushed revision | Eligible, subject to latest-head/test-merge SHA selection |
| Manual `workflow_dispatch` on the same head SHA | Yes | Not eligible under the documented Actions event rule |
| Manual run on an older SHA | Historical only | Not proof for the latest candidate |
| Run in a fork/sandbox | Yes, with explicit identity and configuration differences | Not automatically an upstream check |
| CodeQL analysis job completed | Analysis finished | Does not itself mean no findings; require the alert policy too |

GitHub's [required-check troubleshooting guide](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks) is the authoritative reference. It lists eligible events, latest-commit requirements, and test-merge versus head-check selection. `merge_group` is separately required for merge queues.

## Important limits

- A required check is a reported result, not proof that every intended line executed. Job-level skips and neutral results can satisfy requirements; missing workflow runs can remain pending. The required runtime job here has no skip condition.
- A check from the current test-merge revision can take precedence over head-only results. Record both the workflow and checkout SHA instead of assuming that a branch label identifies the tested code.
- Binding a required check to the GitHub Actions app prevents another app from satisfying it, but does not make its YAML immutable. An author can change a job with the same name. Review workflow changes; use centrally enforced workflows when that stronger boundary is needed.
- Static tools catch classes of mistakes. They cannot prove arbitrary code safe, validate every remote system, or simulate actual event delivery.
- A read-only default token is not an absolute ceiling for same-repository workflow authors. Jobs can request additional supported permissions; environment/ref policies and repository access remain separate controls.

## This lab's final merge policy

Require `Actionlint`, `Zizmor`, `Analyze (actions)`, and `Runtime experiment`, from the GitHub Actions app, against an up-to-date PR. No path filter suppresses these PR workflows. Require conversation resolution and protect against force pushes/deletion, including for admins.

Separately require CodeQL results with high-or-higher security alerts and error-level alerts blocked. Secret scanning and push protection are enabled. Dependabot updates pinned Actions dependencies.

`Manual evidence` is deliberately **not** a final required context. Review its link when it answers something the PR runtime cannot, but do not mislabel a human review convention as automatic enforcement.

This is a single-maintainer lab, so mandatory approval count is zero. A team should add independent/code-owner approval covering workflow YAML and its configuration.

The former JavaScript checks and npm dependency review were removed because there is no application or package graph left. This is a focused workflow-validation example, not an exhaustive supply-chain suite.

## Inspect your copy

Files do not copy server-side protections. With authorized repository access:

```bash
gh api repos/OWNER/REPO/branches/main/protection
gh api repos/OWNER/REPO/rulesets
gh api repos/OWNER/REPO/environments/restricted-lab
gh api repos/OWNER/REPO --jq '.security_and_analysis'
gh pr checks PR_NUMBER --required
```

Use the actual names reported by check runs. A public personal repository can demonstrate these core capabilities without enterprise features. Forks, private repos, organization-enforced policies, and GHES versions may differ.
