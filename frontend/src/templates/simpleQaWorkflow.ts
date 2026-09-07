import type { StateField } from '@/components/StateDesigner'

export const simpleQaWorkflow = {
  name: "Simple Q&A Bot",
  description: "The smallest useful workflow: ask a question, get an LLM answer",

  stateSchema: [
    {
      name: "question",
      type: "str" as const,
      reducer: "none" as const,
      description: "The question to ask"
    },
    {
      name: "answer",
      type: "str" as const,
      reducer: "none" as const,
      description: "The LLM's answer"
    }
  ] as StateField[],

  nodes: [
    {
      id: "trigger_1",
      type: "trigger",
      position: { x: 100, y: 150 },
      data: {
        label: "Start",
        message: "New question received"
      }
    },
    {
      id: "llm_1",
      type: "llm",
      position: { x: 400, y: 150 },
      data: {
        label: "Answer",
        provider: "google",
        model: "gemini-3.6-flash",
        prompt: "Answer the following question clearly and concisely:\n\n{{question}}",
        output_key: "answer"
      }
    },
    {
      id: "output_1",
      type: "output",
      position: { x: 700, y: 150 },
      data: {
        label: "Final Answer",
        format: "text"
      }
    }
  ],

  edges: [
    { id: "e1", source: "trigger_1", target: "llm_1", type: "smoothstep" },
    { id: "e2", source: "llm_1", target: "output_1", type: "smoothstep" }
  ]
}
