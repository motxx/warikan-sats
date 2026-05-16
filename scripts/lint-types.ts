#!/usr/bin/env -S deno run --allow-read --allow-run

const ROOT = decodeURIComponent(new URL("../", import.meta.url).pathname);

export interface TypeLintHit {
  file: string;
  line: number;
  code: "T001" | "T002" | "T003";
  text: string;
}

const SELF_EXEMPT = new Set([
  "scripts/lint-types.ts",
  "scripts/lint-types.test.ts",
]);

function stripStrings(line: string): string {
  return line
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}

export function scanText(text: string, file: string): TypeLintHit[] {
  const hits: TypeLintHit[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]!;
    const trimmed = raw.trim();
    if (
      trimmed.startsWith("//") || trimmed.startsWith("*") ||
      trimmed.startsWith("/*")
    ) {
      continue;
    }
    const allow = /type-lint-allow:/.test(raw) ||
      (i > 0 && /type-lint-allow:/.test(lines[i - 1]!));
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

function shouldScan(path: string): boolean {
  if (!/\.(ts|tsx)$/.test(path)) return false;
  if (
    !(path.startsWith("src/") || path.startsWith("scripts/") ||
      path.startsWith("cypress/"))
  ) {
    return false;
  }
  if (path.endsWith(".test.ts") || path.endsWith(".test.tsx")) return false;
  return !SELF_EXEMPT.has(path);
}

async function trackedFiles(): Promise<string[]> {
  const command = new Deno.Command("git", {
    args: ["ls-files", "-co", "--exclude-standard", "-z"],
    cwd: ROOT,
    stdout: "piped",
    stderr: "piped",
  });
  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    throw new Error(new TextDecoder().decode(stderr).trim());
  }
  return new TextDecoder().decode(stdout).split("\0").filter(Boolean);
}

export async function scanRepo(): Promise<TypeLintHit[]> {
  const hits: TypeLintHit[] = [];
  for (const file of await trackedFiles()) {
    if (!shouldScan(file)) continue;
    try {
      const text = await Deno.readTextFile(`${ROOT}${file}`);
      hits.push(...scanText(text, file));
    } catch {
      // Ignore deleted tracked files before the next commit updates the index.
    }
  }
  return hits;
}

function report(hits: TypeLintHit[]): void {
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

if (import.meta.main) {
  const hits = await scanRepo();
  report(hits);
  if (hits.length > 0) Deno.exit(1);
}
