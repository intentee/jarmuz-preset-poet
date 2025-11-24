import { context } from "esbuild";
import { emptyDir } from "fs-extra";
import { writeFile } from "fs/promises";
import { glob } from "glob";
import path from "path";

import { basic } from "jarmuz/job-types";

const METAFILE_FILENAME = "esbuild-meta.json";
const PUBLIC_PATH = "/assets/";

let currentContext = null;
let currentContextSettingsHash = "";

async function getContext(settings) {
  const settingsHash = JSON.stringify(settings);

  if (currentContextSettingsHash !== settingsHash) {
    console.log("Build: recreating esbuild context");
    currentContextSettingsHash = settingsHash;
    currentContext = await context(settings);
  }

  if (!currentContext) {
    throw new Error("There is no current esbuild context");
  }

  return currentContext;
}

export function esbuild({ development }) {
  basic(async function ({ baseDirectory, buildId, printSubtreeList }) {
    let start = performance.now();

    console.log(`Building assets: ${buildId}`);

    const outdir = path.join(baseDirectory, "assets");

    await emptyDir(outdir);

    const inject = await glob([
      `${baseDirectory}/resources/ts/polyfill_*.{ts,tsx}`,
    ]);

    const entryPoints = await glob([
      `${baseDirectory}/resources/css/{component,fragment,global,layout,page}-*.css`,
      `${baseDirectory}/resources/media/**/*.{avif,gif,jpg,jpeg,mp4,png,svg,webm,webp,zip}`,
      `${baseDirectory}/resources/ts/service_worker.{js,mjs,ts,tsx}`,
      `${baseDirectory}/resources/ts/{controller,global,worker}{_,-}*.{js,mjs,ts,tsx}`,
    ]);

    printSubtreeList({
      title: "Entry points",
      items: entryPoints,
    });

    const settings = {
      outdir,
      bundle: true,
      entryPoints,
      minify: !development,
      sourcemap: true,
      splitting: true,
      format: "esm",
      target: "es2024",
      loader: {
        ".avif": "file",
        ".mp4": "file",
        ".otf": "file",
        ".png": "file",
        ".svg": "file",
        ".ttf": "file",
        ".webm": "file",
        ".webp": "file",
        ".woff2": "file",
        ".zip": "file",
      },
      assetNames: `[name]_[hash]`,
      entryNames: `[name]_[hash]`,
      metafile: true,
      define: {
        "process.env.NODE_ENV": JSON.stringify(
          development ? "development" : "production",
        ),
        __BUILD_ID: JSON.stringify(buildId),
        __DEV__: JSON.stringify(String(development)),
        __PUBLIC_PATH: JSON.stringify(PUBLIC_PATH),
      },
      inject,
      preserveSymlinks: true,
      publicPath: PUBLIC_PATH,
      treeShaking: true,
      tsconfig: "tsconfig.json",
    };

    console.log("");

    const context = await getContext(settings);
    const result = await context.rebuild();

    await writeFile(METAFILE_FILENAME, JSON.stringify(result.metafile));

    console.log(`Build metafile written to: ${METAFILE_FILENAME}`);
    console.log(
      `Build finished with ID: ${buildId} in ${Math.round(performance.now() - start)} milliseconds`,
    );

    if (result.errors.length > 0 || result.warnings.length > 0) {
      return false;
    }
  });
}
