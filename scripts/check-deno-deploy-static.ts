import { assert, assertStringIncludes } from "@std/assert";

const indexHtml = await Deno.readTextFile("dist/index.html");
const notFoundHtml = await Deno.readTextFile("dist/404.html");
const clientJavaScript = await readClientJavaScript("dist/assets");

assert(
  !indexHtml.includes("/warikan-sats/"),
  "Deno Deploy static build must not include the legacy subpath.",
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
assert(
  !clientJavaScript.includes("/warikan-sats/"),
  "Deno Deploy JavaScript bundle must not include legacy subpath routes.",
);
assertStringIncludes(
  clientJavaScript,
  '"/wallet"',
  "Deno Deploy JavaScript bundle should route the root app to /wallet.",
);

async function readClientJavaScript(assetDir: string): Promise<string> {
  const chunks: string[] = [];

  for await (const entry of Deno.readDir(assetDir)) {
    if (entry.isFile && entry.name.endsWith(".js")) {
      chunks.push(await Deno.readTextFile(`${assetDir}/${entry.name}`));
    }
  }

  return chunks.join("\n");
}
