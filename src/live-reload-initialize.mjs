export function initialize(metaUrl, initializeCallback) {
  let abortController = new AbortController();

  initializeCallback({
    signal: abortController.signal,
  });

  document.addEventListener("poet:live-reloaded", function () {
    for (const script of Array.from(document.querySelectorAll("script"))) {
      // script still in the document
      if (script.src === metaUrl) {
        // reverted back to the original contents
        if (abortController.signal.aborted) {
          console.log("[poet] rendering old version of the script");

          abortController = new AbortController();

          initializeCallback({
            signal: abortController.signal,
          });
        }

        return;
      }
    }

    abortController.abort();
  });
}
