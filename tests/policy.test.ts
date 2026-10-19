import { describe, expect, it } from "vitest";
import { parseDocument } from "yaml";
import { checkPolicy } from "../scripts/policy.ts";

const pinnedCheckout = `actions/checkout@${"a".repeat(40)}`;
const workflow = (job: object) => ({
  on: { pull_request: {} },
  permissions: { contents: "read" },
  jobs: { test: job },
});

describe("repository-specific policy guardrails", () => {
  it("accepts a bounded unprivileged job with a pinned checkout", () => {
    expect(
      checkPolicy(
        workflow({
          "timeout-minutes": 5,
          steps: [{ uses: pinnedCheckout, with: { "persist-credentials": false } }],
        }),
      ),
    ).toEqual([]);
  });
  it("accepts a same-commit reusable workflow without job timeout", () => {
    expect(checkPolicy(workflow({ uses: "./.github/workflows/plan.yml" }))).toEqual([]);
  });
  it("rejects an unpinned action", () => {
    expect(
      checkPolicy(workflow({ "timeout-minutes": 5, steps: [{ uses: "owner/action@v1" }] })),
    ).toContain("test: pin external actions and workflows to full commit SHAs");
  });
  it("rejects implicit checkout credentials", () => {
    expect(
      checkPolicy(workflow({ "timeout-minutes": 5, steps: [{ uses: pinnedCheckout }] })),
    ).toContain("test: checkout must set persist-credentials: false");
  });
  it("rejects unbounded jobs and inherited secrets", () => {
    expect(checkPolicy(workflow({ secrets: "inherit" }))).toHaveLength(2);
  });
  it("rejects broad workflow permissions and privileged events", () => {
    expect(
      checkPolicy({
        on: { pull_request_target: {} },
        permissions: { contents: "write" },
        jobs: {},
      }),
    ).toHaveLength(2);
  });
  it("rejects malformed documents and missing permissions", () => {
    expect(checkPolicy(null)).toHaveLength(1);
    expect(checkPolicy({ jobs: { invalid: null } })).toHaveLength(2);
  });
  it("uses YAML 1.2 so on is not parsed as a boolean", () => {
    expect(parseDocument("on: push").toJS()).toEqual({ on: "push" });
  });
  it("rejects duplicate YAML keys", () => {
    expect(parseDocument("name: one\nname: two", { uniqueKeys: true }).errors).toHaveLength(1);
  });
});
