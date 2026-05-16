#!/usr/bin/env -S deno run --allow-read --allow-run

const ROOT = decodeURIComponent(new URL("../", import.meta.url).pathname);
const DYNAMIC_IMPORT_RE = /\b(?:await\s+)?import\s*\(/;

export interface DynamicImportHit {
  file: string;
  line: number;
  text: string;
}

const SELF_EXEMPT = new Set([
  "scripts/lint-no-dynamic-import.ts",
  "scripts/lint-no-dynamic-import.test.ts",
]);

export function scanText(text: string, file: string): DynamicImportHit[] {
  const hits: DynamicImportHit[] = [];
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
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

async function trackedFiles(): Promise<string[]> {
  const command = new Deno.Command("git", {
    args: ["ls-files", "-co", "--exclude-standard", "-z"],
    cwd: ROOT,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) throw new Error(new TextDecoder().decode(stderr).trim());
  return new TextDecoder().decode(stdout).split("\0").filter(Boolean);
}

export async function scanRepo(): Promise<DynamicImportHit[]> {
  const hits: DynamicImportHit[] = [];
  for (const file of await trackedFiles()) {
    if (!/\.(ts|tsx|js|jsx)$/.test(file) || SELF_EXEMPT.has(file)) continue;
    try {
      const text = await Deno.readTextFile(`${ROOT}${file}`);
      hits.push(...scanText(text, file));
    } catch {
      // Ignore deleted tracked files before the next commit updates the index.
    }
  }
  return hits;
}

function report(hits: DynamicImportHit[]): void {
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

if (import.meta.main) {
  const hits = await scanRepo();
  report(hits);
  if (hits.length > 0) Deno.exit(1);
}
