import { z } from "zod";

export const toolConfigSchema = z.object({
  toolId: z.string(),
  config: z.record(z.string(), z.unknown()).default({}),
});

export type ToolConfig = z.infer<typeof toolConfigSchema>;

export const githubConfigSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  defaultPrNumber: z.string(),
});

export type GithubConfig = z.infer<typeof githubConfigSchema>;

export const agentNodeConfigSchema = z.object({
  label: z.string().default("Main agent"),
  instructions: z.string(),
  modelId: z.string(),
  tools: z.array(toolConfigSchema).default([]),
  github: githubConfigSchema.optional(),
  mcpConnectionIds: z.array(z.string()).default([]),
});

export type AgentNodeConfig = z.infer<typeof agentNodeConfigSchema>;

export const builderNodeSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string(),
    type: z.literal("start"),
    label: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    type: z.literal("agent"),
    config: agentNodeConfigSchema,
  }),
  z.object({
    id: z.string(),
    type: z.literal("end"),
    label: z.string().optional(),
  }),
]);

export type BuilderNode = z.infer<typeof builderNodeSchema>;

export const executionEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export type ExecutionEdge = z.infer<typeof executionEdgeSchema>;

export const builderDefinitionSchema = z.object({
  schemaVersion: z.literal(2),
  entryNodeId: z.string(),
  nodes: z.array(builderNodeSchema),
  edges: z.array(executionEdgeSchema),
  memory: z.object({ enabled: z.boolean() }),
  limits: z.object({
    maxGraphSteps: z.number(),
    maxToolCalls: z.number(),
    timeoutMs: z.number(),
  }),
  bindings: z.array(z.unknown()).default([]),
});

export type BuilderDefinition = z.infer<typeof builderDefinitionSchema>;

export function defaultBuilderDefinition(
  partial?: Partial<AgentNodeConfig>
): BuilderDefinition {
  const agentConfig: AgentNodeConfig = {
    label: partial?.label ?? "Main agent",
    instructions: partial?.instructions ?? "You are a helpful assistant.",
    modelId: partial?.modelId ?? "gpt-4o-mini",
    tools: partial?.tools ?? [],
    github: partial?.github ?? { owner: "", repo: "", defaultPrNumber: "" },
    mcpConnectionIds: partial?.mcpConnectionIds ?? [],
  };

  return {
    schemaVersion: 2,
    entryNodeId: "start",
    nodes: [
      { id: "start", type: "start", label: "Start" },
      { id: "agent", type: "agent", config: agentConfig },
      { id: "end", type: "end", label: "End" },
    ],
    edges: [
      { id: "e-start-agent", source: "start", target: "agent" },
      { id: "e-agent-end", source: "agent", target: "end" },
    ],
    memory: { enabled: false },
    limits: { maxGraphSteps: 10, maxToolCalls: 5, timeoutMs: 60000 },
    bindings: [],
  };
}
