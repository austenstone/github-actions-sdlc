# Contributing

Keep this a small workflow lab: concise YAML, established validators, and evidence-backed documentation. Do not add an application, custom action, scripts directory, or test framework.

Use a branch and a normal PR. Record the event, workflow SHA, checkout SHA, run URL, and result. Tests on an old revision do not prove the new one works.

Required checks are actionlint, zizmor, CodeQL Actions, and the native runtime experiment. Pin external actions to full commit SHAs. Do not weaken a check to make an experiment pass.

Deliberate failures belong in explicitly identified experiment commits and must be removed before merge. Use synthetic secrets only; never print their values. A fork or extra credential requires a specific demonstrated need, not a default setup step.
