import { readdirSync, readFileSync } from "node:fs";
import { parseDocument } from "yaml";
import { checkPolicy } from "./policy.ts";

const files = readdirSync(".github/workflows").filter((file) => /\.ya?ml$/.test(file));
if (files.length === 0) throw new Error("No workflow files found");
const errors = files.flatMap((file) => {
  const document = parseDocument(readFileSync(`.github/workflows/${file}`, "utf8"), {
    uniqueKeys: true,
    version: "1.2",
  });
  const failures = document.errors.length
    ? document.errors.map((error) => error.message)
    : checkPolicy(document.toJS());
  return failures.map((failure) => `${file}: ${failure}`);
});
if (errors.length) throw new Error(errors.join("\n"));
console.log(`Repository policies passed for ${files.length} workflows.`);
