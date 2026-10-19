# Security

This lab has no deployment application or real credentials. Synthetic canaries are random values used only to check availability; workflows print booleans, never their contents.

The manual write-token probe creates a non-required commit status on its own repository and SHA. The environment probe uses a dedicated main-only environment, not production. Never point these workflows at real deployment credentials.

Branch authors can edit workflows. Repository-level secrets, write tokens, required-check names, and scanner configuration are not immutable just because the branch is named an experiment. Require appropriate review and protected environments; use a separate repository when actual credential isolation is needed.

Report vulnerabilities using this repository's private security reporting. Do not publish real credentials or customer data.
