import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Database } from 'lucide-react'
import BaseNode from './BaseNode'

// Dataset nodes exist in the palette and backend but had no custom visual
// component here -- ReactFlow silently falls back to its own bare default
// node styling (white box, black border) for any type missing from
// nodeTypes, which stood out badly once the canvas went dark.
const DatasetNode = memo((props: NodeProps) => {
  return (
    <BaseNode
      {...props}
      icon={<Database className="w-4 h-4 text-indigo-600" />}
      color="border-indigo-500"
    />
  )
})

DatasetNode.displayName = 'DatasetNode'

export default DatasetNode
