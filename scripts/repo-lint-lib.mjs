import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const ROOT = new URL("../", import.meta.url).pathname;

export function toRepoPath(path) {
  const absolute = path.startsWith("/") ? path : `${process.cwd()}/${path}`;
  return absolute.startsWith(ROOT) ? absolute.slice(ROOT.length) : path;
}

export async function trackedFiles() {
  const { stdout } = await execFileAsync("git", [
    "ls-files",
    "-co",
    "--exclude-standard",
    "-z",
  ], { cwd: ROOT, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });

  return stdout.split("\0").filter(Boolean);
}

export function stripStrings(line) {
  return line
    .replace(/`(?:\\.|[^`\\])*`/g, "``")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, "''");
}
