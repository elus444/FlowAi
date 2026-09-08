import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Info } from 'lucide-react'
import { toast } from '@/store/toastStore'

export interface StateField {
  name: string
  type: 'str' | 'int' | 'float' | 'bool' | 'list' | 'dict' | 'Any'
  reducer?: 'none' | 'add' | 'add_messages' | 'custom'
  customReducer?: string
  defaultValue?: string
  description?: string
}

interface StateDesignerProps {
  isOpen: boolean
  onClose: () => void
  fields: StateField[]
  onSave: (fields: StateField[]) => void
}

export default function StateDesigner({ isOpen, onClose, fields: initialFields, onSave }: StateDesignerProps) {
  const [fields, setFields] = useState<StateField[]>(initialFields)
  const [showHelp, setShowHelp] = useState(false)

  // Sync local state with prop changes (when workflow is loaded)
  useEffect(() => {
    setFields(initialFields)
  }, [initialFields])

  if (!isOpen) return null

  const addField = () => {
    setFields([
      ...fields,
      {
        name: `field_${fields.length + 1}`,
        type: 'str',
        reducer: 'none',
        description: ''
      }
    ])
  }

  const updateField = (index: number, key: keyof StateField, value: any) => {
    const updated = [...fields]
    updated[index] = { ...updated[index], [key]: value }
    setFields(updated)
  }

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Validate fields
    const errors: string[] = []

    fields.forEach((field, index) => {
      if (!field.name || field.name.trim() === '') {
        errors.push(`Field ${index + 1}: Name is required`)
      }
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field.name)) {
        errors.push(`Field ${index + 1}: Invalid name (use letters, numbers, underscores)`)
      }
    })

    // Check for duplicate names
    const names = fields.map(f => f.name)
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index)
    if (duplicates.length > 0) {
      errors.push(`Duplicate field names: ${duplicates.join(', ')}`)
    }

    if (errors.length > 0) {
      toast.error('Validation errors:\n' + errors.join('\n'))
      return
    }

    onSave(fields)
    onClose()
  }

  const getTypeDescription = (type: string) => {
    const descriptions = {
      str: 'Text/string value',
      int: 'Integer number',
      float: 'Decimal number',
      bool: 'True/False value',
      list: 'List/array of items',
      dict: 'Dictionary/object',
      Any: 'Any type (flexible)'
    }
    return descriptions[type as keyof typeof descriptions] || ''
  }

  const getReducerDescription = (reducer: string) => {
    const descriptions = {
      none: 'Replace old value with new value',
      add: 'Concatenate lists, sum numbers, or combine strings',
      add_messages: 'Smart message list merging (LangGraph built-in)',
      custom: 'Custom reducer function (advanced)'
    }
    return descriptions[reducer as keyof typeof descriptions] || ''
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold">State Schema Designer</h2>
            <p className="text-sm text-slate-500 mt-1">
              Define the state structure for your LangGraph workflow
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="p-2 hover:bg-white/10 rounded"
              title="Help"
            >
              <Info className="w-5 h-5 text-slate-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Help Panel */}
        {showHelp && (
          <div className="px-6 py-4 bg-emerald-400/10 border-b border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 State Schema Guide</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>State</strong> is shared data that flows through all nodes</li>
              <li>• Each node receives the state and returns updates</li>
              <li>• <strong>Reducers</strong> control how updates merge (replace vs combine)</li>
              <li>• For chat apps, use <code className="bg-blue-100 px-1 rounded">messages</code> field with <code className="bg-blue-100 px-1 rounded">add_messages</code> reducer</li>
              <li>• Keep state minimal - only what nodes actually need</li>
            </ul>
          </div>
        )}

        {/* Fields List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {fields.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-lg font-medium">No state fields defined</p>
              <p className="text-sm mt-2">Click "Add Field" to create your first state field</p>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-lg p-4 hover:border-emerald-400/40 transition-colors"
                >
                  {/* Field Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 grid grid-cols-2 gap-3">
                      {/* Field Name */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Field Name *
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          placeholder="e.g., messages, user_id"
                        />
                      </div>

                      {/* Field Type */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Type *
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                          <option value="str">String (str)</option>
                          <option value="int">Integer (int)</option>
                          <option value="float">Float (float)</option>
                          <option value="bool">Boolean (bool)</option>
                          <option value="list">List (list)</option>
                          <option value="dict">Dictionary (dict)</option>
                          <option value="Any">Any type (Any)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                          {getTypeDescription(field.type)}
                        </p>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={() => removeField(index)}
                      className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Remove field"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Reducer */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Reducer (How to merge updates)
                    </label>
                    <select
                      value={field.reducer || 'none'}
                      onChange={(e) => updateField(index, 'reducer', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      <option value="none">None (Replace)</option>
                      <option value="add">Add (Concatenate/Sum)</option>
                      <option value="add_messages">Add Messages (LangGraph)</option>
                      <option value="custom">Custom Function</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {getReducerDescription(field.reducer || 'none')}
                    </p>
                  </div>

                  {/* Custom Reducer (if selected) */}
                  {field.reducer === 'custom' && (
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Custom Reducer Function
                      </label>
                      <textarea
                        value={field.customReducer || ''}
                        onChange={(e) => updateField(index, 'customReducer', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        rows={3}
                        placeholder="def my_reducer(current, new):&#10;    return current + new"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Python function: takes (current_value, new_value), returns merged_value
                      </p>
                    </div>
                  )}

                  {/* Default Value */}
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Default Value (Optional)
                    </label>
                    <input
                      type="text"
                      value={field.defaultValue || ''}
                      onChange={(e) => updateField(index, 'defaultValue', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder={
                        field.type === 'list' ? '[]' :
                        field.type === 'dict' ? '{}' :
                        field.type === 'str' ? '""' :
                        field.type === 'int' || field.type === 'float' ? '0' :
                        field.type === 'bool' ? 'False' : ''
                      }
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={field.description || ''}
                      onChange={(e) => updateField(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      placeholder="What this field is used for..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-white/[0.03]">
          <button
            onClick={addField}
            className="flex items-center gap-2 px-4 py-2 border border-blue-600 text-emerald-400 rounded-md hover:bg-emerald-400/10"
          >
            <Plus className="w-4 h-4" />
            Add Field
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-white/10 rounded-md hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-400 text-slate-950 rounded-md hover:bg-emerald-300"
            >
              Save State Schema
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
