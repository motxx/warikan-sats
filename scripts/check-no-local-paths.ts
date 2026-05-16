#!/usr/bin/env -S deno run --allow-read
/**
 * Local-path leak guard.
 *
 * Catches developer-machine-specific filesystem paths in text that may be
 * committed, copied into issues, or posted externally.
 *
 * Usage:
 *   deno task lint:paths
 *   deno run --allow-read scripts/check-no-local-paths.ts <file>...
 *   deno run --allow-read scripts/check-no-local-paths.ts --stdin
 *
 * Opt-out for legitimate examples by adding this marker on the same line:
 *   allow-local-path: <reason>
 */

const ROOT = decodeURIComponent(new URL("../", import.meta.url).pathname);

interface Hit {
  file: string;
  line: number;
  text: string;
  match: string;
  pattern: string;
}

const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "macOS user home", re: /\/Users\/[a-zA-Z0-9._-]+\// },
  { name: "Linux user home", re: /\/home\/[a-zA-Z0-9._-]+\// },
  { name: "Windows user home", re: /[A-Za-z]:\\Users\\[A-Za-z0-9._-]+\\/ },
  { name: "macOS temporary directory", re: /\/private\/var\/folders\// },
  { name: "tilde home path", re: /(?:^|[\s"'`(=])~\/[.\w][\w.-]*/ },
  { name: "$HOME path", re: /\$HOME\/[\w.-]+/ },
];

const TEXT_EXTS = /\.(ts|tsx|js|jsx|json|md|sh|yml|yaml|html|css|txt)$/;

const SKIP_DIRS = new Set([
  ".git",
  ".cache",
  ".deno",
  ".DS_Store",
  "node_modules",
  "dist",
  "build",
  "target",
  "vendor",
]);

const SELF_EXEMPT = new Set([
  "scripts/check-no-local-paths.ts",
  "scripts/check-no-local-paths.test.ts",
]);

const OPT_OUT = /allow-local-path:/;

function toAbs(path: string): string {
  if (path.startsWith("/")) return path;
  return `${Deno.cwd().replace(/\/$/, "")}/${path}`;
}

function toRepoPath(path: string): string {
  const abs = toAbs(path);
  return abs.startsWith(ROOT) ? abs.slice(ROOT.length) : path;
}

function shouldScanFile(path: string): boolean {
  const rel = toRepoPath(path);
  if (SELF_EXEMPT.has(rel)) return false;
  return TEXT_EXTS.test(path);
}

function scanText(text: string, file: string): Hit[] {
  const hits: Hit[] = [];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
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

async function scanFile(path: string): Promise<Hit[]> {
  if (!shouldScanFile(path)) return [];

  try {
    const text = await Deno.readTextFile(path);
    return scanText(text, toRepoPath(path));
  } catch {
    return [];
  }
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
  for await (const entry of Deno.readDir(dir)) {
    if (SKIP_DIRS.has(entry.name)) continue;

    const path = `${dir.replace(/\/$/, "")}/${entry.name}`;
    if (entry.isDirectory) {
      yield* walkFiles(path);
    } else if (entry.isFile) {
      yield path;
    }
  }
}

async function scanRepo(): Promise<Hit[]> {
  const hits: Hit[] = [];
  for await (const path of walkFiles(ROOT)) {
    hits.push(...await scanFile(path));
  }
  return hits;
}

async function readStdin(): Promise<string> {
  const chunks: Uint8Array[] = [];
  const buffer = new Uint8Array(4096);

  while (true) {
    const n = await Deno.stdin.read(buffer);
    if (n === null) break;
    chunks.push(buffer.slice(0, n));
  }

  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(out);
}

function report(hits: Hit[]): void {
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

if (import.meta.main) {
  const args = Deno.args;
  let hits: Hit[] = [];

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
  Deno.exit(hits.length === 0 ? 0 : 1);
}

export { PATTERNS, scanFile, scanRepo, scanText };
