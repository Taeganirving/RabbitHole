
import { useEffect, useState } from 'react'

export interface NavigationEvent {
  id: string
  sessionId: string
  tabId: number
  url: string
  title: string
  fromUrl: string | null
  timestamp: string
}

export interface RabbitHoleSession {
  id: string
  title: string
  startedAt: string
  active: boolean
  stoppedAt?: string
}

interface StoredData {
  currentSession?: RabbitHoleSession
  navigationEvents?: NavigationEvent[]
}

interface ExtensionApi {
  storage: {
    local: {
      get(keys: string[]): Promise<StoredData>
    }
    onChanged: {
      addListener(
        callback: (changes: Record<string, unknown>, area: string) => void
      ): void
      removeListener(
        callback: (changes: Record<string, unknown>, area: string) => void
      ): void
    }
  }
}

export function useRabbitHoleData() {
  const [session, setSession] = useState<RabbitHoleSession | null>(null)
  const [events, setEvents] = useState<NavigationEvent[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    console.log('RabbitHole storage hook is running')

    const extension = (
      globalThis as typeof globalThis & {
        browser?: ExtensionApi
      }
    ).browser

    if (!extension?.storage?.local) {
      console.log('RabbitHole: Extension storage unavailable')
      return
    }

    let active = true

    async function loadData() {
      try {
        const data = await extension!.storage.local.get([
          'currentSession',
          'navigationEvents'
        ])

        if (!active) return

        setSession(data.currentSession ?? null)
        setEvents(data.navigationEvents ?? [])
        setConnected(true)

        console.log('RabbitHole storage connected:', data)
      } catch (error) {
        console.error('RabbitHole storage error:', error)
        if (active) setConnected(false)
      }
    }

    function handleStorageChange(
      _changes: Record<string, unknown>,
      area: string
    ) {
      if (area === 'local') {
        void loadData()
      }
    }

    void loadData()

    extension.storage.onChanged.addListener(handleStorageChange)

    return () => {
      active = false
      extension.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  return { session, events, connected }
}
