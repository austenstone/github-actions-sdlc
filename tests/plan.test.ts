import { describe, expect, it } from "vitest";
import { createPlan } from "../src/plan.ts";

describe("deployment plan contract", () => {
  it.each(["preview", "staging"])("accepts the %s target", (target) => {
    expect(createPlan("1.2.3", target)).toEqual({
      schemaVersion: 1,
      version: "1.2.3",
      target,
      dryRun: true,
    });
  });

  it("accepts zero components", () => {
    expect(createPlan("0.0.0", "preview").version).toBe("0.0.0");
  });

  it.each(["", "v1.2.3", "1.2", "01.2.3", "1.2.3-rc.1", " 1.2.3", "1.2.3\n", "$(id)", "1.2.3;id"])(
    "rejects invalid version %j",
    (version) => {
      expect(() => createPlan(version, "preview")).toThrow("version must");
    },
  );

  it.each(["production", "", "preview\n", "$(id)"])("rejects target %j", (target) => {
    expect(() => createPlan("1.2.3", target)).toThrow("target must");
  });
});
