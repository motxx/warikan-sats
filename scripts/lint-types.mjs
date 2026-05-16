#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { ROOT, stripStrings, trackedFiles } from "./repo-lint-lib.mjs";

const SELF_EXEMPT = new Set([
  "scripts/lint-types.mjs",
  "scripts/lint-types.test.mjs",
]);

export function scanText(text, file) {
  const hits = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const trimmed = raw.trim();
    if (
      trimmed.startsWith("//") ||
      trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    ) {
      continue;
    }
    const allow = /type-lint-allow:/.test(raw) ||
      (i > 0 && /type-lint-allow:/.test(lines[i - 1]));
    if (allow) continue;

    const line = stripStrings(raw);
    if (/\bas\s+unknown\s+as\b/.test(line)) {
      hits.push({ file, line: i + 1, code: "T003", text: trimmed });
    }
    if (/\bas\s+any\b/.test(line)) {
      hits.push({ file, line: i + 1, code: "T001", text: trimmed });
    }
    if (
      /:\s*any\b(?!\.)/.test(line) ||
      /<\s*any\s*[,>]/.test(line) ||
      /\bArray\s*<\s*any\s*>/.test(line)
    ) {
      hits.push({ file, line: i + 1, code: "T002", text: trimmed });
    }
  }

  return hits;
}

function shouldScan(path) {
  if (!/\.(ts|tsx)$/.test(path)) return false;
  if (!(path.startsWith("src/") || path.startsWith("scripts/") || path.startsWith("cypress/"))) {
    return false;
  }
  if (path.endsWith(".test.ts") || path.endsWith(".test.tsx")) return false;
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
    console.log("type-safety lint passed");
    return;
  }

  console.error(`type-safety lint failed: ${hits.length} hit(s)\n`);
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line} [${hit.code}]`);
    console.error(`      ${hit.text}`);
  }
  console.error(
    "\nAvoid `any`, `as any`, and `as unknown as`. Use typed boundaries, " +
      "runtime validation, or a narrowly-scoped allow comment with a reason.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const hits = await scanRepo();
  report(hits);
  process.exitCode = hits.length === 0 ? 0 : 1;
}
