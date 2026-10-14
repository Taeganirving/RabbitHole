
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
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


const initialNodes: Node[] = [
  {
    id: '1',
    type: 'rabbit',
    position: { x: 0, y: 150 },
    data: {
      label: 'Google Search',
      url: 'https://google.com',
      nodeStyle: 'balanced',
    },
  },
  {
    id: '2',
    type: 'rabbit',
    position: { x: 250, y: 150 },
    data: {
      label: 'Artificial Intelligence',
      url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
      nodeStyle: 'balanced',
    },
  },
  {
    id: '3',
    type: 'rabbit',
    position: { x: 500, y: 0 },
    data: {
      label: 'Machine Learning',
      url: 'https://en.wikipedia.org/wiki/Machine_learning',
      nodeStyle: 'balanced',
    },
  },
  {
    id: '4',
    type: 'rabbit',
    position: { x: 500, y: 300 },
    data: {
      label: 'Neural Networks',
      url: 'https://en.wikipedia.org/wiki/Neural_network',
      nodeStyle: 'balanced',
    },
  },
]


const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
  },
  {
    id: 'e2-4',
    source: '2',
    target: '4',
    animated: true,
  },
]

const layouts: Record<
  ViewMode,
  Record<string, { x: number; y: number }>
> = {
  hybrid: {
    '1': { x: 0, y: 150 },
    '2': { x: 250, y: 150 },
    '3': { x: 500, y: 0 },
    '4': { x: 500, y: 300 },
  },
  tree: {
    '1': { x: 250, y: 0 },
    '2': { x: 250, y: 150 },
    '3': { x: 100, y: 300 },
    '4': { x: 400, y: 300 },
  },
  constellation: {
    '1': { x: 80, y: 60 },
    '2': { x: 320, y: 200 },
    '3': { x: 560, y: 30 },
    '4': { x: 150, y: 380 },
  },
}

function App() {
  // Graph state
  const [nodes, setNodes, onNodesChange] =
    useNodesState(initialNodes)

  const [edges, setEdges, onEdgesChange] =
    useEdgesState(initialEdges)

  // Interface state
  const [mode, setMode] = useState<ViewMode>('hybrid')

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

    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        position: layouts[nextMode][node.id] ?? node.position,
      }))
    )
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

                <button className="nav-item">
                  <Search size={18} />
                  Exploring Artificial Intelligence
                </button>
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

              <h1>Exploring Artificial Intelligence</h1>

              <p>
                Explore the connections between your discoveries.
              </p>
            </div>

            <div className="session-badge">
              DEMO SESSION
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
            >
              {appearance.showGrid && (
                <Background
                  color={accentColor}
                  gap={24}
                  size={1}
                />
              )}

              <Controls />

              <MiniMap />
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

export default App
