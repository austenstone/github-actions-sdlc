# Repository settings and merge enforcement

Files in Git do not configure branch protection, enable every security feature, or prove those settings are active. Apply and verify repository settings separately. [Verification evidence](verification.md) records this repository's observed state.

## Public personal repo versus organization

| Capability | Public personal repository | Why use an organization? |
| --- | --- | --- |
| Native Actions, branch/manual harness, reusable workflows | Sufficient for this demo | Shared runners, policies, billing, permissions |
| CodeQL workflow and action-source analysis | Available publicly | Private repository licensing and centralized rollout |
| Secret scanning / push protection | Public-repository capabilities available | Organization policy, custom patterns and governance depending on plan |
| Dependency review and Dependabot | Public repository supported | Centralized policy and ownership |
| Protected branches / repository rulesets | Public-repository controls available | Fleet-wide controls and delegated administration |
| Centrally required workflows | Not demonstrated by this personal repo | Organization rulesets and applicable plan |
| Merge queue | Trigger compatibility is implemented, not a personal-repo queue demo | Availability is organization/plan dependent |
| Enterprise runner groups, private networking, identity policy | Not represented by this demo | Use an authorized organization such as octodemo when these are the subject |

This guide is not a licensing quote. Check the current [security feature documentation](https://docs.github.com/en/code-security/getting-started/github-security-features) and your account settings.

## Initial setup

1. Copy the repository and enable Actions. Confirm organization policy permits the pinned GitHub-owned actions used here.
2. Use `main` as the default branch, or update the explicit `main` filters consistently.
3. Run CI and CodeQL once from the default branch so checks and scanners are discoverable.
4. Use CodeQL **advanced setup** for the committed workflow. Do not leave conflicting default setup enabled; default setup can prevent advanced results from being accepted.
5. Enable the dependency graph, Dependabot alerts, secret scanning alerts, and repository push protection where available.
6. Restrict the default `GITHUB_TOKEN` to read access and leave "Allow GitHub Actions to create and approve pull requests" off unless you have a separate documented need.
7. Apply a branch ruleset or branch protection for `main`.

## Recommended merge rules

Require pull requests and conversation resolution; prevent force pushes and branch deletion. For a team, require an independent review, dismiss stale approvals after new commits, and require code-owner review. Update [CODEOWNERS](../.github/CODEOWNERS) to your maintainers.

For a one-person educational repository, a PR requirement with zero mandatory approvals can avoid a self-approval deadlock. This is weaker than independent review; do not present it as equivalent.

Require these checks by their actual names as reported by GitHub:

| Check | Purpose |
| --- | --- |
| `Required gate` from CI | Source, static workflow validators, native action matrix, reusable contract |
| `Analyze (actions)` from CodeQL | Workflow-language analysis ran |
| `Analyze (javascript-typescript)` from CodeQL | Action source analysis ran |
| `Dependency review` | Dependency diff policy |

Names displayed with workflow prefixes in the UI may differ from the check-run `name` field used by APIs. Inspect the real check runs; do not guess contexts from filenames. Pin required checks to the GitHub Actions app where supported.

Require the branch to be up to date before merge, or use a supported merge queue. These workflows include `merge_group` and dependency-review base/head handling, but the queue itself is not enabled by YAML.

## Findings are a separate merge rule

Configure code-scanning merge protection to require CodeQL and block security findings at your selected threshold (recommended baseline: high/critical, plus applicable quality alerts). Requiring a successful analysis job only proves the scan completed.

For stronger baselines, block lower-severity findings after measuring signal and establishing an exception process. Set policy deliberately; do not conflate the analyzer's exit status with the result set.

If a setting is unavailable for your plan, state that limitation rather than claiming enforcement. Keep the mandatory zizmor and dependency-review CLI/action gates; they are not replacements for CodeQL alert policy.

## Verify, do not assume

From an authorized admin terminal:

```bash
gh api repos/OWNER/REPO --jq '.security_and_analysis'
gh api repos/OWNER/REPO/branches/main/protection
gh api repos/OWNER/REPO/rulesets
gh api repos/OWNER/REPO/actions/permissions/workflow
```

Replace `OWNER/REPO`. A 404 can mean insufficient access or an absent setting; it is not evidence that everything is configured.

Exercise a real PR that fails a required check. Confirm the merge control blocks it. Fix the failure and confirm the latest commit is the one evaluated. Separately validate a code-scanning policy using a safe isolated exercise, not a real credential or exploitable production change.

## Bootstrap limitations

The first commit necessarily introduces the validation machinery before that machinery can enforce its own introduction. Record this bootstrap explicitly. Do not confuse a setup-time admin bypass with normal operation.

A fork does not inherit all upstream repository settings, secrets, environment rules, or organization policies. "Use this template" or cloning the files is only step one.
