import { glob } from "glob";
import { unlink } from "node:fs/promises";
import { join } from "node:path";
import { run } from "typed-css-modules";

import { basic } from "jarmuz/job-types";

export function tcm() {
  basic(async function ({ baseDirectory }) {
    let outDir = join(baseDirectory, "resources/ts/components");
    let searchDir = join(baseDirectory, "resources/ts/components");

    for (const filepath of await glob(
      `${baseDirectory}/resources/ts/components/*.module.css.d.ts`,
    )) {
      await unlink(filepath);
    }

    await run(searchDir, {
      pattern: "*.module.css",
      outDir,
      watch: false,
      camelCase: false,
      namedExports: false,
      dropExtension: false,
      allowArbitraryExtensions: false,
      silent: false,
      listDifferent: false,
    });
  });
}
