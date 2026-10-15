
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRabbitHoleData } from './hooks/useRabbitHoleData'
import { buildNavigationGraph } from './utils/buildNavigationGraph'


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
  Network,
  Palette,
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


function GraphAutoFit({ nodeCount }: { nodeCount: number }) {
  const { fitView } = useReactFlow()

  useEffect(() => {
    if (nodeCount === 0) return

    const frame = requestAnimationFrame(() => {
      void fitView({
        padding: 0.3,
        maxZoom: 1.2,
        duration: 500,
      })
    })

    return () => cancelAnimationFrame(frame)
  }, [nodeCount, fitView])

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

  setNodes(graph.nodes)
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

    return currentNodes.map((node, index) => {
      let x = 0
      let y = 0

      if (nextMode === 'tree') {
        const columns = Math.max(1, Math.ceil(Math.sqrt(count)))
        x = (index % columns) * 260
        y = Math.floor(index / columns) * 190
      } else if (nextMode === 'constellation') {
        const angle = (index / Math.max(count, 1)) * Math.PI * 2
        const radius = Math.max(180, count * 28)

        x = Math.cos(angle) * radius
        y = Math.sin(angle) * radius
      } else {
        x = (index % 4) * 260
        y = Math.floor(index / 4) * 190
      }

      return {
        ...node,
        position: { x, y },
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
                </div>

                
              <button className="nav-item">
               <Library size={18} />
               Library
              </button>


                <button className="nav-item active">
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
    }}
  >
    <Search size={18} />
    {item.title}
  </button>
))}

              </div>

              <div className="sidebar-footer">
                RabbitHole · Development Preview
              </div>
            </>
          )}
        </aside>

     
{/* Main Explorer */}
<main className="main-content">
  <div className="explorer-header">
    <div>
      <div className="breadcrumb">
        LIBRARY / COMPUTER SCIENCE
      </div>

      <h1>{session?.title || 'RabbitHole Explorer'}</h1>

      <p>
        Explore the connections between your discoveries.
      </p>
    </div>


            <div className="session-badge">
              {session?.active ? 'ACTIVE SESSION' : 'SAVED SESSION'}
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
  <GraphAutoFit nodeCount={nodes.length} />

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

        {/* Node inspector */}
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

