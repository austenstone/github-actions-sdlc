import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { build } from "esbuild";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const lock: unknown = JSON.parse(readFileSync("package-lock.json", "utf8"));
if (!isRecord(lock) || !isRecord(lock.packages)) throw new Error("Invalid npm lockfile");
const notices = Object.entries(lock.packages).flatMap(([path, metadata]) => {
  if (!path || !isRecord(metadata) || metadata.dev === true || metadata.devOptional === true)
    return [];
  const files = readdirSync(path).filter((file) => /^(license|copying|notice)([.-]|$)/i.test(file));
  if (files.length === 0) throw new Error(`Missing runtime dependency license: ${path}`);
  return [
    `${path} (${metadata.version})\n\n${files
      .sort()
      .map((file) => readFileSync(`${path}/${file}`, "utf8").replaceAll("\r\n", "\n"))
      .join("\n")}`,
  ];
});

await build({
  entryPoints: ["src/main.ts"],
  outfile: "dist/index.js",
  bundle: true,
  platform: "node",
  format: "esm",
  banner: {
    js: 'import { createRequire } from "node:module"; const require = createRequire(import.meta.url);',
  },
  target: "node24",
  sourcemap: false,
  legalComments: "eof",
});
writeFileSync("dist/THIRD_PARTY_NOTICES.txt", `${notices.join("\n\n---\n\n")}\n`);
