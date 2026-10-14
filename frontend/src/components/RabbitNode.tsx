
import { memo } from 'react'
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import { Globe, ExternalLink } from 'lucide-react'

export type RabbitNodeStyle = 'minimal' | 'balanced' | 'detailed'

export type RabbitNodeData = {
  label: string
  url: string
  nodeStyle: RabbitNodeStyle
}

export type RabbitFlowNode = Node<RabbitNodeData, 'rabbit'>

function RabbitNode({ data, selected }: NodeProps<RabbitFlowNode>) {
  let domain = 'Unknown website'

  try {
    domain = new URL(data.url).hostname.replace(/^www\./, '')
  } catch {
    // Keep the fallback domain
  }

  return (
    <div className={`rabbit-node rabbit-node--${data.nodeStyle} ${selected ? 'rabbit-node--selected' : ''}`}>
      <Handle type="target" position={Position.Left} />

      <div className="rabbit-node__header">
        <Globe size={15} />
        <span className="rabbit-node__title">{data.label}</span>
      </div>

      {data.nodeStyle !== 'minimal' && (
        <div className="rabbit-node__domain">{domain}</div>
      )}

      {data.nodeStyle === 'detailed' && (
        <div className="rabbit-node__details">
          <span>Webpage</span>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="nodrag nopan"
            aria-label={`Open ${data.label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <ExternalLink size={14} />
          </a>
        </div>
      )}

      <Handle type="source" position={Position.Right} />
    </div>
  )
}

export default memo(RabbitNode)
