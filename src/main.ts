import * as core from "@actions/core";
import { createPlan } from "./plan.ts";

try {
  const plan = createPlan(
    core.getInput("version", { required: true, trimWhitespace: false }),
    core.getInput("target", { required: true, trimWhitespace: false }),
  );
  core.setOutput("plan", plan);
  core.info("Validated a preview-only plan. No deployment was performed.");
} catch (error) {
  core.setFailed(error instanceof Error ? error.message : "Unexpected action failure");
}
