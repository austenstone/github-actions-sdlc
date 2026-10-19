# Recorded results

Measured on GitHub.com on **2026-10-19** in [austenstone/github-actions-sdlc#4](https://github.com/austenstone/github-actions-sdlc/pull/4). These are native runs, not a local event simulator.

## What happened

| Experiment | Evidence | Observed result |
| --- | --- | --- |
| Branch versus PR revision | [Push](https://github.com/austenstone/github-actions-sdlc/actions/runs/39307801767), [PR](https://github.com/austenstone/github-actions-sdlc/actions/runs/39307808231) | Push used head `829c5f8`; PR used synthetic merge `f1ccf85`. Workflow and checkout SHAs agreed within each run. Both printed the new `workflow-lab-v1` marker before it existed on main. |
| Scan a workflow whose trigger is not exercised | [Scanners](https://github.com/austenstone/github-actions-sdlc/actions/runs/39308294858), [native rejection](https://github.com/austenstone/github-actions-sdlc/actions/runs/39308286209) at `9e8543e` | actionlint rejected `nonexistent.value` and unsafe interpolation. zizmor rejected `template-injection` and `unpinned-uses`. GitHub also rejected the invalid workflow with zero jobs. The required scanner checks failed. |
| CodeQL analysis success is not alert-policy success | [Analysis](https://github.com/austenstone/github-actions-sdlc/actions/runs/39308984878), [policy check](https://github.com/austenstone/github-actions-sdlc/runs/118253592232) at `240cc67` | A valid, default-only `issues` fixture produced `actions/code-injection/critical`. `Analyze (actions)` succeeded, but the separate `CodeQL` check failed and the PR was blocked. No issue event was sent; the fixture never ran or reached main. |
| Successful manual run at the exact PR head | [Manual run](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309353850) at `d404345` | `Manual evidence` passed, but did not appear in the PR check rollup. Requiring it left the PR `BLOCKED`, despite every eligible check and the CodeQL policy passing. Removing only that temporary requirement changed the same revision to `CLEAN`. |
| Prior success cannot certify a changed revision | [Failed PR runtime](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309141093), [failed push runtime](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309134245) at `6c898c1` | A deliberate `exit 1` failed the required runtime check. Static checks and the CodeQL policy passed, but the PR remained blocked. Earlier green runs did not satisfy the new revision. |
| Branch access and environment boundary | [Access probes](https://github.com/austenstone/github-actions-sdlc/actions/runs/39307849276), [environment rejection](https://github.com/austenstone/github-actions-sdlc/actions/runs/39307953224) at `829c5f8` | Repository canary present; read-token status write HTTP 403; write-token status write HTTP 201. The main-only environment rejected the branch before its secret-consuming step ran. |
| Real default-branch dispatch | [Dispatch](https://github.com/austenstone/github-actions-sdlc/actions/runs/39307855106) | Although `client_payload.ref` named the candidate branch, the run used main `bf4c788` and its old workflow definition. The payload did not select candidate YAML. |

Full candidate SHAs are recorded on the linked runs. For the initial revision comparison, head was `829c5f8b762a2773c7952de6c37bef2e0fb430ec` and PR merge was `f1ccf85cdb008f4b22b1212a8fccc5c15b5647da`.

## Clean result and controls

Both negative fixtures and the deliberate runtime failure were removed. At clean candidate `d4043459b74c56a3bcbcbdf8491f8b9fda990d72`, [actionlint/zizmor](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309364714), [CodeQL](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309364543), and [PR runtime](https://github.com/austenstone/github-actions-sdlc/actions/runs/39309364633) passed. The critical alert became **fixed**, not dismissed. Documentation changes still need fresh native PR checks; this historical success is not a substitute.

Final required contexts are `Actionlint`, `Zizmor`, `Analyze (actions)`, and `Runtime experiment`, bound to the GitHub Actions app, with strict/up-to-date enforcement. The separate CodeQL high-or-higher/error alert rule stayed active throughout. Admin enforcement, conversation resolution, and force-push/deletion restrictions remain enabled.

The migration exposed a real configuration trap: changing the CodeQL category and deleting JavaScript left missing analysis configurations. We preserved `/language:actions` and, with explicit approval, retired four obsolete, zero-finding JavaScript analysis records on main. Actions analyses and the alert rule were retained.

## What this does not prove

No fork was created, and no real credentials or external systems were used. The status write was informational, on the run's own SHA, never a manufactured required check.

The first dispatch test proved default-branch selection, not execution of the new definition. Running the new definition through a real dispatch, and admitting the environment probe on main, are **post-merge acceptance checks** described in [experiments](experiments.md). This table records the pre-merge evidence.

Cron delivery, fork/Dependabot restrictions, merge queues, independent approvals, organization policies, and external deployments were not exercised. Trigger-aware analysis also matters: the initial mismatched `repository_dispatch`/issue-title fixture produced no CodeQL alert; the valid `issues` fixture did. Do not infer blanket coverage from one scanner or one successful run.
