import { MessageSquare, Globe, Sparkles, GitBranch } from 'lucide-react'
import { simpleQaWorkflow } from './simpleQaWorkflow'
import { apiEnrichmentWorkflow } from './apiEnrichmentWorkflow'
import { exampleWorkflow } from './exampleWorkflow'
import { conditionalWorkflow } from './conditionalWorkflow'

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  icon: typeof MessageSquare
  nodes: any[]
  edges: any[]
  stateSchema: any[]
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'simple-qa',
    icon: MessageSquare,
    ...simpleQaWorkflow,
  },
  {
    id: 'api-enrichment',
    icon: Globe,
    ...apiEnrichmentWorkflow,
  },
  {
    id: 'research-assistant',
    icon: Sparkles,
    ...exampleWorkflow,
  },
  {
    id: 'support-router',
    icon: GitBranch,
    ...conditionalWorkflow,
  },
]
