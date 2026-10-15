document.documentElement.setAttribute(
  "data-rabbithole-bridge",
  "loaded"
);
console.log("RABBITHOLE BRIDGE TEST");
const rabbitApi = globalThis.browser ?? globalThis.chrome;

console.log("RabbitHole Explorer bridge loaded!");

const ALLOWED_ORIGIN = "http://localhost:5173";

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (event.origin !== ALLOWED_ORIGIN) return;

  if (event.data?.type !== "RABBITHOLE_GET_DATA") {
    return;
  }

  console.log("RabbitHole Explorer requested data!");

  try {
    const data = await rabbitApi.storage.local.get([
      "currentSession",
      "navigationEvents"
    ]);

    window.postMessage(
      {
        type: "RABBITHOLE_DATA",
        currentSession: data.currentSession ?? null,
        navigationEvents: data.navigationEvents ?? []
      },
      ALLOWED_ORIGIN
    );
  } catch (error) {
    console.error("RabbitHole bridge error:", error);
  }
});
