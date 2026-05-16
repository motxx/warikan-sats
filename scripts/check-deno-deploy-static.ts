import { assert, assertStringIncludes } from "@std/assert";

const indexHtml = await Deno.readTextFile("dist/index.html");
const notFoundHtml = await Deno.readTextFile("dist/404.html");

assert(
  !indexHtml.includes("/warikan-sats/"),
  "Deno Deploy static build must not include the GitHub Pages subpath.",
);
assertStringIncludes(
  indexHtml,
  'src="/assets/',
  "Deno Deploy static build should reference root-served JavaScript assets.",
);
assert(
  notFoundHtml === indexHtml,
  "SPA fallback copy should match dist/index.html.",
);
