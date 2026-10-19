import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const runAction = (version: string, target: string) => {
  const directory = mkdtempSync(join(tmpdir(), "actions-sdlc-"));
  const output = join(directory, "output");
  writeFileSync(output, "");
  try {
    const result = spawnSync(process.execPath, [resolve("dist/index.js")], {
      env: { ...process.env, INPUT_VERSION: version, INPUT_TARGET: target, GITHUB_OUTPUT: output },
      encoding: "utf8",
    });
    if (result.error) throw result.error;
    return { ...result, output: readFileSync(output, "utf8") };
  } finally {
    rmSync(directory, { recursive: true });
  }
};

test("the bundled entrypoint writes the real GITHUB_OUTPUT protocol", () => {
  const result = runAction("1.2.3", "preview");
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const lines = result.output.trim().split(/\r?\n/);
  assert.match(lines[0], /^plan<<.+$/);
  assert.equal(lines[2], lines[0].slice("plan<<".length));
  assert.deepEqual(JSON.parse(lines[1]), {
    schemaVersion: 1,
    version: "1.2.3",
    target: "preview",
    dryRun: true,
  });
});

for (const [version, target] of [
  ["", "preview"],
  ["$(id)", "preview"],
  ["1.2.3\n", "preview"],
  ["1.2.3", "production"],
  ["1.2.3", ""],
]) {
  test(`the entrypoint fails without outputs for ${JSON.stringify([version, target])}`, () => {
    const result = runAction(version, target);
    assert.equal(result.status, 1);
    assert.equal(result.output, "");
    assert.match(result.stdout, /::error::/);
  });
}
