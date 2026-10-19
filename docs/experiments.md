# Experiments

Use an authorized repository. Do not execute a deliberately insecure fixture. No fork is required for the first five experiments.

## 1. Change the workflow on a branch

Change `MARKER` in [event-adapter.yml](../.github/workflows/event-adapter.yml), push, and read the summary. The workflow definition and checkout SHA should be the candidate revision. For PRs, default checkout normally uses the synthetic merge commit, not just the head commit.

Then manually select the branch:

```bash
gh workflow run event-adapter.yml --ref experiment/workflow-change
```

This tests GitHub's actual runner and the candidate steps. It does not pretend a manual event is a cron or repository dispatch. The default-branch registration requirement and previously run workflow/API behavior are described in the [event reference](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch).

## 2. Inspect YAML that does not run on a PR

On an experiment branch, add a workflow triggered only by a unique `repository_dispatch` type that you will **not send**. Introduce an unknown expression context to demonstrate actionlint's rejection. Separately use an unpinned action or unsafe script interpolation to demonstrate zizmor/CodeQL findings.

Open the PR and inspect the scanner logs. The validators read the proposed YAML; they do not need to execute that workflow's trigger. Record the actual diagnostic and blocked required check. Remove the defect before merge.

Do not add `pull_request_target`, execute untrusted input, or expose credentials merely to demonstrate a scanner.

## 3. Compare manual evidence with an enforced runtime check

Run the manual workflow on the current PR head and link the result. Temporarily require `Manual evidence` in this disposable lab's branch protection and inspect the PR's required checks.

GitHub documents that checks from `workflow_dispatch` are not eligible to satisfy required PR checks, even at the same head SHA. Compare this with the `Runtime experiment` job triggered by `pull_request` or `push`.

Make a new commit. Earlier success must not certify that new revision. Introduce a literal `exit 1` into the runtime experiment and observe the failed required check, then remove it. Do not merge while experiments are red. Remove the temporary `Manual evidence` requirement after measuring the boundary.

No status-copying bot, API-written "approval" check, personal access token, or privileged `workflow_run` bridge is used. Those would be another system to trust and maintain.

## 4. A branch is not a secret boundary

Provision a random repository secret named `LAB_REPO_CANARY`. The runtime and manual jobs print only whether it is present.

The manual workflow separately requests `statuses: read` and `statuses: write`. Both attempt the same harmless repository-scoped commit-status API operation. HTTP 403 versus HTTP 201 demonstrates the granted token authority, not merely an input called "dry run."

The expected branch result is: repository canary available, read-token write rejected, write-token write accepted. Fork PRs and Dependabot may have different restrictions; do not generalize the same-repository result to them.

## 5. An environment can restrict access

Create a dedicated environment `restricted-lab`, allow only branch `main`, and add a random environment secret `LAB_ENV_CANARY`. Do not add production secrets. Enable the optional job:

```bash
gh workflow run branch-test.yml --ref experiment/workflow-change --field environment=true
```

The branch should be rejected by environment policy before the secret-consuming step runs. After the workflow reaches main, run the same command with `--ref main`; the secret-presence assertion should pass.

The environment name is not protection by itself. The server-side deployment-branch policy is essential. This demonstration proves a ref restriction, not independent approval, cloud authorization, or safe deployment.

## 6. Default-branch event delivery

Send a real dispatch while the candidate is still unmerged:

```bash
gh api --method POST repos/OWNER/REPO/dispatches \
  --field event_type=preview-plan \
  --field 'client_payload[ref]=experiment/workflow-change' \
  --field 'client_payload[version]=2.3.4'
gh run list --workflow event-adapter.yml --event repository_dispatch
```

Replace `OWNER/REPO`. The payload's `ref` is ordinary data; it does not select the workflow definition. Compare the run's SHA to main and the candidate. Repeat after merge to observe the new definition under the real event.

`schedule` also runs on default, can be delayed, and is not an exact timer. Manually executing the steps is not cron-delivery evidence.

## When to consider a fork

Use a fork or separate sandbox only when you need the **unmerged definition to be the default branch for a real event**, or when you cannot safely reproduce the credential/resource boundary in the original repo.

A fork does not automatically reproduce secrets, environments, organization policies, installed apps, or external identity. Enable Actions explicitly as needed; public-fork schedules may be disabled. Provision synthetic or sandbox access deliberately. Its successful run is reviewer evidence, not automatically an upstream required check.

If the real event can wait for a harmless post-merge canary, a branch plus native PR validation may be sufficient. If it cannot, an isolated default branch is a legitimate last resort, not a workaround to avoid review.
