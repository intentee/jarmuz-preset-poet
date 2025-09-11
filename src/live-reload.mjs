import { Idiomorph } from "idiomorph";

const DEBOUNCE_MILLIS = 1000;
const DOCTYPE = "<!DOCTYPE html>";

const poetLiveReloadSymbol = Symbol("POET_LIVE_RELOAD");

let currentLiveReloadPath = null;
let intendsClose = false;
let liveReloadSocket = null;

function morphDocument(updatedHTML) {
  Idiomorph.morph(document.documentElement, updatedHTML, {
    head: {
      style: "morph",
    },
  });
}

function keepSocketAlive(setupCallback) {
  liveReloadSocket = new WebSocket(
    `/api/v1/live_reload${currentLiveReloadPath}`,
  );

  liveReloadSocket.onclose = function (event) {
    if (!intendsClose) {
      console.warn("[poet] live reload socket closed", event);
    }

    liveReloadSocket = null;

    setTimeout(
      function () {
        keepSocketAlive(setupCallback);
      },
      intendsClose ? 0 : DEBOUNCE_MILLIS,
    );

    intendsClose = false;
  };

  liveReloadSocket.onmessage = function (event) {
    const updatedHTML = event.data.trim();
    const updatedHTMLWithoutDoctype = updatedHTML.startsWith(DOCTYPE)
      ? updatedHTML.substring(DOCTYPE.length)
      : updatedHTML;

    setupCallback({
      morphDocument,
      updatedHTML,
      updatedHTMLWithoutDoctype,
    });
  };

  liveReloadSocket.onerror = function (event) {
    console.error("[poet] live reload socket failed", event);

    liveReloadSocket?.close();
  };
}

export function liveReload(setupCallback) {
  if (globalThis[poetLiveReloadSymbol]) {
    return;
  }

  globalThis[poetLiveReloadSymbol] = true;

  console.log("[poet] setting up live reload");

  currentLiveReloadPath = window.location.pathname;

  keepSocketAlive(setupCallback);
}
