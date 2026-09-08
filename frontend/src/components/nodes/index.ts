import TriggerNode from './TriggerNode'
import LLMNode from './LLMNode'
import APINode from './APINode'
import ConditionalNode from './ConditionalNode'
import OutputNode from './OutputNode'
import DatasetNode from './DatasetNode'

export const nodeTypes = {
  trigger: TriggerNode,
  llm: LLMNode,
  api: APINode,
  conditional: ConditionalNode,
  output: OutputNode,
  dataset: DatasetNode,
}

export {
  TriggerNode,
  LLMNode,
  APINode,
  ConditionalNode,
  OutputNode,
  DatasetNode,
}
