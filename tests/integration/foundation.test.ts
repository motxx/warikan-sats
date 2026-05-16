import { assertEquals } from "@std/assert";

Deno.test("integration harness is wired", () => {
  assertEquals("deno-integration", "deno-integration");
});
