# Verification evidence

This file records observed results, not intended configuration. Initial validation is in progress. Do not infer a passing check, protected branch, or delivered event from the presence of workflow files.

The runnable scope is:

- Local source, bundle, policy, and scanner validation.
- Native CI and CodeQL from a clean GitHub-hosted checkout.
- Candidate branch push and explicit branch dispatch.
- A real default-branch repository dispatch.

Cron delivery, merge-queue execution, fork approval behavior, code-scanning alert blocking, and production deployments require separate experiments. This repository intentionally performs no production deployments.
