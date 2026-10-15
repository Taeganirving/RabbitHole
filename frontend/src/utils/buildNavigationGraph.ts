
import type { Node, Edge } from '@xyflow/react'
import type { NavigationEvent } from '../hooks/useRabbitHoleData'

export function buildNavigationGraph(
  events: NavigationEvent[],
  nodeStyle: string
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []

  const urlToId = new Map<string, string>()
  const edgeIds = new Set<string>()

  for (const event of events) {
    if (!urlToId.has(event.url)) {
      const id = `page-${urlToId.size + 1}`
      urlToId.set(event.url, id)

      nodes.push({
        id,
        type: 'rabbit',
        position: {
          x: (nodes.length % 4) * 260,
          y: Math.floor(nodes.length / 4) * 190,
        },
        data: {
          label: event.title || new URL(event.url).hostname,
          url: event.url,
          nodeStyle,
        },
      })
    }
  }

  for (const event of events) {
    if (!event.fromUrl) continue

    const source = urlToId.get(event.fromUrl)
    const target = urlToId.get(event.url)

    if (!source || !target || source === target) continue

    const id = `edge-${source}-${target}`

    if (edgeIds.has(id)) continue
    edgeIds.add(id)

    edges.push({
      id,
      source,
      target,
      animated: true,
    })
  }

  return { nodes, edges }
}
