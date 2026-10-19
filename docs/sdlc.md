# An SDLC for workflow changes

The objective is not "as many scans as possible." It is enough independent evidence, at the right trust boundaries, to make a defensible merge and release decision.

## Lifecycle and exit criteria

| Phase | Work | Exit evidence |
| --- | --- | --- |
| Design | Define trigger, workflow/code refs, input/output contract, credential scope, failure and rollback behavior | Risk classification and test plan |
| Develop | Keep adapters thin; extract testable logic; use least privilege; pin dependencies | Source, tests, and generated artifacts agree |
| Local validation | Parse/lint, security checks, contracts, negative controls | Clean local results; scanners demonstrably reject broken fixtures |
| Branch integration | Native harness at candidate SHA with no production authority | Run URL, event, workflow SHA, checkout SHA, asserted outputs |
| Event integration | Real event in sandbox where branch testing cannot establish delivery | Trigger/filter/context evidence and documented fidelity gaps |
| Review | Review YAML as code, trust changes, action updates, generated bundle, and missing coverage | Required reviews and checks on current candidate |
| Merge | Enforce rules; test merge-group revision when applicable | Server-enforced required checks and alert policy |
| Promote | Grant deployment authority only to a reviewed release path | Environment approval, scoped OIDC, artifact identity |
| Observe | Run a harmless native canary; monitor duration, failures, queueing, permissions | Confirmed real-event result and actionable alerts |
| Maintain | Update actions/tools/runtimes; exercise rollback; remove stale exceptions | Reviewed updates and periodic revalidation |

## Match evidence to risk

| Change | Minimum additional evidence |
| --- | --- |
| Comment/docs-only edit | Documentation checks; do not accidentally path-filter required workflows out of existence |
| Input/output or script change | Unit/negative tests, bundled entrypoint, native candidate run |
| Job dependencies, matrix, conditions | Native branch integration with success/failure/skip cases |
| Trigger or event filters | Real target event; fixtures alone are insufficient |
| Token permissions, secrets, OIDC, runner group | Security review of the trust boundary and sandbox authority test |
| Publish/deploy/release path | Protected environment, immutable artifact identity, canary and rollback rehearsal |
| Third-party action update | Source/release/provenance review, resolved SHA, contract regression |

## Workflow changes deserve protected review

Cover `.github/workflows/`, local actions, shared scripts, `CODEOWNERS`, dependency manifests, and policy configuration. An attacker does not need to edit YAML if they can edit a script the trusted workflow executes.

CODEOWNERS routes review; it is not enforcement on its own. Require code-owner review in a ruleset or branch protection where appropriate. In a personal one-maintainer demo, requiring an independent approval without another eligible maintainer can deadlock changes.

Likewise, a required check implemented entirely in the PR can be edited by that PR. For stronger assurance, organization-level rules can require centrally owned workflows, and administrators should restrict bypass. This is an upgrade path for `octodemo` or another organization, not a reason to require enterprise infrastructure for the basic demo.

## Fail closed without creating noise

- No blanket `continue-on-error` on scanners or tests.
- No `|| true` around security checks.
- No conditional that skips security jobs merely because a PR is from a fork.
- No required top-level workflow path filters unless their pending-check behavior is explicitly handled.
- Use a stable aggregate gate that rejects failure, cancellation, and unexpected skip.
- Require CodeQL analysis **and** a finding policy; uploads alone are not the policy.
- Treat unavailable scanners and registry failures as unknown/failing evidence, not success.

When adding a gate dependency or matrix axis, deliberately break it once in a branch and confirm the aggregate check blocks. When allowing an expected skip, assert the exact reason in a dedicated job.

## Handle exceptions explicitly

An exception needs the rule/advisory, exact path and scope, reason, owner, expiry date, and a regression test or compensating control. Prefer narrow documented ignores over disabling an entire scanner. Re-evaluate exceptions during dependency/runtime upgrades.

Do not add a global `warn-only` setting to get through a release. Do not label a skipped security job "passed."

## Protect runners and credentials

Use GitHub-hosted disposable runners for untrusted code unless a deliberately isolated self-hosted environment is available. Avoid putting fork jobs on persistent runners connected to internal networks.

Keep read-only validation separate from jobs with `contents: write`, `packages: write`, `id-token: write`, deployment credentials, or production environments. A short-lived token still has real authority during its lifetime.

Caches and artifacts cross trust boundaries too. Do not restore executable artifacts from untrusted runs into a privileged release job without verifying their source and integrity. Never expose secrets to "tests" solely because the workflow is named CI.

## Release and rollback

Promote the artifact you tested rather than rebuilding with uncontrolled dependencies in a privileged job. Record commit, toolchain, dependency lock, and artifact identity. Add provenance/attestation when downstream verification is part of your release model.

For workflow-only changes, rollback can be a reviewed revert to the last known-good workflow and scripts. For action consumers, restore the prior immutable action SHA. For deployments, use the application's actual rollback mechanism; reverting YAML does not necessarily undo an external side effect.

## Measure usefulness

Track escaped workflow failures, time to a trustworthy pre-merge result, false positives, waived rules, stale exceptions, and recovery time. Coverage percentage and number of scanners are secondary. A fast green check on the wrong commit has no value.
