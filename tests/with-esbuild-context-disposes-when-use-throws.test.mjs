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

test("disposes the esbuild context when use throws", async function () {
  let capturedContext;
  const sentinel = new Error("use failed");

  await assert.rejects(
    withEsbuildContext(settings, async function (buildContext) {
      capturedContext = buildContext;

      throw sentinel;
    }),
    function (error) {
      return error === sentinel;
    },
  );

  await assert.rejects(async function () {
    await capturedContext.rebuild();
  });
});
