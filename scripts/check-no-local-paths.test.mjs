#!/usr/bin/env node
import assert from "node:assert/strict";
import { scanRepo, scanText } from "./check-no-local-paths.mjs";

const cases = [
  ["macOS user home paths", "see /Users/alice/dev/project/file.ts", 1],
  ["Linux user home paths", "wrote /home/alice/project/out.txt", 1],
  ["Windows user home paths", String.raw`see C:\Users\alice\project`, 1],
  ["tilde home paths", "design doc at ~/.notes/project/plan.md", 1],
  ["environment home paths", "cp $HOME/key.pem /tmp/out", 1],
  ["macOS temporary directory paths", "tmp /private/var/folders/xx/yy/out", 1],
  ["URLs with users path segments", "see https://example.test/orgs/acme/users/alice", 0],
  ["bare approximation tilde", "takes ~5 minutes", 0],
  [
    "same-line opt out marker",
    "fixture: /Users/example/repo/file.ts // allow-local-path: regex fixture",
    0,
  ],
];

for (const [name, text, expected] of cases) {
  const hits = scanText(text, "a.md");
  assert.equal(hits.length, expected, name);
}

const repoHits = await scanRepo();
assert.equal(
  repoHits.length,
  0,
  `expected repo scan to be clean, got ${JSON.stringify(repoHits, null, 2)}`,
);

console.log("check-no-local-paths tests passed");
