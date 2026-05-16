#!/usr/bin/env node
import assert from "node:assert/strict";
import { scanRepo, scanText } from "./lint-types.mjs";

assert.equal(scanText("const value: any = 1;", "a.ts").length, 1);
assert.equal(scanText("const value = input as any;", "a.ts").length, 1);
assert.equal(scanText("const value = input as unknown as Thing;", "a.ts").length, 1);
assert.equal(scanText("const value = 'as any';", "a.ts").length, 0);
assert.equal(scanText("// const value: any = 1;", "a.ts").length, 0);
assert.equal(
  scanText("// type-lint-allow: fixture\nconst value: any = 1;", "a.ts").length,
  0,
);

const repoHits = await scanRepo();
assert.equal(
  repoHits.length,
  0,
  `expected repo scan to be clean, got ${JSON.stringify(repoHits, null, 2)}`,
);

console.log("lint-types tests passed");
