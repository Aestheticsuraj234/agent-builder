import type { Edge, Node } from "@xyflow/react";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import type { AgentNodeConfig, BuilderDefinition } from "@/modules/workflows/lib/schema";
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

function flowDataFromAgentConfig(config: AgentNodeConfig, memoryEnabled: boolean) {
  return {
    label: config.label,
    instructions: config.instructions,
    modelId: config.modelId,
    tools: config.tools,
    github: config.github ?? { owner: "", repo: "", defaultPrNumber: "" },
    mcpConnectionIds: config.mcpConnectionIds ?? [],
    skillIds: config.skillIds ?? [],
    inputBinding: config.inputBinding,
    memoryEnabled,
  };
}

function flowNodeFromBuilderNode(
  node: BuilderDefinition["nodes"][number],
  position: { x: number; y: number },
  memoryEnabled: boolean
): Node | null {
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
    return {
      id: node.id,
      type: "agent",
      position,
      data: flowDataFromAgentConfig(node.config, memoryEnabled),
    };
  }

  return null;
}

function agentConfigFromFlowData(data: Record<string, unknown>): AgentNodeConfig {
  return {
    label: (data.label as string) ?? "Agent",
    instructions: (data.instructions as string) ?? "You are a helpful assistant.",
    modelId: (data.modelId as string) ?? "gpt-4o-mini",
    tools: (data.tools as AgentNodeConfig["tools"]) ?? [],
    github: (data.github as AgentNodeConfig["github"]) ?? {
      owner: "",
      repo: "",
      defaultPrNumber: "",
    },
    mcpConnectionIds: (data.mcpConnectionIds as string[]) ?? [],
    skillIds: (data.skillIds as string[]) ?? [],
    inputBinding: data.inputBinding as AgentNodeConfig["inputBinding"],
  };
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
    const agentConfigs = new Map<string, AgentNodeConfig>();
    for (const n of definition.nodes) {
      if (n.type === "agent") agentConfigs.set(n.id, n.config);
    }

    const nodes = savedCanvas!.nodes.map((n) => {
      if (n.type === "agent") {
        const config = agentConfigs.get(n.id);
        if (config) {
          return {
            ...n,
            data: flowDataFromAgentConfig(config, definition.memory.enabled),
          };
        }
      }
      return n;
    });

    return { nodes, edges: savedCanvas!.edges ?? [] };
  }

  let y = 40;
  const nodes: Node[] = [];

  for (const node of definition.nodes) {
    const flowNode = flowNodeFromBuilderNode(node, { x: 280, y }, definition.memory.enabled);
    if (flowNode) {
      nodes.push(flowNode);
      y += 140;
    }
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

  const builderNodes: BuilderDefinition["nodes"] = nodes
    .map((n) => {
      if (n.type === "start") {
        return {
          id: n.id,
          type: "start" as const,
          label: (n.data.label as string) ?? "Start",
        };
      }
      if (n.type === "end") {
        return {
          id: n.id,
          type: "end" as const,
          label: (n.data.label as string) ?? "End",
        };
      }
      if (n.type === "agent") {
        return {
          id: n.id,
          type: "agent" as const,
          config: agentConfigFromFlowData(n.data as Record<string, unknown>),
        };
      }
      return null;
    })
    .filter(Boolean) as BuilderDefinition["nodes"];

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

  const startNode = nodes.find((n) => n.type === "start");
  const anyAgent = nodes.find((n) => n.type === "agent");
  const memoryFromNode = anyAgent?.data.memoryEnabled as boolean | undefined;

  return {
    schemaVersion: 2,
    entryNodeId: startNode?.id ?? "start",
    nodes: builderNodes.length ? builderNodes : base.nodes,
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

export function getUpstreamAgentNodes(nodes: Node[], edges: Edge[], currentId: string) {
  const result: Node[] = [];
  let current = edges.find((e) => e.target === currentId)?.source;

  while (current) {
    const node = nodes.find((n) => n.id === current);
    if (!node) break;
    if (node.type === "agent" && node.id !== currentId) {
      result.unshift(node);
    }
    current = edges.find((e) => e.target === current)?.source;
  }

  return result;
}
