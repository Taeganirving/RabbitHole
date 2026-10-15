
const api = globalThis.browser ?? globalThis.chrome;

const startButton = document.getElementById("start-btn");
const sessionInput = document.getElementById("session-title");
const status = document.getElementById("status");

async function updatePopup() {
  const { currentSession, navigationEvents = [] } =
    await api.storage.local.get([
      "currentSession",
      "navigationEvents"
    ]);

  if (currentSession?.active) {
    sessionInput.value = currentSession.title;
    sessionInput.disabled = true;
    startButton.textContent = "Stop RabbitHole";

    const count = navigationEvents.filter(
      event => event.sessionId === currentSession.id
    ).length;

    status.textContent = `Recording: ${count} pages captured`;
  } else {
    sessionInput.disabled = false;
    startButton.textContent = "Start RabbitHole";
    status.textContent = "Ready to explore";
  }
}

startButton.addEventListener("click", async () => {
  const { currentSession } =
    await api.storage.local.get("currentSession");

  if (currentSession?.active) {
    await api.storage.local.set({
      currentSession: {
        ...currentSession,
        active: false,
        stoppedAt: new Date().toISOString()
      }
    });
  } else {
    const title = sessionInput.value.trim();

    if (!title) {
      status.textContent = "Please enter a session name.";
      return;
    }

    await api.storage.local.set({
      currentSession: {
        id: crypto.randomUUID(),
        title,
        startedAt: new Date().toISOString(),
        active: true
      }
    });
  }

  await updatePopup();
});

updatePopup();
