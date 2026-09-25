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
            outputFormat: "text",
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
            outputFormat: "text",
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
  {
    id: "routed-travel",
    name: "Routed Travel Helper",
    description: "Classifier routes flight vs itinerary questions.",
    icon: "travel",
    welcomeMessage: "Ask about flights or trip planning.",
    starterPrompts: ["SFO to Tokyo flights", "Plan a day in Tokyo"],
    definition: {
      schemaVersion: 2,
      entryNodeId: "start",
      nodes: [
        { id: "start", type: "start", label: "Start" },
        {
          id: "classifier",
          type: "agent",
          config: {
            label: "Classifier",
            instructions:
              "Classify the user message as a flight search question or a general itinerary planning question.",
            modelId: "gpt-4o-mini",
            tools: [],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
            outputFormat: "json",
            jsonHint:
              'Respond with JSON only like {"classification":"flight"} or {"classification":"itinerary"}. Use "flight" for flight/airfare/route questions. Use "itinerary" for activities, weather, or day planning.',
          },
        },
        {
          id: "router",
          type: "condition",
          config: {
            label: "Route",
            sourceNodeId: "classifier",
            field: "classification",
            equals: "flight",
          },
        },
        {
          id: "flight",
          type: "agent",
          config: {
            label: "Flight Agent",
            instructions:
              "You help find flight options. Search the web and summarize routes, airlines, and rough prices. Do not book tickets.",
            modelId: "gpt-4o-mini",
            tools: [{ toolId: "web_search", config: {} }],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
            inputBinding: { kind: "nodeOutput", nodeId: "classifier" },
            outputFormat: "text",
          },
        },
        {
          id: "itinerary",
          type: "agent",
          config: {
            label: "Itinerary Agent",
            instructions:
              "You plan travel itineraries with weather and simple budget math.",
            modelId: "gpt-4o-mini",
            tools: [
              { toolId: "weather", config: {} },
              { toolId: "calculator", config: {} },
            ],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
            inputBinding: { kind: "nodeOutput", nodeId: "classifier" },
            outputFormat: "text",
          },
        },
        { id: "end", type: "end", label: "End" },
      ],
      edges: [
        { id: "e-start-classifier", source: "start", target: "classifier" },
        { id: "e-classifier-router", source: "classifier", target: "router" },
        { id: "e-router-flight", source: "router", target: "flight", sourceHandle: "true" },
        { id: "e-router-itinerary", source: "router", target: "itinerary", sourceHandle: "false" },
        { id: "e-flight-end", source: "flight", target: "end" },
        { id: "e-itinerary-end", source: "itinerary", target: "end" },
      ],
      memory: { enabled: false },
      limits: { maxGraphSteps: 12, maxToolCalls: 8, timeoutMs: 120000 },
      bindings: [],
    },
  },
];

export function getWorkflowTemplate(id: string) {
  return workflowTemplates.find((t) => t.id === id);
}
