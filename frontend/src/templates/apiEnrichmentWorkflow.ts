import type { StateField } from '@/components/StateDesigner'

export const apiEnrichmentWorkflow = {
  name: "API + LLM Enrichment",
  description: "Fetch data from an HTTP API, then have an LLM summarize or interpret it",

  stateSchema: [
    {
      name: "api_response",
      type: "dict" as const,
      reducer: "none" as const,
      description: "Raw response from the API call"
    },
    {
      name: "summary",
      type: "str" as const,
      reducer: "none" as const,
      description: "LLM summary of the API response"
    }
  ] as StateField[],

  nodes: [
    {
      id: "trigger_1",
      type: "trigger",
      position: { x: 100, y: 150 },
      data: {
        label: "Start",
        message: "Fetching and summarizing data"
      }
    },
    {
      id: "api_1",
      type: "api",
      position: { x: 380, y: 150 },
      data: {
        label: "Fetch Data",
        url: "https://api.example.com/endpoint",
        method: "GET",
        output_key: "api_response"
      }
    },
    {
      id: "llm_1",
      type: "llm",
      position: { x: 660, y: 150 },
      data: {
        label: "Summarize",
        provider: "google",
        model: "gemini-3.6-flash",
        prompt: "Summarize the key points from this API response in plain language:\n\n{{api_response}}",
        output_key: "summary"
      }
    },
    {
      id: "output_1",
      type: "output",
      position: { x: 940, y: 150 },
      data: {
        label: "Final Summary",
        format: "text"
      }
    }
  ],

  edges: [
    { id: "e1", source: "trigger_1", target: "api_1", type: "smoothstep" },
    { id: "e2", source: "api_1", target: "llm_1", type: "smoothstep" },
    { id: "e3", source: "llm_1", target: "output_1", type: "smoothstep" }
  ]
}
