# Developing and releasing a custom action

A workflow orchestrates jobs. An action implements reusable steps. Test each at its own boundary.

## The sample JavaScript action

[`action.yml`](../action.yml) declares a Node 24 action. [`src/plan.ts`](../src/plan.ts) contains a pure function; [`src/main.ts`](../src/main.ts) is the small GitHub input/output adapter.

| Contract | Behavior |
| --- | --- |
| `version` input | Required string: three non-negative integer components, no leading zeroes or whitespace |
| `target` input | `preview` by default; `staging` also allowed |
| `plan` output | JSON object with `schemaVersion: 1`, `version`, `target`, `dryRun: true` |
| Invalid input | Failed action, diagnostic, no plan output |
| Side effects | Writes output and logs only; no deployments, shell execution, network calls, or credentials |

The version grammar is deliberately a subset, not a full SemVer implementation. Pre-release/build suffixes are rejected. Change the contract and tests together if you need them.

## Local development loop

```bash
npm ci
# Edit src/, tests/, or action.yml.
npm run format
npm run check
git diff -- dist/
```

`npm run check` builds the action. Review and commit `dist/index.js` together with source changes. Do not let release consumers depend on `node_modules` existing.

Then verify the committed artifact has no remaining drift:

```bash
npm run check:dist
```

After committing both source and bundle, this command should have no diff. In CI, it prevents a PR from changing source while executing an older committed bundle.

## Test boundaries

1. **Pure function:** valid and invalid values, output schema, strict rejection of production targets, whitespace and command-shaped inputs.
2. **Event adapter:** real-shaped fixtures, missing/wrong fields, unknown event names, caller-supplied privileged targets and refs ignored.
3. **Bundled entrypoint:** launch `dist/index.js` as a child process, provide real input environment variables and an output file, assert exit status and output serialization.
4. **Native runner:** invoke `uses: ./` through action metadata on all supported operating systems. Assert outputs and a deliberately failing invocation.
5. **Reusable workflow:** pass typed workflow inputs into the action; assert output wiring and record the checked-out commit.

The 100% coverage gate applies only to the intentionally tiny pure planner and normalizer. It is not a claim that every runner/platform edge case is covered.

## Test the candidate, not the released action

For same-repository development, this starter uses checkout followed by `uses: ./`. A test that still calls `owner/action@v1` may only test the last release. The local form loads from the mutable checked-out workspace, so do not replace checkout with an unrelated ref or fetch untrusted action code into that path.

Current GitHub.com recommends `uses: $/` to load an action from the workflow's own commit without relying on mutable workspace state. The pinned stable actionlint release does not yet parse that syntax. This starter keeps a narrow, documented [compatibility exception](validation.md#temporary-self-repository-syntax-exception) rather than disabling actionlint's reference validation.

For an action hosted in another repository, reference the candidate's immutable commit SHA in an authorized consumer sandbox. A branch reference is convenient during iteration but is mutable. Record the resolved commit and replace development refs before release.

Do not interpolate an arbitrary user-supplied ref into a privileged checkout. Keep candidate execution in an unprivileged job.

## Composite actions

Apply the same input/output and native-runner contract tests. Composite actions execute in the caller's job and share its permissions and environment. Each `run` step needs a shell; use environment variables for untrusted expressions rather than injecting expressions directly into script source.

Use `github.action_path` / `GITHUB_ACTION_PATH` for the action's own scripts instead of assuming the caller's working directory. Run ShellCheck or PSScriptAnalyzer as appropriate. Test missing tools and supported shells/platforms.

This repository does not contain a second composite implementation; do not claim the JavaScript matrix validates one.

## Docker actions

Build the image, scan it, test the entrypoint and exit codes, and run a native Linux consumer workflow. Verify input argument handling, workspace mounts, UID/file ownership, and networking assumptions. Docker actions require compatible Linux runners; the JavaScript action's cross-platform claims do not carry over.

Pin base-image digests and document how to update them. A green Dockerfile lint does not prove the action image starts or behaves correctly.

## Release discipline

Before publishing an action version:

1. Require code, workflow, dependency, native, and bundle checks on the exact release candidate.
2. Review interface compatibility and choose a semantic version for the action itself.
3. Build the distributable from that commit; verify the committed bundle and include dependency notices.
4. Publish a version tag/release under restricted release authority. Do not mint release tokens in ordinary PR jobs.
5. Test a downstream consumer pinned to the released SHA, not a moving branch.
6. Document supported runtimes, operating systems, inputs, outputs, errors, and permissions.
7. Record a rollback path: revert the workflow change or restore the consumer's previous known-good SHA.

Major-version aliases such as `v1` are convenient but mutable. Consumers requiring immutable inputs should pin commit SHAs with version comments. If using immutable releases, follow their tag/asset constraints; do not design rollback around silently replacing a published release.

This repository ships source and a committed demo bundle. It does not automatically publish marketplace releases, packages, or production deployment artifacts.
