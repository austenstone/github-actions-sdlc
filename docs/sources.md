# Public sources and scope

Behavioral guidance was checked against public documentation on 2026-10-19. GitHub.com and GitHub Enterprise Server are not interchangeable; verify the version selector for your deployment.

## GitHub platform behavior

- [Events that trigger workflows](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows): authoritative event activity types, default-branch requirements, event refs/SHAs, schedules, workflow chaining, and release nuances.
- [Manually running a workflow](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow): UI and CLI dispatch, including choosing a branch.
- [Reuse workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows): local/remote reusable workflow syntax, input types, outputs, permissions, and secrets.
- [Self-repository syntax](https://github.blog/changelog/2026-07-30-reference-same-repository-actions-with-self-repository-syntax/): immutable `$/` action and reusable workflow references versus mutable workspace-relative actions.
- [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax): job/step structure, contexts, concurrency, filters, and permissions.
- [Secure use reference](https://docs.github.com/en/actions/reference/security/secure-use): input handling, action pinning, untrusted code, and credential boundaries.
- [Triggering a workflow](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow): automation-induced event and token behavior.
- [Merge queue](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue): availability and required `merge_group` support.

## Security and governance

- [Code scanning with CodeQL](https://docs.github.com/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql): supported languages, including GitHub Actions workflows.
- [Code-scanning workflow configuration](https://docs.github.com/en/code-security/reference/code-scanning/workflow-configuration-options): language selection and analysis configuration.
- [Dependency review](https://docs.github.com/en/code-security/concepts/supply-chain-security/dependency-review): PR diffs, action enforcement, and public-repository availability.
- [GitHub security features](https://docs.github.com/en/code-security/getting-started/github-security-features): feature availability and product boundaries.
- [Secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning): public and private repository behavior.
- [Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets): enforcement and availability.
- [Code-scanning merge protection](https://docs.github.com/en/code-security/code-scanning/managing-your-code-scanning-configuration/set-code-scanning-merge-protection): alert-level merge policy.

## Tools

- [actionlint](https://github.com/rhysd/actionlint) and its [checks](https://github.com/rhysd/actionlint/blob/main/docs/checks.md).
- [zizmor usage](https://docs.zizmor.sh/usage/), [audit rules](https://docs.zizmor.sh/audits/), and [integrations](https://docs.zizmor.sh/integrations/).
- [ShellCheck](https://www.shellcheck.net/).
- [act documentation](https://nektosact.com/) and [unsupported functionality](https://nektosact.com/not_supported.html).
- [GitHub Actions toolkit](https://github.com/actions/toolkit) for the action input/output protocol.

The SDLC, risk tiers, example policies, and test architecture are recommendations implemented by this repository. They are not claims that GitHub enforces those choices automatically.
