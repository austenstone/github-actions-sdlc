# Contributing

Start with the [local setup](README.md#install-and-verify) and [SDLC](docs/sdlc.md). Work in your own fork or an authorized branch.

Before a pull request:

1. Add or update tests for the behavior you change, including failure cases.
2. Run `npm run format`, `npm run check`, and `npm run validate:workflows`.
3. Commit the rebuilt bundle and notices in `dist/` alongside source. Run `npm run check:dist` after committing.
4. Run the native branch harness and record the tested SHA and run URL.
5. Update the event matrix or documentation when behavior changes.
6. Use the PR template to describe risk, missing coverage, and rollback.

Do not add real secrets, customer data, or proprietary examples. Deliberately unsafe scanner fixtures must stay inert (`.yml.txt`), never installed under `.github/workflows`.

Keep actions pinned to full SHAs with version comments. Update tool versions and hash locks together. npm dependency versions respect the maintainer's release-age policy; do not disable that policy to force a newer release.

Do not weaken required checks or introduce broad exceptions to make a change pass. Security and policy exceptions need an owner, reason, bounded scope, and expiry.
