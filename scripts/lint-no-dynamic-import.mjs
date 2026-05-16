#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { ROOT, trackedFiles } from "./repo-lint-lib.mjs";

const DYNAMIC_IMPORT_RE = /\b(?:await\s+)?import\s*\(/;
const SELF_EXEMPT = new Set([
  "scripts/lint-no-dynamic-import.mjs",
  "scripts/lint-no-dynamic-import.test.mjs",
]);

export function scanText(text, file) {
  const hits = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const trimmed = line.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("/**") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("*/")
    ) {
      continue;
    }
    if (/allow-dynamic-import:/.test(line)) continue;
    if (!DYNAMIC_IMPORT_RE.test(line)) continue;
    if (/\bimport\.meta\./.test(line)) continue;
    hits.push({ file, line: i + 1, text: trimmed });
  }

  return hits;
}

function shouldScan(path) {
  if (!/\.(ts|tsx|js|jsx)$/.test(path)) return false;
  return !SELF_EXEMPT.has(path);
}

export async function scanRepo() {
  const hits = [];
  for (const file of await trackedFiles()) {
    if (!shouldScan(file)) continue;
    const text = await readFile(`${ROOT}${file}`, "utf8");
    hits.push(...scanText(text, file));
  }
  return hits;
}

function report(hits) {
  if (hits.length === 0) {
    console.log("no dynamic imports detected");
    return;
  }

  console.error(`dynamic import lint failed: ${hits.length} hit(s)\n`);
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(`      ${hit.text}`);
  }
  console.error(
    "\nUse static imports so type checks, lint, tests, and dependency review " +
      "see the same module graph.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = await scanRepo();
  report(hits);
  process.exitCode = hits.length === 0 ? 0 : 1;
}
