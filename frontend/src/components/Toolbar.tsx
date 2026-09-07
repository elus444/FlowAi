import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Save, Play, Download, Code, Settings, Database, Lightbulb, GitBranch, ArrowLeft, Undo2, Redo2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/store/workflowStore'
import { useExecutionStore } from '@/store/executionStore'
import { useAuthStore } from '@/stores/authStore'
import { executionApi } from '@/services/api'
import { toast } from '@/store/toastStore'
import { confirmDialog } from '@/store/confirmStore'
import InputFormModal from './InputFormModal'
import OutputViewer from './OutputViewer'
import StateDesigner from './StateDesigner'
import StateInspector from './StateInspector'
import { exampleWorkflow } from '@/templates/exampleWorkflow'
import { conditionalWorkflow } from '@/templates/conditionalWorkflow'

export default function Toolbar() {
  const navigate = useNavigate()
  const {
    nodes,
    edges,
    stateSchema,
    setNodes,
    setEdges,
    setStateSchema,
    name,
    setName,
    saveWorkflow,
    isSaving,
    lastSaved,
    currentWorkflowId,
    pushHistory,
    undo,
    redo,
    past,
    future
  } = useWorkflowStore()

  const {
    startExecution,
    setNodeStatus,
    addLog,
    completeExecution,
    resetExecution
  } = useExecutionStore()

  const [showInputForm, setShowInputForm] = useState(false)
  const [showOutputViewer, setShowOutputViewer] = useState(false)
  const [showStateDesigner, setShowStateDesigner] = useState(false)
  const [showStateInspector, setShowStateInspector] = useState(false)
  const [currentExecutionData, setCurrentExecutionData] = useState<any>(null)
  const [executionStateHistory] = useState<Array<{
    nodeId: string
    nodeName: string
    timestamp: string
    stateSnapshot: Record<string, any>
  }>>([])

  // Execute workflow mutation
  const executeMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkflowId) {
        throw new Error('Please save the workflow first')
      }

      if (nodes.length === 0) {
        throw new Error('Workflow is empty. Add some nodes first.')
      }

      // Auto-save before execution
      await saveWorkflow()

      console.log('Creating execution...')
      return executionApi.create({
        workflow_id: currentWorkflowId,
        input_data: {},
      })
    },
    onSuccess: (execution) => {
      console.log('Execution created:', execution)
      handleExecutionStart(execution)
    },
    onError: (error: any) => {
      console.error('Execution error:', error)
      toast.error('Failed to execute workflow: ' + error.message)
    },
  })

  const handleExecutionStart = (execution: any) => {
    // Start visual execution tracking
    resetExecution()
    startExecution(execution.id)

    // Subscribe to execution updates
    executionApi.subscribeToExecution(execution.id, {
      onStatus: (status) => {
        console.log('📊 Execution status:', status)
      },
      onLog: (log) => {
        console.log('📝 Execution log:', log)
        addLog(log)

        // Update node status based on log messages
        if (log.node_id) {
          const message = log.message.toLowerCase()

          if (message.includes('executing node') || message.includes('⏳')) {
            setNodeStatus(log.node_id, 'running')
          } else if (message.includes('node completed') || message.includes('✅')) {
            setNodeStatus(log.node_id, 'completed')
          } else if (message.includes('node failed') || message.includes('❌') || log.level === 'error') {
            setNodeStatus(log.node_id, 'failed')
          }
        }
      },
      onComplete: (data) => {
        console.log('✅ Execution complete:', data)
        completeExecution()

        // Store execution data for output viewer
        setCurrentExecutionData({
          id: execution.id,
          status: data.status,
          output_data: data.output || data.output_data,
          completed_at: new Date().toISOString(),
        })

        // Show output viewer
        setShowOutputViewer(true)
      },
      onError: (error) => {
        console.error('Execution error:', error)
        completeExecution()
        toast.error('Execution failed: ' + error)
      },
    })
  }

  const handleExecute = () => {
    if (!currentWorkflowId) {
      toast.warning('Please save the workflow first before executing.')
      return
    }

    if (nodes.length === 0) {
      toast.warning('Workflow is empty. Add some nodes first.')
      return
    }

    // Show input form modal
    setShowInputForm(true)
  }

  const executeWithInputData = async (inputData: Record<string, any>) => {
    setShowInputForm(false)

    try {
      // Auto-save before execution
      await saveWorkflow()

      const execution = await executionApi.create({
        workflow_id: currentWorkflowId!,
        input_data: inputData,
      })

      handleExecutionStart(execution)
    } catch (error: any) {
      console.error('Failed to create execution:', error)
      toast.error('Failed to start execution: ' + error.message)
    }
  }

  const handleExport = () => {
    const data = {
      name,
      nodes,
      edges,
      stateSchema,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${name.replace(/\s+/g, '_')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCode = async () => {
    if (!currentWorkflowId) {
      toast.warning('Please save the workflow first.')
      return
    }

    try {
      const token = useAuthStore.getState().token
      const response = await fetch(`/api/v1/workflows/${currentWorkflowId}/compile`, {
        headers: {
          'Authorization': `Bearer ${token || ''}`
        }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Compilation failed')
      }

      const result = await response.json()

      const blob = new Blob([result.code], { type: 'text/x-python' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${name.replace(/\s+/g, '_')}_langgraph.py`
      a.click()
      URL.revokeObjectURL(url)

      toast.success('LangGraph code exported successfully.')
    } catch (error) {
      console.error('Export code failed:', error)
      toast.error('Failed to export code: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleLoadExample = async () => {
    if (nodes.length > 0) {
      const ok = await confirmDialog({
        message: 'This will replace your current workflow. Continue?',
        confirmLabel: 'Replace',
        danger: true,
      })
      if (!ok) return
    }
    // One snapshot before the whole batch, so undo restores the prior
    // graph in a single step instead of unwinding nodes/edges/schema
    // as three separate history entries.
    pushHistory()
    setNodes(exampleWorkflow.nodes)
    setEdges(exampleWorkflow.edges)
    setStateSchema(exampleWorkflow.stateSchema)
    setName(exampleWorkflow.name)
  }

  const handleLoadConditionalExample = async () => {
    if (nodes.length > 0) {
      const ok = await confirmDialog({
        message: 'This will replace your current workflow. Continue?',
        confirmLabel: 'Replace',
        danger: true,
      })
      if (!ok) return
    }
    pushHistory()
    setNodes(conditionalWorkflow.nodes)
    setEdges(conditionalWorkflow.edges)
    setStateSchema(conditionalWorkflow.stateSchema)
    setName(conditionalWorkflow.name)
  }

  // Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z (or Ctrl+Y) to redo, Ctrl/Cmd+S to
  // save -- skipped while typing in an input/textarea/contenteditable so
  // e.g. undoing a text edit in the workflow name field still works
  // natively instead of popping the graph history stack.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      const mod = e.ctrlKey || e.metaKey
      if (!mod) return

      if (!isTyping && e.key.toLowerCase() === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      } else if (!isTyping && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        undo()
      } else if (!isTyping && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveWorkflow().catch(() => {})
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, saveWorkflow])

  return (
    <>
      {/* This row has ~13 interactive elements -- on a phone that's wider
          than the screen no matter how it's spaced. overflow-x-auto keeps
          it a horizontally-scrollable strip instead of forcing the whole
          page into horizontal scroll (shrink-0 on both halves so they
          scroll as a unit rather than getting visually squashed first). */}
      <div className="h-16 bg-white border-b border-gray-200 px-4 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => navigate('/workflows')}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Back to Workflows"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex flex-col">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-bold text-gray-900 border-none focus:ring-0 p-0 text-lg"
              placeholder="Workflow Name"
            />
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {isSaving ? (
                <span className="text-blue-600">Saving...</span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Unsaved changes</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleLoadExample}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-md hover:bg-yellow-100 border border-yellow-200"
          >
            <Lightbulb className="w-4 h-4" />
            Basic
          </button>
          <button
            onClick={handleLoadConditionalExample}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 border border-orange-200"
          >
            <GitBranch className="w-4 h-4" />
            Conditional
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <button
            onClick={() => undo()}
            disabled={past.length === 0}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => redo()}
            disabled={future.length === 0}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <button
            onClick={() => setShowStateDesigner(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            <Settings className="w-4 h-4" />
            Schema
            {stateSchema.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                {stateSchema.length}
              </span>
            )}
          </button>

          <button
            onClick={() => saveWorkflow()}
            disabled={isSaving}
            title="Save (Ctrl+S)"
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Save
          </button>

          <button
            onClick={handleExecute}
            disabled={executeMutation.isPending}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Run
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2" />

          <button
            onClick={handleExportCode}
            disabled={!currentWorkflowId}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-50"
            title="Export Code"
          >
            <Code className="w-4 h-4" />
          </button>

          <button
            onClick={handleExport}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            title="Export JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowStateInspector(true)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-md"
            title="State Inspector"
          >
            <Database className="w-4 h-4" />
          </button>
        </div>
      </div>

      <InputFormModal
        isOpen={showInputForm}
        onClose={() => setShowInputForm(false)}
        onExecute={executeWithInputData}
      />

      <OutputViewer
        isOpen={showOutputViewer}
        onClose={() => setShowOutputViewer(false)}
        executionData={currentExecutionData}
      />

      <StateDesigner
        isOpen={showStateDesigner}
        onClose={() => setShowStateDesigner(false)}
        fields={stateSchema}
        onSave={(fields) => {
          pushHistory()
          setStateSchema(fields)
        }}
      />

      <StateInspector
        isOpen={showStateInspector}
        onClose={() => setShowStateInspector(false)}
        currentState={currentExecutionData?.output_data || {}}
        executionHistory={executionStateHistory}
      />
    </>
  )
}
