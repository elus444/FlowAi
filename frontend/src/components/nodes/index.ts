import TriggerNode from './TriggerNode'
import LLMNode from './LLMNode'
import APINode from './APINode'
import MCPNode from './MCPNode'
import ConditionalNode from './ConditionalNode'
import OutputNode from './OutputNode'
import DatasetNode from './DatasetNode'

export const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  api: APINode,
  mcp: MCPNode,
  conditional: ConditionalNode,
  output: OutputNode,
  dataset: DatasetNode,
}

export {
  TriggerNode,
  LLMNode,
  APINode,
  MCPNode,
  ConditionalNode,
  OutputNode,
  DatasetNode,
}
