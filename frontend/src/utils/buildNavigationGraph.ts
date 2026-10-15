
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

  // Create one node for each unique webpage.
  for (const event of events) {
    if (!urlToId.has(event.url)) {
      const id = `page-${urlToId.size + 1}`
      urlToId.set(event.url, id)

      nodes.push({
        id,
        type: 'rabbit',
        position: { x: 0, y: 0 },
        data: {
          label: event.title || new URL(event.url).hostname,
          url: event.url,
          nodeStyle,
        },
      })
    }
  }

  // Build connections based on recorded navigation.
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

  // Create an adjacency map for the graph.
  const children = new Map<string, string[]>()
  const incoming = new Map<string, number>()

  for (const node of nodes) {
    children.set(node.id, [])
    incoming.set(node.id, 0)
  }

  for (const edge of edges) {
    children.get(edge.source)?.push(edge.target)
    incoming.set(
      edge.target,
      (incoming.get(edge.target) ?? 0) + 1
    )
  }

  // Start from webpages without incoming connections.
  const roots = nodes
    .filter(node => incoming.get(node.id) === 0)
    .map(node => node.id)

  const visited = new Set<string>()
  const levels = new Map<string, number>()

  function visit(id: string, depth: number) {
    if (visited.has(id)) return

    visited.add(id)
    levels.set(id, depth)

    for (const child of children.get(id) ?? []) {
      visit(child, depth + 1)
    }
  }

  for (const root of roots) {
    visit(root, 0)
  }

  // Handle cycles and disconnected pages.
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      visit(node.id, 0)
    }
  }

  // Group webpages by their depth in the navigation tree.
  const levelGroups = new Map<number, Node[]>()

  for (const node of nodes) {
    const depth = levels.get(node.id) ?? 0

    if (!levelGroups.has(depth)) {
      levelGroups.set(depth, [])
    }

    levelGroups.get(depth)?.push(node)
  }

  // Position each level vertically, spreading branches horizontally.
  const horizontalSpacing = 280
  const verticalSpacing = 190

  for (const [depth, group] of levelGroups) {
    const totalWidth = (group.length - 1) * horizontalSpacing

    group.forEach((node, index) => {
      node.position = {
        x: index * horizontalSpacing - totalWidth / 2,
        y: depth * verticalSpacing,
      }
    })
  }

  return { nodes, edges }
}
