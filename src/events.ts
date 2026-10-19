import { createPlan, type Plan } from "./plan.ts";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const planFromEvent = (eventName: string, event: unknown): Plan => {
  if (eventName === "schedule") {
    return createPlan("0.0.0", "preview");
  }
  if (
    eventName !== "repository_dispatch" ||
    !isRecord(event) ||
    event.action !== "preview-plan" ||
    !isRecord(event.client_payload) ||
    typeof event.client_payload.version !== "string"
  ) {
    throw new Error("Expected a preview-plan repository_dispatch with a string version");
  }
  // The sender cannot choose a privileged target or a checkout ref.
  return createPlan(event.client_payload.version, "preview");
};
