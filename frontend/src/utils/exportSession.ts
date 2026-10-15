
import type {
  NavigationEvent,
  RabbitHoleSession,
} from '../hooks/useRabbitHoleData'

export function exportSession(
  session: RabbitHoleSession,
  events: NavigationEvent[]
): void {
  const sessionEvents = events.filter(
    event => event.sessionId === session.id
  )

  const exportData = {
    format: 'rabbithole-session',
    version: 1,
    exportedAt: new Date().toISOString(),
    session,
    events: sessionEvents,
  }

  const blob = new Blob(
    [JSON.stringify(exportData, null, 2)],
    { type: 'application/json' }
  )

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const safeTitle =
    session.title.replace(/[^a-z0-9-_]/gi, '_') || 'session'

  link.href = url
  link.download = `rabbithole-${safeTitle}.json`

  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
