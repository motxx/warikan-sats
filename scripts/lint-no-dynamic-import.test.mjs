#!/usr/bin/env node
import assert from "node:assert/strict";
import { scanRepo, scanText } from "./lint-no-dynamic-import.mjs";

assert.equal(scanText("const mod = await import('./mod');", "a.ts").length, 1);
assert.equal(scanText("const url = import.meta.url;", "a.ts").length, 0);
assert.equal(scanText("// const mod = import('./mod');", "a.ts").length, 0);
assert.equal(scanText("/** @type {import('tailwindcss').Config} */", "a.js").length, 0);
assert.equal(
  scanText("const mod = import('./fixture'); // allow-dynamic-import: fixture", "a.ts")
    .length,
  0,
);

const repoHits = await scanRepo();
assert.equal(
  repoHits.length,
  0,
  `expected repo scan to be clean, got ${JSON.stringify(repoHits, null, 2)}`,
);

console.log("lint-no-dynamic-import tests passed");
