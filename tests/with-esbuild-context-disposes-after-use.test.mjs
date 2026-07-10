import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { withEsbuildContext } from "../src/with-esbuild-context.mjs";

const entryPoint = fileURLToPath(new URL("./fixtures/entry.ts", import.meta.url));

const settings = {
  bundle: false,
  entryPoints: [entryPoint],
  logLevel: "silent",
  write: false,
};

test("disposes the esbuild context after use resolves", async function () {
  let capturedContext;

  await withEsbuildContext(settings, async function (buildContext) {
    capturedContext = buildContext;

    await buildContext.rebuild();
  });

  await assert.rejects(async function () {
    await capturedContext.rebuild();
  });
});
