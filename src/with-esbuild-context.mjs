import { context } from "esbuild";

export async function withEsbuildContext(settings, use) {
  console.log("Build: recreating esbuild context");

  const buildContext = await context(settings);

  try {
    return await use(buildContext);
  } finally {
    await buildContext.dispose();
  }
}
