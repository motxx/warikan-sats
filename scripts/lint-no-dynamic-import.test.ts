import { assert, assertEquals } from "@std/assert";
import { scanRepo, scanText } from "./lint-no-dynamic-import.ts";

Deno.test("catches dynamic imports", () => {
  assertEquals(scanText("const mod = await import('./mod');", "a.ts").length, 1);
});

Deno.test("ignores import meta", () => {
  assertEquals(scanText("const url = import.meta.url;", "a.ts").length, 0);
});

Deno.test("ignores comments and jsdoc type imports", () => {
  assertEquals(scanText("// const mod = import('./mod');", "a.ts").length, 0);
  assertEquals(
    scanText("/** @type {import('tailwindcss').Config} */", "a.js").length,
    0,
  );
});

Deno.test("honors explicit allow marker", () => {
  assertEquals(
    scanText(
      "const mod = import('./fixture'); // allow-dynamic-import: fixture",
      "a.ts",
    ).length,
    0,
  );
});

Deno.test("repo scan is clean", async () => {
  const hits = await scanRepo();
  assert(
    hits.length === 0,
    `expected repo scan to be clean, got ${JSON.stringify(hits, null, 2)}`,
  );
});
