import { assert, assertEquals } from "@std/assert";
import { scanRepo, scanText } from "./lint-types.ts";

Deno.test("catches any annotation", () => {
  assertEquals(scanText("const value: any = 1;", "a.ts").length, 1);
});

Deno.test("catches as any assertion", () => {
  assertEquals(scanText("const value = input as any;", "a.ts").length, 1);
});

Deno.test("catches double assertion through unknown", () => {
  assertEquals(
    scanText("const value = input as unknown as Thing;", "a.ts").length,
    1,
  );
});

Deno.test("ignores strings and comments", () => {
  assertEquals(scanText("const value = 'as any';", "a.ts").length, 0);
  assertEquals(scanText("// const value: any = 1;", "a.ts").length, 0);
});

Deno.test("honors allow comment on previous line", () => {
  assertEquals(
    scanText("// type-lint-allow: fixture\nconst value: any = 1;", "a.ts")
      .length,
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
