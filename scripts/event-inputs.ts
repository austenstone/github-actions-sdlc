import { appendFileSync, readFileSync } from "node:fs";
import { planFromEvent } from "../src/events.ts";

const { GITHUB_EVENT_NAME, GITHUB_EVENT_PATH, GITHUB_OUTPUT } = process.env;
if (!GITHUB_EVENT_NAME || !GITHUB_EVENT_PATH || !GITHUB_OUTPUT) {
  throw new Error("GITHUB_EVENT_NAME, GITHUB_EVENT_PATH, and GITHUB_OUTPUT are required");
}
const event: unknown = JSON.parse(readFileSync(GITHUB_EVENT_PATH, "utf8"));
const plan = planFromEvent(GITHUB_EVENT_NAME, event);
appendFileSync(GITHUB_OUTPUT, `version=${plan.version}\ntarget=${plan.target}\n`);
