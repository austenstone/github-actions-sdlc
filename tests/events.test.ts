import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { planFromEvent } from "../src/events.ts";

describe("event adapter logic, not GitHub event delivery", () => {
  it("normalizes schedule to a harmless preview", () => {
    expect(planFromEvent("schedule", {})).toEqual({
      schemaVersion: 1,
      version: "0.0.0",
      target: "preview",
      dryRun: true,
    });
  });

  it("accepts a dispatch fixture but ignores caller-selected target and ref", () => {
    const event: unknown = JSON.parse(
      readFileSync("tests/fixtures/repository-dispatch.json", "utf8"),
    );
    expect(planFromEvent("repository_dispatch", event)).toEqual({
      schemaVersion: 1,
      version: "2.3.4",
      target: "preview",
      dryRun: true,
    });
  });

  it.each([
    null,
    [],
    "text",
    {},
    { action: "other" },
    { action: "preview-plan", client_payload: null },
    { action: "preview-plan", client_payload: [] },
    { action: "preview-plan", client_payload: { version: 123 } },
  ])("rejects malformed payload %j", (event) => {
    expect(() => planFromEvent("repository_dispatch", event)).toThrow("Expected a preview-plan");
  });

  it("does not pretend a manual event is a schedule", () => {
    expect(() => planFromEvent("workflow_dispatch", {})).toThrow("Expected a preview-plan");
  });

  it("rejects output-file injection before writing normalized inputs", () => {
    expect(() =>
      planFromEvent("repository_dispatch", {
        action: "preview-plan",
        client_payload: { version: "1.2.3\ntarget=production" },
      }),
    ).toThrow("version must");
  });
});
