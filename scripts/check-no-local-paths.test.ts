import { assert, assertEquals } from "@std/assert";
import { scanRepo, scanText } from "./check-no-local-paths.ts";

Deno.test("catches macOS user home paths", () => {
  const hits = scanText("see /Users/alice/dev/project/file.ts", "a.md");
  assertEquals(hits.length, 1, "expected one hit");
  assertEquals(hits[0]!.pattern, "macOS user home", "expected macOS pattern");
});

Deno.test("catches Linux user home paths", () => {
  const hits = scanText("wrote /home/alice/project/out.txt", "a.md");
  assertEquals(hits.length, 1, "expected one hit");
});

Deno.test("catches Windows user home paths", () => {
  const hits = scanText(String.raw`see C:\Users\alice\project`, "a.md");
  assertEquals(hits.length, 1, "expected one hit");
});

Deno.test("catches tilde home paths", () => {
  const hits = scanText("design doc at ~/.notes/project/plan.md", "a.md");
  assertEquals(hits.length, 1, "expected one hit");
});

Deno.test("catches environment home paths", () => {
  const hits = scanText("cp $HOME/key.pem /tmp/out", "a.md");
  assertEquals(hits.length, 1, "expected one hit");
});

Deno.test("catches macOS temporary directory paths", () => {
  const hits = scanText("tmp /private/var/folders/xx/yy/out", "a.md");
  assertEquals(hits.length, 1, "expected one hit");
});

Deno.test("ignores URLs with users path segments", () => {
  const hits = scanText(
    "see https://example.test/orgs/acme/users/alice",
    "a.md",
  );
  assertEquals(hits.length, 0, "expected no hits");
});

Deno.test("ignores bare approximation tilde", () => {
  const hits = scanText("takes ~5 minutes", "a.md");
  assertEquals(hits.length, 0, "expected no hits");
});

Deno.test("honors same-line opt out marker", () => {
  const hits = scanText(
    "fixture: /Users/example/repo/file.ts // allow-local-path: regex fixture",
    "a.md",
  );
  assertEquals(hits.length, 0, "expected no hits");
});

Deno.test("repo scan is clean", async () => {
  const hits = await scanRepo();
  assert(
    hits.length === 0,
    `expected repo scan to be clean, got ${JSON.stringify(hits, null, 2)}`,
  );
});
