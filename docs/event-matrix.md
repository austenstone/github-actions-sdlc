# Events, workflow revisions, and test fidelity

This table targets **GitHub.com**, checked against [the event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows). GitHub Enterprise Server versions can differ. The workflow revision, `GITHUB_SHA`, and checked-out revision are related but are not interchangeable.

| Event | Native execution context | Candidate-branch strategy | What the substitute does not prove |
| --- | --- | --- | --- |
| `push` | Pushed branch/tag revision; SHA is its tip for an ordinary push | Push a feature branch containing the harness | PR merge compatibility, default-branch event delivery |
| `pull_request` | Normally the synthetic PR merge ref / merge SHA for an open mergeable PR | Open a real feature PR; use default checkout to test integration | Head-only behavior, fork credentials, production environment access |
| `workflow_dispatch` | Selected branch or tag; workflow must be recognized and dispatch-enabled | Bootstrap/register the harness on default, then CLI/API `--ref` | A manual event is still manual, not a schedule or release |
| `workflow_call` | Called workflow receives the caller's event payload; same-repository calls use the caller's commit | Same-repository reusable workflow from the branch harness | The real event adapter, cross-repo checkout assumptions |
| `schedule` | Workflow on default branch, latest default-branch commit | Test shared logic via harness; use sandbox default branch for cron delivery | Cron eligibility, timing, dropped/delayed runs, schedule actor |
| `repository_dispatch` | Workflow must exist on default; default-branch ref and SHA | Fixture-test payload handling, then real dispatch in sandbox | Payload `ref` does not select workflow YAML or change `GITHUB_SHA` |
| `issue_comment` | Workflow must exist on default; default-branch ref/SHA, even for PR comments | Unit-test parser/authorization; real comment in isolated sandbox | Comment permissions, PR-head resolution, command authorization |
| `issues`, `discussion`, `watch`, `label` | Default-branch registration/context requirements apply; check the individual event | Fixtures plus genuine event in sandbox | Repository control-plane behavior |
| `workflow_run` | Receiving workflow must exist on default; its own ref/SHA is default branch | Test pure downstream logic; real upstream/downstream pair in sandbox | Upstream conclusion/filter matching, trust of artifacts and head SHA |
| `pull_request_target` | On current GitHub.com, default branch of the base repository, not candidate merge code | Test trusted metadata automation in sandbox | Not a safe shortcut for running PR code; older GHES versions differ |
| `release` | Published release's tag ref and tagged commit | Pre-release/tag lifecycle in sandbox | A branch dispatch does not prove release activity filtering |
| `merge_group` | Merge group's temporary ref and SHA, distinct from PR and push | Actual merge queue in a supporting org/repo | A regular PR run does not satisfy the queue's required checks |

## Nuances that change test design

### Manual dispatch registration

The UI Run workflow control depends on the workflow being present on default. The [current docs](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch) also describe CLI/API dispatch against another branch after a workflow has run at least once. The robust setup is a minimal reviewed dispatch harness on default, plus branch pushes for brand-new workflow files.

### Pull requests

Default `pull_request` activity types are `opened`, `synchronize`, and `reopened`. Other activities need explicit `types`. PR `branches` filters match the **base** branch, not the feature branch. Merge conflicts can prevent PR runs.

Fork PRs and Dependabot runs have restricted credentials and may require approval. Do not "fix" that by switching to a privileged trigger. Adding a new workflow or using a fork may also be constrained by repository Actions policies.

### Schedules

Schedules can be delayed and, under sufficient load, dropped. They are not precise timers. Avoid minute zero when possible. Public-repository schedules can be disabled after 60 days without repository activity. A manually invoked shared workflow does not test any of this.

### Workflow chaining

`workflow_run` may receive write tokens and secrets even when the upstream workflow did not. `completed` does not mean `success`; check the conclusion explicitly. Treat upstream artifacts, names, and metadata as untrusted. Downloading an artifact from an arbitrary run and executing it is not a safe promotion model.

### Releases

Do not assume every draft or pre-release action has the same trigger behavior. GitHub recommends `published` when you need both stable releases and pre-releases. Test your selected activity types against the actual release lifecycle.

### Events caused by automation

`GITHUB_TOKEN` has recursion-prevention rules. `workflow_dispatch` and `repository_dispatch` are exceptions; current GitHub.com also documents approval-gated behavior for some token-created PR events. Do not assume a push, comment, or release made by your workflow will trigger another workflow. Consult the [current triggering documentation](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow) and your platform version before introducing a separate GitHub App credential.

### Required checks and filters

Path-filtered or branch-filtered workflows can leave required checks pending. A skipped job can also look successful for branch protection purposes. Keep the required workflow broadly triggered and use an explicit aggregate gate that rejects skipped prerequisites. If a skip is legitimate, model and test that exception instead of accepting every skipped result.

## A useful fidelity ladder

| Evidence | Establishes | Does not establish |
| --- | --- | --- |
| YAML parsing / actionlint | Static structure, supported expressions and references | GitHub accepts every future schema feature or the workflow does the right thing |
| Payload fixtures | Your code handles those exact payload cases | GitHub will deliver the event or populate every tested field |
| Local runner emulation | Supported local execution path | Hosted control plane and security boundaries |
| Native branch run | Actual Actions execution for that event and revision | Another trigger or deployment identity |
| Sandbox real event | Event wiring under sandbox configuration | Identical production organization configuration |
| Post-merge canary | Harmless observation in the real integration context | All failure modes, future correctness, or safe rollback |
