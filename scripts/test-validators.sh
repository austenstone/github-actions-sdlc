#!/usr/bin/env bash
set -euo pipefail

temp_dir="$(mktemp -d)"
trap 'rm -f "${temp_dir}/invalid.yml" "${temp_dir}/insecure.yml" "${temp_dir}/lint.txt" "${temp_dir}/security.json"; rmdir "${temp_dir}"' EXIT
cp tests/fixtures/invalid-workflow.yml.txt "${temp_dir}/invalid.yml"
cp tests/fixtures/insecure-workflow.yml.txt "${temp_dir}/insecure.yml"

if actionlint "${temp_dir}/invalid.yml" > "${temp_dir}/lint.txt" 2>&1; then
  printf '%s\n' "actionlint incorrectly accepted the invalid fixture" >&2
  exit 1
fi
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import assert from "node:assert/strict";
  assert.match(readFileSync(process.argv[1], "utf8"), /unknown_context/);
' "${temp_dir}/lint.txt"

if zizmor --offline --strict-collection --format json "${temp_dir}/insecure.yml" > "${temp_dir}/security.json"; then
  printf '%s\n' "zizmor incorrectly accepted the insecure fixture" >&2
  exit 1
fi
node --input-type=module -e '
  import { readFileSync } from "node:fs";
  import assert from "node:assert/strict";
  const findings = JSON.parse(readFileSync(process.argv[1], "utf8"));
  assert.ok(JSON.stringify(findings).includes("template-injection"), "Expected injection finding, not a tool crash");
' "${temp_dir}/security.json"
printf '%s\n' "Negative controls passed: invalid syntax and injection are rejected."
