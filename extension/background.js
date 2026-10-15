
const api = globalThis.browser ?? globalThis.chrome;

console.log("RabbitHole background script loaded!");

// Track the most recently recorded page in each tab.
const lastPageByTab = new Map();

// Prevent simultaneous storage writes from overwriting events.
let recordingQueue = Promise.resolve();

function isWebPage(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url);
}

async function recordNavigation(tabId, changeInfo, tab) {
  if (changeInfo.status !== "complete") {
    return;
  }

  const url = tab.url;

  if (!isWebPage(url)) {
    return;
  }

  const { currentSession } = await api.storage.local.get(
    "currentSession"
  );

  if (!currentSession?.active) {
    return;
  }

  const sessionId = currentSession.id;

  // Read the previous page for this tab and session.
  const previous = lastPageByTab.get(tabId);

  // Ignore refreshes and repeated loads of the same URL.
  if (
    previous?.sessionId === sessionId &&
    previous.url === url
  ) {
    return;
  }

  const fromUrl =
    previous?.sessionId === sessionId
      ? previous.url
      : null;

  const event = {
    id: crypto.randomUUID(),
    sessionId,
    tabId,
    url,
    title: tab.title || url,
    fromUrl,
    timestamp: new Date().toISOString()
  };

  // Remember the new page for this tab.
  lastPageByTab.set(tabId, {
    sessionId,
    url
  });

  // Serialize writes so multiple tabs don't overwrite each other.
  recordingQueue = recordingQueue
    .catch(console.error)
    .then(async () => {
      const { navigationEvents = [], currentSession: latestSession } =
        await api.storage.local.get([
          "navigationEvents",
          "currentSession"
        ]);

      // Don't save an event after its session has stopped.
      if (
        latestSession?.id !== sessionId ||
        !latestSession.active
      ) {
        return;
      }

      navigationEvents.push(event);

      await api.storage.local.set({
        navigationEvents
      });

      console.log("RabbitHole recorded:", event);
    });

  await recordingQueue;
}

// Capture completed navigation in regular browser tabs.
api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  recordNavigation(tabId, changeInfo, tab).catch(console.error);
});

// Forget tab history when a tab closes.
api.tabs.onRemoved.addListener(tabId => {
  lastPageByTab.delete(tabId);
});
console.log("RabbitHole API check:", typeof api.tabs);


api.tabs.query({}).then((tabs) => {
  console.log(
    "RabbitHole visible tabs:",
    tabs.map((tab) => ({
      id: tab.id,
      url: tab.url
    }))
  );
}).catch(console.error);

api.scripting.executeScript({
  target: { tabId: 24 },
  func: () => {
    document.documentElement.setAttribute(
      "data-rabbithole-bridge",
      "manual-test"
    );
  }
}).then(() => {
  console.log("Manual injection succeeded!");
}).catch((error) => {
  console.error("Manual injection failed:", error);
});
