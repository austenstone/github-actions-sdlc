import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: [
      "tests/plan.test.ts",
      "tests/events.test.ts",
      "tests/policy.test.ts",
      "tests/gate.test.ts",
    ],
    coverage: {
      provider: "v8",
      include: ["src/plan.ts", "src/events.ts"],
      thresholds: { lines: 100, branches: 100, functions: 100, statements: 100 },
    },
  },
});
