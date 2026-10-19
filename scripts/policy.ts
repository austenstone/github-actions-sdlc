const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const checkPolicy = (workflow: unknown): string[] => {
  if (!isRecord(workflow) || !isRecord(workflow.jobs)) {
    return ["workflow must have a jobs mapping"];
  }
  const errors: string[] = [];
  if (!isRecord(workflow.permissions)) {
    errors.push("set explicit workflow-level permissions");
  } else if (Object.values(workflow.permissions).some((value) => value === "write")) {
    errors.push("grant write permissions at job scope, not workflow scope");
  }
  if (
    isRecord(workflow.on) &&
    ("pull_request_target" in workflow.on || "workflow_run" in workflow.on)
  ) {
    errors.push("privileged event handlers are intentionally excluded from this starter");
  }
  for (const [name, job] of Object.entries(workflow.jobs)) {
    if (!isRecord(job)) {
      errors.push(`${name}: job must be a mapping`);
      continue;
    }
    if (!job.uses && !(typeof job["timeout-minutes"] === "number" && job["timeout-minutes"] > 0)) {
      errors.push(`${name}: executable jobs need a positive timeout-minutes`);
    }
    if (job.secrets === "inherit") {
      errors.push(`${name}: do not inherit all caller secrets`);
    }
    const references = [job, ...(Array.isArray(job.steps) ? job.steps : [])];
    for (const step of references) {
      if (!isRecord(step) || typeof step.uses !== "string") continue;
      const { uses } = step;
      if (!uses.startsWith("./") && !uses.startsWith("$/") && !/^[^@]+@[a-f0-9]{40}$/.test(uses)) {
        errors.push(`${name}: pin external actions and workflows to full commit SHAs`);
      }
      if (
        uses.startsWith("actions/checkout@") &&
        (!isRecord(step.with) || step.with["persist-credentials"] !== false)
      ) {
        errors.push(`${name}: checkout must set persist-credentials: false`);
      }
    }
  }
  return errors;
};
