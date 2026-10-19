# Hands-on labs

Run these in your own fork or sandbox. They intentionally include failing tests. Never add real credentials or production resources.

## Lab 1: Prove the validators work

Follow [README setup](../README.md), then run:

```bash
npm run check
npm run validate:workflows
```

Inspect [the inert fixtures](../tests/fixtures). The validator test expects an unknown context and a PR-title injection to fail. Change the fixture to something valid and confirm the negative-control test now fails because its detector no longer has a defect to catch. Restore the fixture before committing.

Acceptance: failures are diagnosed for the expected rule, not merely a nonzero exit from a broken tool installation.

## Lab 2: Make a real workflow change before main

Create `demo/workflow-change`, edit the default `version` input in [`branch-test.yml`](../.github/workflows/branch-test.yml) to `2.0.0`, commit, and push. No placeholder PR is necessary.

Run:

```bash
gh workflow run branch-test.yml --ref demo/workflow-change
gh run list --workflow branch-test.yml --branch demo/workflow-change --event workflow_dispatch
```

Inspect the run title and output assertion. The default version is supplied from the selected workflow revision. Verify the tested checkout SHA equals the candidate SHA, not `main`.

Acceptance: the branch's changed workflow definition ran natively; the action output is validated; no production authority was present.

## Lab 3: Reject a bad request

```bash
gh workflow run branch-test.yml --ref demo/workflow-change --field version=not-a-version
```

Acceptance: the called action fails and the branch run is red. The dependent verification job must not turn a failed action into a successful result. Read the actual run conclusion, not just the dispatch API response.

## Lab 4: Catch a stale bundle

Modify an error message in [`src/plan.ts`](../src/plan.ts) but deliberately do not commit the corresponding rebuilt `dist/index.js`.

Run:

```bash
npm run check:dist
```

Acceptance: a diff is reported and the command fails against the committed bundle. Review the regenerated artifact, commit source and bundle together, and rerun.

## Lab 5: Distinguish logic from event delivery

Run the event unit tests:

```bash
npm test
```

Then make a real `preview-plan` repository dispatch in your authorized copy using the [playbook command](branch-testing.md).

Acceptance: fixtures cover parser/normalization behavior, while the native run confirms the default-branch adapter receives the actual event. Neither is described as equivalent to the other. Do not claim the cron has fired merely because dispatch passed.

## Lab 6: Verify the merge gate

In a real feature PR, temporarily break a unit assertion or remove a required job's timeout. Observe the failed prerequisite and failed `Required gate`. Test an unexpected job skip as well.

Acceptance: repository rules block merging the failing PR. A green unrelated job is not enough. Restore the change instead of adding `continue-on-error` or weakening the rule.

This lab needs actual branch/ruleset configuration and a real PR. The files alone cannot prove merge enforcement.

## Lab 7: Test default-branch-only delivery safely

In a separate disposable repository, install the candidate adapter on that repository's default branch. Exercise the exact event you changed, including expected activity types and filters.

Acceptance: record event, workflow SHA, checkout SHA, run URL, outputs, and sandbox differences. Repeat a harmless canary after promotion to the real default branch.

Do not flip the production repository's default branch or temporarily expose production secrets to get a convenient test result.
