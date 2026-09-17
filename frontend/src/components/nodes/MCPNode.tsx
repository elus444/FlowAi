import { memo } from 'react'
import { NodeProps } from 'reactflow'
import { Plug } from 'lucide-react'
import BaseNode from './BaseNode'

const MCPNode = memo((props: NodeProps) => {
  return (
    <BaseNode
      {...props}
      icon={<Plug className="w-4 h-4 text-teal-600" />}
      color="border-teal-500"
    />
  )
})

MCPNode.displayName = 'MCPNode'

export default MCPNode
