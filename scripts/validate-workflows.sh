#!/usr/bin/env bash
set -euo pipefail

actionlint -color
shellcheck scripts/*.sh
zizmor --offline --strict-collection --persona pedantic .
bash scripts/test-validators.sh
