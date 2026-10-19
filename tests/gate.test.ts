import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isMap, isSeq, parseDocument } from "yaml";

const workflow = parseDocument(readFileSync(".github/workflows/ci.yml", "utf8"));
const command: unknown = workflow.getIn(["jobs", "gate", "steps", 0, "run"]);
if (typeof command !== "string") throw new Error("Cannot find the real required-gate command");

describe("the actual required-gate shell command", () => {
  it.each([
    ["success", 0],
    ["failure", 1],
    ["cancelled", 1],
    ["skipped", 1],
  ])("handles a prerequisite with result %s", (result, expected) => {
    const execution = spawnSync("bash", ["-e", "-o", "pipefail", "-c", command], {
      encoding: "utf8",
      env: {
        ...process.env,
        RESULTS: JSON.stringify({ good: { result: "success" }, candidate: { result } }),
      },
    });
    if (execution.error) throw execution.error;
    expect(execution.status, execution.stderr).toBe(expected);
  });

  it("runs regardless of dependency outcomes and includes every other job", () => {
    // biome-ignore lint/suspicious/noTemplateCurlyInString: This is a GitHub expression.
    expect(workflow.getIn(["jobs", "gate", "if"])).toBe("${{ always() }}");
    const needs = workflow.getIn(["jobs", "gate", "needs"]);
    const jobs = workflow.get("jobs");
    if (!isSeq(needs) || !isMap(jobs)) {
      throw new Error("Malformed gate dependencies");
    }
    expect(needs.toJSON().sort()).toEqual(
      Object.keys(jobs.toJSON())
        .filter((name) => name !== "gate")
        .sort(),
    );
  });
});
