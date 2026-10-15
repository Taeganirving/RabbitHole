
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRabbitHoleData } from './hooks/useRabbitHoleData'
import { buildNavigationGraph } from './utils/buildNavigationGraph'
import { deleteSession } from './utils/deleteSession'
import { exportSession } from './utils/exportSession'
import { importSession } from './utils/importSession'

import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react'


import {
  Orbit,
  Library,
  Palette,
  Network,
  Search,
  Settings2,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import RabbitNode from './components/RabbitNode'
import AppearanceStudio, {
  backgroundColors,
  defaultAppearance,
  paletteColors,
  type AppearanceSettings,
} from './components/AppearanceStudio'

import '@xyflow/react/dist/style.css'
import './App.css'
const nodeTypes = {
  rabbit: RabbitNode,
}
type ViewMode = 'hybrid' | 'tree' | 'constellation'



function GraphAutoFit({
  nodeCount,
  mode,
  sessionId,
}: {
  nodeCount: number
  mode: ViewMode
  sessionId: string | null
}) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (nodeCount === 0) return

    const frame = requestAnimationFrame(() => {
      void fitView({
        padding: 0.25,
        maxZoom: 1.2,
        duration: 350,
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [nodeCount, mode, sessionId, fitView])

  return null
}



function App() {
  const { session, sessions, events, connected } = useRabbitHoleData()

  useEffect(() => {
    console.log("RabbitHole connection:", connected)
    console.log("Current session:", session)
    console.log("Recorded events:", events)
    console.log("Saved RabbitHole sessions:", sessions)
  }, [connected, session, events, sessions])

  // Graph state
const [nodes, setNodes, onNodesChange] =
  useNodesState<Node>([])

const [edges, setEdges, onEdgesChange] =
  useEdgesState<Edge>([])

  // Interface state
  const [mode, setMode] = useState<ViewMode>('hybrid')
  const [activeView, setActiveView] =
  useState<'library' | 'explorer'>('explorer')
  const [selectedSessionId, setSelectedSessionId] =
  useState<string | null>(null)

const selectedSession =
  sessions.find(item => item.id === selectedSessionId) ??
  session

  const [selectedNodeId, setSelectedNodeId] =
    useState<string | null>(null)

  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [appearanceOpen, setAppearanceOpen] = useState(false)

  // Appearance settings
  const [appearance, setAppearance] =
    useState<AppearanceSettings>(() => {
      try {
        const saved = localStorage.getItem('rabbithole-appearance')

        return saved
          ? { ...defaultAppearance, ...JSON.parse(saved) }
          : { ...defaultAppearance }
      } catch {
        return { ...defaultAppearance }
      }
    })

  // Save appearance settings automatically
  useEffect(() => {
    localStorage.setItem(
      'rabbithole-appearance',
      JSON.stringify(appearance)
    )
  }, [appearance])

  // Convert recorded browsing events into graph nodes and edges
useEffect(() => {
  if (!connected) return

  const sessionEvents = selectedSession
  ? events.filter((event) => event.sessionId === selectedSession.id)
  : []

 
const graph = buildNavigationGraph(
  sessionEvents,
  appearance.nodeStyle
)

const count = graph.nodes.length

const layoutNodes = graph.nodes.map((node, index) => {
  // Tree uses the navigation-based positions.
  if (mode === 'tree') {
    return node
  }

  // Constellation arranges nodes in a circle.
  if (mode === 'constellation') {
    const radius = Math.max(240, count * 35)
    const angle =
      (index / Math.max(count, 1)) * Math.PI * 2 - Math.PI / 2

    return {
      ...node,
      position: {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      },
    }
  }

  // Hybrid uses staggered rows.
  const columns = Math.max(2, Math.ceil(Math.sqrt(count)))
  const row = Math.floor(index / columns)
  const column = index % columns

  return {
    ...node,
    position: {
      x: column * 280 + (row % 2) * 110,
      y: row * 210,
    },
  }
})

setNodes(layoutNodes)
setEdges(graph.edges)

}, [
  connected,
  selectedSession?.id,
  events,
  appearance.nodeStyle,
  setNodes,
  setEdges,
])


  // Active appearance colors
  const accentColor =
  appearance.customAccent ?? paletteColors[appearance.palette]

const backgroundColor =
  appearance.customBackground ?? backgroundColors[appearance.background]
  // CSS variables used by our theme
 const graphBackground =
  appearance.backgroundStyle === 'gradient'
    ? `linear-gradient(
        ${appearance.gradientAngle}deg,
        ${appearance.gradientStart},
        ${appearance.gradientEnd}
      )`
    : `linear-gradient(${backgroundColor}, ${backgroundColor})`

const appStyle = {
  '--accent': accentColor,
  '--graph-background': graphBackground,
  '--glow-strength': appearance.lighting / 100,
  '--node-width':
    appearance.nodeStyle === 'minimal'
      ? '120px'
      : appearance.nodeStyle === 'detailed'
      ? '240px'
      : '180px',
  '--node-padding':
    appearance.nodeStyle === 'minimal'
      ? '8px'
      : appearance.nodeStyle === 'detailed'
      ? '20px'
      : '12px',
  '--node-font-size':
    appearance.nodeStyle === 'minimal'
      ? '11px'
      : appearance.nodeStyle === 'detailed'
      ? '15px'
      : '13px',
} as CSSProperties

  // Selected node information
useEffect(() => {
  setNodes((currentNodes) =>
    currentNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        nodeStyle: appearance.nodeStyle,
      },
    }))
  )
}, [appearance.nodeStyle, setNodes])

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId),
    [nodes, selectedNodeId]
  )

  // Change graph visualization mode

const changeMode = (nextMode: ViewMode) => {
  setMode(nextMode)

  setNodes((currentNodes) => {
    const count = currentNodes.length
    if (count === 0) return currentNodes

    // Tree: preserve the navigation-based layout.
    if (nextMode === 'tree') {
      const sessionEvents = selectedSession
        ? events.filter(
            event => event.sessionId === selectedSession.id
          )
        : []

      const graph = buildNavigationGraph(
        sessionEvents,
        appearance.nodeStyle
      )

      const positions = new Map(
        graph.nodes.map(node => [node.id, node.position])
      )

      return currentNodes.map(node => ({
        ...node,
        position: positions.get(node.id) ?? node.position,
      }))
    }

    // Constellation: arrange webpages around a circle.
    if (nextMode === 'constellation') {
      const radius = Math.max(240, count * 35)

      return currentNodes.map((node, index) => {
        const angle =
          (index / count) * Math.PI * 2 - Math.PI / 2

        return {
          ...node,
          position: {
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
          },
        }
      })
    }

    // Hybrid: compact, staggered arrangement.
    const columns = Math.max(2, Math.ceil(Math.sqrt(count)))

    return currentNodes.map((node, index) => {
      const row = Math.floor(index / columns)
      const column = index % columns

      return {
        ...node,
        position: {
          x: column * 280 + (row % 2) * 110,
          y: row * 210,
        },
      }
    })
  })
}


  // Connect graph nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(connection, currentEdges)
      )
    },
    [setEdges]
  )

  return (
    <div className="app" style={appStyle}>
      {/* Top navigation */}
      <header className="topbar">
        <div className="brand">
          <Orbit size={25} />
          <span>RABBITHOLE</span>
        </div>

        <div className="topbar-right">
          <span className="workspace-label">
            Knowledge Workspace
          </span>

          <button
            className="sidebar-toggle"
            onClick={() => setAppearanceOpen(true)}
            aria-label="Open appearance settings"
          >
            <Settings2 size={19} />
          </button>
        </div>
      </header>

      <div className="workspace">
        {/* Left sidebar */}
        <aside
          className={`sidebar ${
            sidebarOpen ? '' : 'collapsed'
          }`}
        >
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose size={19} />
            ) : (
              <PanelLeftOpen size={19} />
            )}
          </button>

          {sidebarOpen && (
            <>
              <div className="sidebar-section">
                <div className="section-label">
                  WORKSPACE
                 
<button
  className={
    activeView === 'library'
      ? 'nav-item active'
      : 'nav-item'
  }
  onClick={() => setActiveView('library')}
>
  <Library size={18} />
  Library
</button>

<button
  className={
    activeView === 'explorer'
      ? 'nav-item active'
      : 'nav-item'
  }
  onClick={() => setActiveView('explorer')}
>
  <Network size={18} />
  Explorer
</button>

<button
  className="nav-item"
  onClick={() => setAppearanceOpen(true)}
>
  <Palette size={18} />
  Appearance Studio
</button>
 
                </div>

              

<div className="sidebar-section">
  <div className="section-label">
    RABBITHOLES
  </div>

  {sessions.map(item => (
    <button
      key={item.id}
      className={
        selectedSession?.id === item.id
          ? 'nav-item active'
          : 'nav-item'
      }
      onClick={() => {
        setSelectedSessionId(item.id)
        setSelectedNodeId(null)
        setActiveView('explorer')
      }}
    >
      <Search size={18} />
      {item.title}
    </button>
  ))}
</div>


              </div>

              <div className="sidebar-footer">
                RabbitHole · Development Preview
              </div>
            </>
          )}
        </aside>

     
{/* Main Explorer */}
{activeView === 'library' ? (
  <main className="main-content">
    <div className="explorer-header">
      <div>
        <div className="breadcrumb">YOUR RESEARCH</div>
        <h1>RabbitHole Library</h1>
        <p>All your saved browsing sessions in one place.</p>
      </div>
    </div>

    <div style={{ padding: '28px', overflowY: 'auto' }}>
      <h2 style={{ marginBottom: '20px' }}>
        Saved RabbitHoles ({sessions.length})
      </h2>

<label
  className="nav-item"
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    marginBottom: '20px',
    cursor: 'pointer',
  }}
>
  <input
    type="file"
    accept=".json,application/json"
    style={{ display: 'none' }}
    onChange={async event => {
      const file = event.currentTarget.files?.[0]
      if (!file) return

      try {
        const title = await importSession(file)
        window.alert(`Imported "${title}" successfully.`)
      } catch (error) {
        window.alert(
          error instanceof Error
            ? error.message
            : 'Could not import RabbitHole.'
        )
      } finally {
        event.currentTarget.value = ''
      }
    }}
  />
  Import JSON
</label>


      {sessions.length === 0 ? (
        <p>No sessions yet. Start a RabbitHole to begin.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {sessions.map(item => {
            const pageCount = new Set(
              events
                .filter(event => event.sessionId === item.id)
                .map(event => event.url)
            ).size

            return (
              <div
                key={item.id}
                style={{
                  background: '#101b2d',
                  border: '1px solid #25384e',
                  borderRadius: '12px',
                  padding: '20px',
                }}
              >
                <h3>{item.title}</h3>

                <p>
                  {new Date(item.startedAt).toLocaleDateString()}
                </p>

                <p>{pageCount} unique webpages</p>

                <button
                  className="nav-item active"
                  onClick={() => {
                    setSelectedSessionId(item.id)
                    setSelectedNodeId(null)
                    setActiveView('explorer')
                  }}
                >
                  <Network size={18} />
                  
                  Open Explorer
                </button>

                  <button
                    className="nav-item"
                    style={{ marginTop: '10px' }}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Privacy Notice\n\n` +
                        `Your RabbitHole export contains the URLs, page titles, ` +
                        `and timestamps recorded during this session.\n\n` +
                        `Some URLs may contain personal or sensitive information.\n\n` +
                        `Review the JSON file before sharing it with anyone.\n\n` +
                        `Do you want to export "${item.title}"?`
                      )

                      if (confirmed) {
                        exportSession(item, events)
                      }
                    }}
                  >
                    <ExternalLink size={16} />
                    Export JSON
                  </button>



                <button
                  className="nav-item"
                  style={{
                    marginTop: '10px',
                    color: '#f87171',
                  }}
                  onClick={async () => {
                    if (
                      !window.confirm(
                        `Delete "${item.title}" and its browsing history?`
                      )
                    ) {
                      return
                    }

                    try {
                      await deleteSession(item.id)

                      if (selectedSessionId === item.id) {
                        setSelectedSessionId(null)
                        setSelectedNodeId(null)
                      }
                    } catch (error) {
                      window.alert(
                        error instanceof Error
                          ? error.message
                          : 'Could not delete session.'
                      )
                    }
                  }}
                >
                  Delete RabbitHole
                </button>
              </div>
            )
          })}

        </div>
      )}
    </div>
  </main>
) : (
<main className="main-content">
  <div className="explorer-header">
    <div>
      <div className="breadcrumb">
        LIBRARY / COMPUTER SCIENCE
      </div>

      <h1>{selectedSession?.title || 'RabbitHole Explorer'}</h1>

      <p>
        Explore the connections between your discoveries.
      </p>
    </div>


            <div className="session-badge">
              {selectedSession?.active ? 'ACTIVE SESSION' : 'SAVED SESSION'}
            </div>
          </div>

          {/* Visualization switcher */}
          <div className="graph-toolbar">
            <span className="toolbar-label">
              Visualization
            </span>

            <div className="mode-switcher">
              {(
                [
                  'hybrid',
                  'tree',
                  'constellation',
                ] as ViewMode[]
              ).map((view) => (
                <button
                  key={view}
                  className={
                    mode === view
                      ? 'mode-button selected'
                      : 'mode-button'
                  }
                  onClick={() => changeMode(view)}
                >
                  {view === 'hybrid'
                    ? 'Hybrid'
                    : view === 'tree'
                    ? 'Tree'
                    : 'Constellation'}
                </button>
              ))}
            </div>

            <span className="graph-count">
              {nodes.length} nodes · {edges.length} connections
            </span>
          </div>

          {/* Graph canvas */}
          <div className="graph-area">
           
<ReactFlow
  nodeTypes={nodeTypes}
  nodes={nodes}
  edges={edges}
  onNodesChange={onNodesChange}
  onEdgesChange={onEdgesChange}
  onConnect={onConnect}
  onNodeClick={(_, node) =>
    setSelectedNodeId(node.id)
  }
  onPaneClick={() =>
    setSelectedNodeId(null)
  }
  fitView
  fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
>
 <GraphAutoFit
  nodeCount={nodes.length}
  mode={mode}
  sessionId={selectedSession?.id ?? null}
/>
  

{appearance.showGrid && (
  <Background
    color={accentColor}
    gap={24}
    size={1}
  />
)}


  <Controls />
 
<MiniMap
  nodeColor={accentColor}
  nodeStrokeColor={accentColor}
  nodeStrokeWidth={1}
  maskColor="rgba(5, 10, 20, 0.65)"
  bgColor="#0b1220"
  pannable
  zoomable
  style={{
    width: 140,
    height: 90,
    border: '1px solid rgba(100, 150, 200, 0.2)',
    borderRadius: 8,
  }}
/>

</ReactFlow>


            {/* Ambient particles */}
            {appearance.showParticles && (
              <div
                className="ambient-particles"
                aria-hidden="true"
              >
                {Array.from(
                  { length: 18 },
                  (_, index) => (
                    <span key={index} />
                  )
                )}
              </div>
            )}
          </div>
        </main>
        )}  
        {/* Node inspector */}
        {activeView === 'explorer' && (
        <aside className="inspector">
          <div className="inspector-heading">
            NODE INSPECTOR
          </div>

          {selectedNode ? (
            <div className="inspector-content">
              <div className="inspector-icon">
                <Network size={24} />
              </div>

              <h2>
                {String(selectedNode.data.label)}
              </h2>

              <p className="inspector-subtitle">
                Webpage
              </p>

              <div className="inspector-divider" />

              <div className="section-label">
                PAGE URL
              </div>

              <p className="node-url">
                {String(selectedNode.data.url ?? '')}
              </p>

              <a
                className="open-link"
                href={String(
                  selectedNode.data.url ?? '#'
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open webpage
                <ExternalLink size={15} />
              </a>
            </div>
          ) : (
            <div className="inspector-empty">
              <Network size={35} />

              <h3>No node selected</h3>

              <p>
                Click a webpage in the graph to
                inspect its details.
              </p>
            </div>
          )}
        </aside>
        )}


        {/* Appearance Studio panel */}
        {appearanceOpen && (
          <AppearanceStudio
            settings={appearance}
            onChange={setAppearance}
            onClose={() => setAppearanceOpen(false)}
          />
        )}
      </div>
    </div>
  )
}


function RabbitHoleApp() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  )
}

export default RabbitHoleApp

