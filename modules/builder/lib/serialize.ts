import type { Edge, Node } from "@xyflow/react";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { defaultDefinition } from "@/modules/agents/lib/definition";
import { getToolLabel } from "./tools-catalog";

type SavedCanvas = {
  nodes: Node[];
  edges: Edge[];
};

export function definitionToCanvas(
  definition: AgentDefinition,
  savedCanvas: SavedCanvas | null
) {
  if (savedCanvas?.nodes?.length) {
    return { nodes: savedCanvas.nodes, edges: savedCanvas.edges ?? [] };
  }

  const nodes: Node[] = [
    {
      id: "agent",
      type: "agent",
      position: { x: 280, y: 220 },
      data: { label: "Agent", instructions: definition.instructions },
    },
    {
      id: "model",
      type: "model",
      position: { x: 280, y: 60 },
      data: { label: "Model", modelId: definition.model.modelId },
    },
  ];

  const edges: Edge[] = [{ id: "e-model-agent", source: "model", target: "agent" }];

  definition.tools.forEach((tool, i) => {
    const id = `tool-${tool.toolId}`;
    nodes.push({
      id,
      type: "tool",
      position: { x: 40, y: 120 + i * 90 },
      data: { label: getToolLabel(tool.toolId), toolId: tool.toolId },
    });
    edges.push({ id: `e-${id}-agent`, source: id, target: "agent" });
  });

  if (definition.memory.enabled) {
    nodes.push({
      id: "memory",
      type: "memory",
      position: { x: 520, y: 220 },
      data: { label: "Memory", enabled: true },
    });
    edges.push({ id: "e-memory-agent", source: "memory", target: "agent" });
  }

  return { nodes, edges };
}

export function canvasToDefinition(nodes: Node[], edges: Edge[]): AgentDefinition {
  const base = defaultDefinition();
  const agentNode = nodes.find((n) => n.type === "agent");
  const modelNode = nodes.find((n) => n.type === "model");
  const memoryNode = nodes.find((n) => n.type === "memory");

  const isConnected = (sourceId: string) =>
    edges.some((e) => e.source === sourceId && e.target === "agent");

  const tools = nodes
    .filter((n) => n.type === "tool" && isConnected(n.id))
    .map((n) => ({ toolId: n.data.toolId as string, config: {} }));

  return {
    schemaVersion: 1,
    instructions: (agentNode?.data.instructions as string) ?? base.instructions,
    model: {
      provider: "openai",
      modelId: (modelNode?.data.modelId as string) ?? base.model.modelId,
    },
    tools,
    memory: { enabled: !!memoryNode && isConnected("memory") },
    limits: base.limits,
  };
}

export function getCanvasJson(nodes: Node[], edges: Edge[]) {
  return { nodes, edges };
}
