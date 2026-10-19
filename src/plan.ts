export type Target = "preview" | "staging";

export interface Plan {
  schemaVersion: 1;
  version: string;
  target: Target;
  dryRun: true;
}

export const createPlan = (version: string, target: string): Plan => {
  if (version.trim() !== version || !/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) {
    throw new Error(
      "version must contain three integers without leading zeroes (for example 1.2.3)",
    );
  }
  if (target !== "preview" && target !== "staging") {
    throw new Error("target must be preview or staging");
  }
  return { schemaVersion: 1, version, target, dryRun: true };
};
