import type { Edge, Node } from "@xyflow/react";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import type { BuilderDefinition } from "@/modules/workflows/lib/schema";
import { defaultBuilderDefinition } from "@/modules/workflows/lib/schema";
import {
  builderToAgentDefinition,
  isV1Canvas,
  isV1Definition,
  loadBuilderDefinition,
  migrateV1CanvasToV2,
} from "@/modules/workflows/lib/migrate-v1";
import { getToolLabel } from "./tools-catalog";

type SavedCanvas = {
  nodes: Node[];
  edges: Edge[];
};

const DEFAULT_POSITIONS = {
  start: { x: 280, y: 40 },
  agent: { x: 280, y: 180 },
  end: { x: 280, y: 340 },
};

function builderNodeToFlowNode(
  builder: BuilderDefinition,
  nodeId: string,
  position: { x: number; y: number }
): Node | null {
  const node = builder.nodes.find((n) => n.id === nodeId);
  if (!node) return null;

  if (node.type === "start") {
    return {
      id: node.id,
      type: "start",
      position,
      data: { label: node.label ?? "Start" },
    };
  }

  if (node.type === "end") {
    return {
      id: node.id,
      type: "end",
      position,
      data: { label: node.label ?? "End" },
    };
  }

  if (node.type === "agent") {
    const config = node.config;
    return {
      id: node.id,
      type: "agent",
      position,
      data: {
        label: config.label,
        instructions: config.instructions,
        modelId: config.modelId,
        tools: config.tools,
        github: config.github ?? { owner: "", repo: "", defaultPrNumber: "" },
        memoryEnabled: builder.memory.enabled,
      },
    };
  }

  return null;
}

export function definitionToCanvas(
  definition: BuilderDefinition,
  savedCanvas: SavedCanvas | null
) {
  const useSaved =
    savedCanvas?.nodes?.length &&
    !isV1Canvas(savedCanvas.nodes) &&
    savedCanvas.nodes.some((n) => n.type === "start");

  if (useSaved) {
    const agentNode = definition.nodes.find((n) => n.type === "agent");
    const agentConfig =
      agentNode?.type === "agent" ? agentNode.config : null;

    const nodes = savedCanvas!.nodes.map((n) => {
      if (n.type === "agent" && agentConfig) {
        return {
          ...n,
          data: {
            label: agentConfig.label,
            instructions: agentConfig.instructions,
            modelId: agentConfig.modelId,
            tools: agentConfig.tools,
            github: agentConfig.github ?? { owner: "", repo: "", defaultPrNumber: "" },
            memoryEnabled: definition.memory.enabled,
          },
        };
      }
      return n;
    });

    return { nodes, edges: savedCanvas!.edges ?? [] };
  }

  const nodes: Node[] = [];
  for (const [id, pos] of Object.entries(DEFAULT_POSITIONS)) {
    const flowNode = builderNodeToFlowNode(definition, id, pos);
    if (flowNode) nodes.push(flowNode);
  }

  const edges: Edge[] = definition.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    animated: true,
  }));

  return { nodes, edges };
}

export function canvasToBuilderDefinition(
  nodes: Node[],
  edges: Edge[],
  opts?: { memoryEnabled?: boolean; limits?: BuilderDefinition["limits"] }
): BuilderDefinition {
  const base = defaultBuilderDefinition();
  const memoryEnabled = opts?.memoryEnabled;
  const limits = opts?.limits ?? base.limits;
  const defaultAgent = base.nodes.find((n) => n.type === "agent")!;
  const defaultConfig = defaultAgent.type === "agent" ? defaultAgent.config : null;

  const startNode = nodes.find((n) => n.type === "start");
  const agentFlowNode = nodes.find((n) => n.type === "agent");
  const endNode = nodes.find((n) => n.type === "end");

  const agentConfig = {
    label: (agentFlowNode?.data.label as string) ?? defaultConfig?.label ?? "Main agent",
    instructions:
      (agentFlowNode?.data.instructions as string) ??
      defaultConfig?.instructions ??
      "You are a helpful assistant.",
    modelId:
      (agentFlowNode?.data.modelId as string) ?? defaultConfig?.modelId ?? "gpt-4o-mini",
    tools: (agentFlowNode?.data.tools as { toolId: string; config: Record<string, unknown> }[]) ??
      defaultConfig?.tools ??
      [],
    github: (agentFlowNode?.data.github as {
      owner: string;
      repo: string;
      defaultPrNumber: string;
    }) ??
      defaultConfig?.github ?? { owner: "", repo: "", defaultPrNumber: "" },
  };

  const builderNodes: BuilderDefinition["nodes"] = [
    {
      id: startNode?.id ?? "start",
      type: "start",
      label: (startNode?.data.label as string) ?? "Start",
    },
    { id: agentFlowNode?.id ?? "agent", type: "agent", config: agentConfig },
    {
      id: endNode?.id ?? "end",
      type: "end",
      label: (endNode?.data.label as string) ?? "End",
    },
  ];

  let builderEdges = edges
    .filter((e) => {
      const ids = new Set(builderNodes.map((n) => n.id));
      return ids.has(e.source) && ids.has(e.target);
    })
    .map((e) => ({ id: e.id, source: e.source, target: e.target }));

  if (builderEdges.length === 0) {
    builderEdges = [
      { id: "e-start-agent", source: "start", target: "agent" },
      { id: "e-agent-end", source: "agent", target: "end" },
    ];
  }

  const memoryFromNode = agentFlowNode?.data.memoryEnabled as boolean | undefined;

  return {
    schemaVersion: 2,
    entryNodeId: startNode?.id ?? "start",
    nodes: builderNodes,
    edges: builderEdges,
    memory: { enabled: memoryEnabled ?? memoryFromNode ?? base.memory.enabled },
    limits,
    bindings: [],
  };
}

export function canvasToAgentDefinition(
  nodes: Node[],
  edges: Edge[],
  opts?: { memoryEnabled?: boolean; limits?: BuilderDefinition["limits"] }
): AgentDefinition {
  return builderToAgentDefinition(canvasToBuilderDefinition(nodes, edges, opts));
}

export function loadCanvasFromDraft(
  draftDefinition: unknown,
  savedCanvas: SavedCanvas | null
) {
  let builder = loadBuilderDefinition(draftDefinition);

  if (savedCanvas?.nodes?.length && isV1Canvas(savedCanvas.nodes)) {
    const fallback = isV1Definition(draftDefinition) ? draftDefinition : undefined;
    builder = migrateV1CanvasToV2(savedCanvas.nodes, savedCanvas.edges ?? [], fallback);
    return definitionToCanvas(builder, null);
  }

  return definitionToCanvas(builder, savedCanvas);
}

export function getCanvasJson(nodes: Node[], edges: Edge[]) {
  return { nodes, edges };
}

export function getAgentToolBadges(tools: { toolId: string; config?: unknown }[]) {
  return tools.map((t) => getToolLabel(t.toolId, t.config));
}
