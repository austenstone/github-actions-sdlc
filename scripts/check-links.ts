import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const files = ["README.md", "CONTRIBUTING.md", "SECURITY.md"];
files.push(
  ...readdirSync("docs")
    .filter((file) => file.endsWith(".md"))
    .map((file) => `docs/${file}`),
);
const errors: string[] = [];
for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const url = match[1];
    if (/^(https?:|mailto:|#)/.test(url)) continue;
    const path = decodeURIComponent(url.split("#")[0]);
    if (!existsSync(resolve(dirname(file), path))) errors.push(`${file}: missing ${url}`);
  }
}
if (errors.length) throw new Error(errors.join("\n"));
console.log("Local Markdown file links passed (external URLs and anchors are not checked).");
