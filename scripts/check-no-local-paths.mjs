#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { ROOT, toRepoPath, trackedFiles } from "./repo-lint-lib.mjs";

const PATTERNS = [
  { name: "macOS user home", re: /\/Users\/[a-zA-Z0-9._-]+\// },
  { name: "Linux user home", re: /\/home\/[a-zA-Z0-9._-]+\// },
  { name: "Windows user home", re: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\/ },
  { name: "macOS temporary directory", re: /\/private\/var\/folders\// },
  { name: "tilde home path", re: /(?:^|[\s"'`(=])~\/[.\w][\w.-]*/ },
  { name: "$HOME path", re: /\$HOME\/[\w.-]+/ },
];

const TEXT_EXTS = /\.(ts|tsx|js|jsx|json|md|sh|yml|yaml|html|css|txt)$/;
const SELF_EXEMPT = new Set([
  "scripts/check-no-local-paths.mjs",
  "scripts/check-no-local-paths.test.mjs",
]);
const OPT_OUT = /allow-local-path:/;

function shouldScanFile(path) {
  const rel = toRepoPath(path);
  if (SELF_EXEMPT.has(rel)) return false;
  return TEXT_EXTS.test(path);
}

export function scanText(text, file) {
  const hits = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (OPT_OUT.test(line)) continue;

    for (const pattern of PATTERNS) {
      const match = line.match(pattern.re);
      if (!match) continue;

      hits.push({
        file,
        line: i + 1,
        text: line.trim(),
        match: match[0].trim(),
        pattern: pattern.name,
      });
      break;
    }
  }

  return hits;
}

export async function scanFile(path) {
  if (!shouldScanFile(path)) return [];

  try {
    const text = await readFile(path.startsWith("/") ? path : `${ROOT}${path}`, "utf8");
    return scanText(text, toRepoPath(path));
  } catch {
    return [];
  }
}

export async function scanRepo() {
  const hits = [];
  for (const file of await trackedFiles()) {
    hits.push(...await scanFile(file));
  }
  return hits;
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function report(hits) {
  if (hits.length === 0) {
    console.log("OK no local paths detected");
    return;
  }

  console.error(`ERROR local path leak: ${hits.length} hit(s)\n`);
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}  ${hit.pattern}`);
    console.error(`      match: ${hit.match}`);
    console.error(`      text : ${hit.text}`);
  }
  console.error(
    "\nFix: remove the local path, replace it with a repo-relative path or " +
      "placeholder, or add 'allow-local-path: <reason>' on the same line.",
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let hits = [];

  if (args.includes("--stdin")) {
    hits = scanText(await readStdin(), "<stdin>");
  } else if (args.length > 0) {
    for (const file of args) {
      hits.push(...await scanFile(file));
    }
  } else {
    hits = await scanRepo();
  }

  report(hits);
  process.exitCode = hits.length === 0 ? 0 : 1;
}
