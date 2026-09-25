import type { BuilderDefinition } from "@/modules/workflows/lib/schema";

export type WorkflowTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  welcomeMessage: string;
  starterPrompts: string[];
  definition: BuilderDefinition;
};

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "research-writer",
    name: "Research → Writer",
    description: "Research a topic, then write a polished summary.",
    icon: "web-research",
    welcomeMessage: "Ask me to research and write about any topic.",
    starterPrompts: ["Research and write about quantum computing basics"],
    definition: {
      schemaVersion: 2,
      entryNodeId: "start",
      nodes: [
        { id: "start", type: "start", label: "Start" },
        {
          id: "research",
          type: "agent",
          config: {
            label: "Research Agent",
            instructions:
              "You are a research assistant. Search the web, gather key facts, and produce clear notes with sources.",
            modelId: "gpt-4o-mini",
            tools: [
              { toolId: "web_search", config: {} },
              { toolId: "read_webpage", config: {} },
            ],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
          },
        },
        {
          id: "writer",
          type: "agent",
          config: {
            label: "Writer Agent",
            instructions:
              "You are a writing assistant. Turn the research notes into a clear, engaging article for a general audience.",
            modelId: "gpt-4o-mini",
            tools: [],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
            inputBinding: { kind: "nodeOutput", nodeId: "research" },
          },
        },
        { id: "end", type: "end", label: "End" },
      ],
      edges: [
        { id: "e-start-research", source: "start", target: "research" },
        { id: "e-research-writer", source: "research", target: "writer" },
        { id: "e-writer-end", source: "writer", target: "end" },
      ],
      memory: { enabled: false },
      limits: { maxGraphSteps: 10, maxToolCalls: 5, timeoutMs: 120000 },
      bindings: [],
    },
  },
];

export function getWorkflowTemplate(id: string) {
  return workflowTemplates.find((t) => t.id === id);
}
