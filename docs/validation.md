# Layered validation, not one magic scanner

Use independent checks for different failure modes. YAML validation, security scanning, contract tests, and merge governance answer different questions.

## Implemented checks

| Layer | Tool or mechanism | Blocks / detects | Important blind spot |
| --- | --- | --- | --- |
| YAML parsing | `yaml`, YAML 1.2, duplicate-key errors | Ambiguous mappings; preserves `on` as a key | Does not implement GitHub's full schema |
| Workflow semantics | [actionlint](https://github.com/rhysd/actionlint) 1.7.12 | Expression types/contexts, workflow structure, reusable input/output references, inline shell analysis | Cannot prove remote service behavior or real trigger delivery |
| Shell analysis | [ShellCheck](https://www.shellcheck.net/) | Quoting, expansion, shell correctness; actionlint invokes it for supported inline Bash | PowerShell and arbitrary generated scripts are different surfaces |
| Actions security | [zizmor](https://docs.zizmor.sh/) 1.31.1, pedantic mode | Injection, excessive permissions, unsafe trust patterns, action pinning and other workflow risks | Offline mode skips online audits; no scanner finds every exploit |
| Source quality | TypeScript strict checks and Biome | Type errors, lint/format drift | Types are not runtime validation |
| Unit contracts | Vitest with 100% coverage thresholds for the small planner and event normalizer | Input validation, output schema, malformed events, injection-shaped values | Coverage is not proof of completeness; adapters and entrypoint have separate tests |
| Entrypoint | Node tests invoking the bundled action process | Exit status, real `GITHUB_OUTPUT` delimiter protocol, empty outputs on failure | Does not emulate the Actions runner |
| Native action tests | Linux, Windows, and macOS matrix | `action.yml`, runner Node runtime, actual outputs and deliberate failure behavior | This example is not a Docker or composite action |
| Build integrity | Rebuild plus `git diff --exit-code -- dist/` | Source/bundle drift in committed generated code | Reproducibility is not a supply-chain attestation |
| Reusable workflow | Same-commit call plus output and checkout-SHA assertions | Input/output wiring and candidate identity | Not a test of another event's delivery |
| Code scanning | CodeQL `actions` and `javascript-typescript` | Security analysis for workflows and action source | Successful analysis does not mean "no findings" |
| Dependency review | GitHub dependency review action | Newly introduced vulnerable dependencies, all severities/scopes | Not a complete scan of every existing dependency or workflow binary |
| Existing dependencies | `npm audit --audit-level=high` | Known high/critical npm advisories in the resolved dependency graph | Advisory coverage is incomplete; registry outages fail the check |
| Maintenance | Dependabot for Actions, npm, pip | Update proposals, including pinned action commits | PRs still need review, validation, and bundle/hash regeneration |
| Repository policy | Small [policy checker](../scripts/policy.ts) with tests | Timeouts, explicit permissions, SHA pins, no persisted checkout credentials, no blanket secret inheritance | Policy is specific to this starter, not a generic validator |
| Documentation | Local file-link checks | Missing relative targets | Does not validate Markdown syntax, external URLs, or anchors |

## GHAS is several controls

"We scan with GHAS" is not a test plan. Specify the enabled controls and what enforces each result:

- **CodeQL for Actions** analyzes workflow security. The `actions` language must actually run; selecting only JavaScript does not replace workflow analysis.
- **CodeQL for the action's language** analyzes source separately. Here that is `javascript-typescript`.
- **Code-scanning merge protection** blocks selected findings. A green `Analyze` job can simply mean the scanner successfully uploaded findings.
- **Dependency review** evaluates the dependency diff in a PR. Make its check required.
- **Secret scanning** detects supported credential patterns. **Push protection** can reject supported secrets before they enter GitHub. They are repository/platform settings, not steps added by naming a workflow `security`.
- **Dependabot alerts and updates** address known vulnerabilities and maintenance over time.

Public repositories can use these core features without an enterprise organization. Private repository licensing, custom patterns, delegated bypass, centralized controls, and some governance features have separate availability constraints. See [repository setup](repository-setup.md).

## Why both actionlint and zizmor?

actionlint catches structural and expression mistakes that may not be security issues. zizmor specializes in workflow security and risky patterns. Neither replaces CodeQL, unit tests, native execution, or review.

This repository runs zizmor with `--strict-collection`, so an unparseable input is a failure instead of a warning that quietly removes coverage. `--persona pedantic` includes lower-level hygiene findings. All findings fail the local/CI command; there is no global severity suppression.

The default scan is offline for predictable behavior and to avoid handing a token to tools running candidate code. Consider a separate trusted online audit for dependency provenance and other network-backed checks. The required token generally only needs read access. Do not run untrusted candidate code in that credentialed job.

### Temporary self-repository syntax exception

GitHub.com recommends `$/` self-repository action/workflow references. actionlint 1.7.12, the current pinned stable release, rejects that new syntax. Six exact `uses: ./...` lines have inline `zizmor: ignore[self-repository]` annotations so all other pedantic findings and actionlint checks remain enforced.

Owner: repository maintainer (`austenstone`). Review/expiry: **2027-01-19**, or the first compatible stable actionlint release, whichever comes first. Scope: the two native action steps, the action step in `plan.yml`, and the three same-repo reusable workflow calls. No remote reference or security-injection rule is exempted.

Compensating controls: checkout uses the event commit without a configurable ref, credentials are not persisted, no runtime clone replaces action code, rebuilt bundles must match committed bundles, and native output/SHA assertions exercise the candidate. The repository cannot claim compliance with an enterprise policy that prohibits workspace-relative `./` actions until this exception is removed. Upgrade actionlint, switch these six references to `$/`, remove the annotations, and rerun native tests.

If publishing SARIF to GitHub, distinguish **uploading results** from **failing the build**. Some SARIF modes are designed to upload successfully even when findings exist. Keep a non-SARIF fail-on-findings check or configure code-scanning merge protection. This starter uses plain CLI zizmor enforcement and CodeQL's native alert integration.

## Prove that red stays red

[`test-validators.sh`](../scripts/test-validators.sh) passes two deliberately bad fixtures to the tools:

1. An unknown expression context must fail actionlint.
2. Interpolating a PR title into shell source must produce zizmor's `template-injection` finding.

Fixtures use `.yml.txt` so GitHub never installs them as workflows. The tests copy them into a temporary directory, inspect the diagnostic, and clean up only those files. A scanner crash is not accepted as evidence of a security finding.

The native action test also deliberately supplies an invalid version. Only that one step has `continue-on-error`; the next step asserts its underlying `outcome` is `failure`. Never add job-wide `continue-on-error` to make a broken required check green.

## The aggregate gate

[`CI / Required gate`](../.github/workflows/ci.yml) runs with `always()` and requires every prerequisite's result to equal `success`. Failure, cancellation, and skipped prerequisites are rejected. It is independent of the CodeQL and dependency-review checks, which must also be configured as required.

The [gate tests](../tests/gate.test.ts) execute the actual YAML shell command with success, failure, cancellation, and skip results, and check that every CI prerequisite is included.

The gate is not tamper-proof: an author who can change the workflow can change the gate. Protect workflow changes with review and repository rules. Organizations that need centrally controlled required workflows should enforce them outside the application repository.

## Optional additions when the repository needs them

| Addition | Use it when | Avoid |
| --- | --- | --- |
| `act` | Local iteration saves time for supported runner paths | Treating emulation as GitHub parity |
| Gitleaks or another local secret scanner | You need pre-commit/history scanning beyond platform push protection | Real tokens as test fixtures |
| OPA / Conftest | Multiple repositories need substantial centralized policy | Reimplementing actionlint with a large homegrown rule engine |
| PSScriptAnalyzer | Workflows contain meaningful PowerShell | Assuming ShellCheck covers PowerShell |
| Pester / Bats | Shell or PowerShell contains business logic | Keeping complex untested scripts embedded in YAML |
| Container scanning and SBOMs | Building or consuming Docker actions | Testing the Dockerfile without building/running the image |
| Artifact attestations | You publish artifacts that downstream consumers verify | Confusing an attestation with a security scan |
| Scorecard | Reviewing third-party action supply-chain posture | Treating an aggregate score as proof of safety |

Add tools because they cover a relevant failure mode, not because a longer badge wall looks reassuring.
