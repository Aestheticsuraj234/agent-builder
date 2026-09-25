import type { Edge, Node } from "@xyflow/react";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { defaultDefinition } from "@/modules/agents/lib/definition";
import type { BuilderDefinition } from "./schema";
import { defaultBuilderDefinition } from "./schema";

export function isV1Definition(raw: unknown): raw is AgentDefinition {
  return (
    typeof raw === "object" &&
    raw !== null &&
    (raw as AgentDefinition).schemaVersion === 1
  );
}

export function isV1Canvas(nodes: { type?: string }[]) {
  if (!nodes.length) return false;
  if (nodes.some((n) => n.type === "start")) return false;
  return nodes.some(
    (n) => n.type === "model" || n.type === "tool" || n.type === "memory" || n.type === "agent"
  );
}

export function migrateV1ToV2(v1: AgentDefinition): BuilderDefinition {
  const base = defaultBuilderDefinition({
    instructions: v1.instructions,
    modelId: v1.model.modelId,
    tools: v1.tools,
    github: v1.github ?? { owner: "", repo: "", defaultPrNumber: "" },
  });

  return {
    ...base,
    memory: v1.memory,
    limits: {
      maxGraphSteps: 10,
      maxToolCalls: v1.limits.maxToolCalls,
      timeoutMs: v1.limits.timeoutMs,
    },
  };
}

export function builderToAgentDefinition(builder: BuilderDefinition): AgentDefinition {
  const base = defaultDefinition();
  const agentNode = builder.nodes.find((n) => n.type === "agent");

  if (!agentNode || agentNode.type !== "agent") {
    return base;
  }

  const config = agentNode.config;

  return {
    schemaVersion: 1,
    instructions: config.instructions,
    model: { provider: "openai", modelId: config.modelId },
    tools: config.tools,
    memory: builder.memory,
    limits: {
      maxToolCalls: builder.limits.maxToolCalls,
      timeoutMs: builder.limits.timeoutMs,
    },
    github: config.github ?? { owner: "", repo: "", defaultPrNumber: "" },
    mcpConnectionIds: config.mcpConnectionIds ?? [],
    skillIds: config.skillIds ?? [],
  };
}

export function migrateV1CanvasToV2(
  nodes: Node[],
  edges: Edge[],
  fallback?: AgentDefinition
): BuilderDefinition {
  const base = fallback ? migrateV1ToV2(fallback) : defaultBuilderDefinition();
  const agentNode = nodes.find((n) => n.type === "agent");
  const modelNode = nodes.find((n) => n.type === "model");
  const memoryNode = nodes.find((n) => n.type === "memory");

  const isConnected = (sourceId: string) =>
    edges.some((e) => e.source === sourceId && e.target === "agent");

  const tools = nodes
    .filter((n) => n.type === "tool" && isConnected(n.id))
    .map((n) => ({
      toolId: n.data.toolId as string,
      config: n.data.isCustom ? (n.data.config as Record<string, unknown>) : {},
    }));

  const defaultAgent = base.nodes.find((n) => n.type === "agent");
  if (defaultAgent?.type !== "agent") return base;

  defaultAgent.config = {
    label: (agentNode?.data.label as string) ?? defaultAgent.config.label,
    instructions:
      (agentNode?.data.instructions as string) ?? defaultAgent.config.instructions,
    modelId:
      (modelNode?.data.modelId as string) ?? defaultAgent.config.modelId,
    tools: tools.length ? tools : defaultAgent.config.tools,
    github:
      (agentNode?.data.github as AgentDefinition["github"]) ??
      defaultAgent.config.github,
    mcpConnectionIds: defaultAgent.config.mcpConnectionIds ?? [],
    skillIds: defaultAgent.config.skillIds ?? [],
  };

  base.memory.enabled = !!memoryNode && isConnected("memory");

  return base;
}

export function loadBuilderDefinition(raw: unknown): BuilderDefinition {
  if (isV1Definition(raw)) {
    return migrateV1ToV2(raw);
  }

  if (
    typeof raw === "object" &&
    raw !== null &&
    (raw as BuilderDefinition).schemaVersion === 2
  ) {
    return raw as BuilderDefinition;
  }

  return defaultBuilderDefinition();
}
