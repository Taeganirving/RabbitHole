
import type {
  NavigationEvent,
  RabbitHoleSession,
} from '../hooks/useRabbitHoleData'

interface ImportFile {
  format: string
  version: number
  session: RabbitHoleSession
  events: NavigationEvent[]
}

interface StorageData {
  sessions?: RabbitHoleSession[]
  navigationEvents?: NavigationEvent[]
}

interface BrowserStorage {
  storage: {
    local: {
      get(keys: string[]): Promise<StorageData>
      set(data: StorageData): Promise<void>
    }
  }
}

export async function importSession(file: File): Promise<string> {
  const browserApi = (
    globalThis as typeof globalThis & {
      browser?: BrowserStorage
    }
  ).browser

  if (!browserApi?.storage?.local) {
    throw new Error('Firefox extension storage is unavailable.')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File is too large. Maximum size is 10 MB.')
  }

  let data: unknown

  try {
    data = JSON.parse(await file.text())
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Invalid RabbitHole file.')
  }

  const imported = data as Partial<ImportFile>

  if (
    imported.format !== 'rabbithole-session' ||
    imported.version !== 1 ||
    !imported.session ||
    !Array.isArray(imported.events)
  ) {
    throw new Error('Unsupported RabbitHole export format.')
  }

  const original = imported.session

  if (
    typeof original.id !== 'string' ||
    typeof original.title !== 'string' ||
    typeof original.startedAt !== 'string'
  ) {
    throw new Error('The session information is invalid.')
  }

  const originalSessionId = original.id

  for (const event of imported.events) {
    if (
      !event ||
      typeof event.id !== 'string' ||
      typeof event.sessionId !== 'string' ||
      event.sessionId !== originalSessionId ||
      typeof event.url !== 'string' ||
      !/^https?:\/\//i.test(event.url) ||
      typeof event.title !== 'string' ||
      typeof event.timestamp !== 'string' ||
      typeof event.tabId !== 'number' ||
      (event.fromUrl !== null &&
        (typeof event.fromUrl !== 'string' ||
          !/^https?:\/\//i.test(event.fromUrl)))
    ) {
      throw new Error('The file contains invalid navigation events.')
    }
  }

  const newSessionId = crypto.randomUUID()

  const newSession: RabbitHoleSession = {
    id: newSessionId,
    title: original.title,
    startedAt: original.startedAt,
    active: false,
    stoppedAt: original.stoppedAt ?? new Date().toISOString(),
  }

  const newEvents: NavigationEvent[] = imported.events.map(event => ({
    id: crypto.randomUUID(),
    sessionId: newSessionId,
    tabId: event.tabId,
    url: event.url,
    title: event.title,
    fromUrl: event.fromUrl,
    timestamp: event.timestamp,
  }))

  const existing = await browserApi.storage.local.get([
    'sessions',
    'navigationEvents',
  ])

  await browserApi.storage.local.set({
    sessions: [...(existing.sessions ?? []), newSession],
    navigationEvents: [
      ...(existing.navigationEvents ?? []),
      ...newEvents,
    ],
  })

  return newSession.title
}
