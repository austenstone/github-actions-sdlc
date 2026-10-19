import assert from "node:assert/strict";

const { PLAN, EXPECTED_VERSION, EXPECTED_TARGET } = process.env;
assert.ok(PLAN, "PLAN must be populated by the action or reusable workflow output");
assert.ok(EXPECTED_VERSION, "EXPECTED_VERSION is required");
assert.ok(EXPECTED_TARGET, "EXPECTED_TARGET is required");
assert.deepEqual(JSON.parse(PLAN), {
  schemaVersion: 1,
  version: EXPECTED_VERSION,
  target: EXPECTED_TARGET,
  dryRun: true,
});
console.log("Action output contract passed.");
