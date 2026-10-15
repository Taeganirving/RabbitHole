
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
  startButton.disabled = true;

  try {
    const {
      currentSession,
      sessions = []
    } = await api.storage.local.get([
      "currentSession",
      "sessions"
    ]);

    // Preserve an older session that was created before
    // we introduced session history.
    const savedSessions = [...sessions];

    if (
      currentSession &&
      !savedSessions.some(session => session.id === currentSession.id)
    ) {
      savedSessions.push(currentSession);
    }

    if (currentSession?.active) {
      // Stop recording and preserve the completed session.
      const stoppedSession = {
        ...currentSession,
        active: false,
        stoppedAt: new Date().toISOString()
      };

      const updatedSessions = savedSessions.map(session =>
        session.id === stoppedSession.id
          ? stoppedSession
          : session
      );

      await api.storage.local.set({
        currentSession: stoppedSession,
        sessions: updatedSessions
      });

    } else {
      const title = sessionInput.value.trim();

      if (!title) {
        status.textContent = "Please enter a session name.";
        return;
      }

      const newSession = {
        id: crypto.randomUUID(),
        title,
        startedAt: new Date().toISOString(),
        active: true
      };

      await api.storage.local.set({
        currentSession: newSession,
        sessions: [...savedSessions, newSession]
      });
    }

    await updatePopup();

  } catch (error) {
    console.error("RabbitHole session error:", error);
    status.textContent = "Could not update session.";
  } finally {
    startButton.disabled = false;
  }
});

updatePopup();
