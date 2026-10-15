
interface ExtensionStorage {
  local: {
    get(keys: string[]): Promise<{
      sessions?: { id: string }[]
      currentSession?: { id: string; active: boolean }
      navigationEvents?: { sessionId: string }[]
    }>
    set(data: Record<string, unknown>): Promise<void>
  }
}

export async function deleteSession(sessionId: string) {
  const browserApi = (
    globalThis as typeof globalThis & {
      browser?: { storage: ExtensionStorage }
    }
  ).browser

  if (!browserApi) {
    throw new Error('Extension storage unavailable')
  }

  const data = await browserApi.storage.local.get([
    'sessions',
    'currentSession',
    'navigationEvents',
  ])

  if (
    data.currentSession?.id === sessionId &&
    data.currentSession.active
  ) {
    throw new Error('Stop the active session before deleting it.')
  }

  const sessions = (data.sessions ?? []).filter(
    session => session.id !== sessionId
  )

  const navigationEvents = (data.navigationEvents ?? []).filter(
    event => event.sessionId !== sessionId
  )

  await browserApi.storage.local.set({
    sessions,
    navigationEvents,
    currentSession:
      data.currentSession?.id === sessionId
        ? null
        : data.currentSession ?? null,
  })
}
