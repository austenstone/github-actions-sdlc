import { build } from "esbuild";

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
