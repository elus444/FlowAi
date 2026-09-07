// Shared node-id counter. Both the drag-and-drop path (WorkflowCanvas's
// onDrop) and the tap-to-add path (Dashboard's onAddNode, for touch
// devices where native HTML5 drag doesn't fire) create nodes -- they need
// to share one counter or two different code paths could both hand out
// e.g. "trigger_1" and collide.
const nodeCounters: Record<string, number> = {}

export function getNodeId(type: string): string {
  if (!nodeCounters[type]) {
    nodeCounters[type] = 1
  }
  const id = `${type}_${nodeCounters[type]}`
  nodeCounters[type]++
  return id
}

export function getNodeCount(type: string): number {
  return nodeCounters[type] ? nodeCounters[type] - 1 : 0
}

// Naive capitalize (type.charAt(0).toUpperCase() + type.slice(1)) turns
// "llm" into "Llm" and "api" into "Api" instead of the acronyms everyone
// actually calls them -- override just those two, capitalize everything
// else normally.
const SPECIAL_CASE_LABELS: Record<string, string> = {
  llm: 'LLM',
  api: 'API',
}

export function getNodeTypeLabel(type: string): string {
  return SPECIAL_CASE_LABELS[type] ?? (type.charAt(0).toUpperCase() + type.slice(1))
}
