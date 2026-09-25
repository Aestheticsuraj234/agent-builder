import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { BuilderDefinition } from "@/modules/workflows/lib/schema";
import { agentConfigToDefinition } from "@/modules/workflows/lib/migrate-v1";
import { evaluateCondition } from "./evaluate-condition";
import { runAgentNode } from "./run-agent-node";
import type { RunEvent } from "./run-agent";
import { validateGraph } from "./validate-graph";

const WorkflowState = Annotation.Root({
  userMessage: Annotation<string>,
  history: Annotation<{ role: string; content: string }[]>,
  output: Annotation<string>,
  outputs: Annotation<Record<string, string>>,
  decisions: Annotation<Record<string, string>>,
  stepCount: Annotation<number>,
});

export type WorkflowContext = {
  userId: string;
  onEvent: (event: RunEvent) => void;
};

function wrapNode(
  nodeId: string,
  nodeType: string,
  onEvent: (event: RunEvent) => void,
  fn: (state: any) => Promise<any>
) {
  return async (state: any) => {
    onEvent({ type: "node_started", nodeId, nodeType });
    try {
      const result = await fn(state);
      onEvent({ type: "node_completed", nodeId, nodeType });
      return result;
    } catch (err: any) {
      onEvent({
        type: "node_failed",
        nodeId,
        nodeType,
        error: err?.message ?? "Node failed",
      });
      throw err;
    }
  };
}

function getConditionTargets(def: BuilderDefinition, conditionId: string) {
  const trueEdge = def.edges.find(
    (e) => e.source === conditionId && e.sourceHandle === "true"
  );
  const falseEdge = def.edges.find(
    (e) => e.source === conditionId && e.sourceHandle === "false"
  );
  return { true: trueEdge?.target, false: falseEdge?.target };
}

export function compileWorkflow(def: BuilderDefinition, ctx: WorkflowContext) {
  validateGraph(def);

  const builder = new StateGraph(WorkflowState);
  const conditionIds = new Set(
    def.nodes.filter((n) => n.type === "condition").map((n) => n.id)
  );

  for (const node of def.nodes) {
    if (node.type === "start") {
      builder.addNode(
        node.id,
        wrapNode(node.id, "start", ctx.onEvent, async (state) => ({
          stepCount: (state.stepCount ?? 0) + 1,
          userMessage: state.userMessage,
          history: state.history,
          outputs: state.outputs ?? {},
          decisions: state.decisions ?? {},
        }))
      );
    }

    if (node.type === "agent") {
      const agentNode = node;

      builder.addNode(
        node.id,
        wrapNode(node.id, "agent", ctx.onEvent, async (state) => {
          if ((state.stepCount ?? 0) >= def.limits.maxGraphSteps) {
            throw new Error("Too many workflow steps");
          }

          const config = agentNode.config;
          let stepInput = state.userMessage;

          if (config.inputBinding?.kind === "nodeOutput") {
            stepInput =
              state.outputs?.[config.inputBinding.nodeId] ?? state.userMessage;
          }

          let agentDef = agentConfigToDefinition(config, def);

          if (config.outputFormat === "json" && config.jsonHint) {
            agentDef = {
              ...agentDef,
              instructions: `${agentDef.instructions}\n\n${config.jsonHint}`,
            };
          }

          if (config.skillIds?.length) {
            const { applySkillsToAgent } = await import("@/modules/skills/lib/apply-skills");
            agentDef = await applySkillsToAgent(agentDef, ctx.userId, config.skillIds);
          }

          const text = await runAgentNode(
            agentDef,
            state.history ?? [],
            stepInput,
            ctx.userId,
            ctx.onEvent
          );

          return {
            output: text,
            outputs: { ...(state.outputs ?? {}), [node.id]: text },
            stepCount: (state.stepCount ?? 0) + 1,
          };
        })
      );
    }

    if (node.type === "condition") {
      const config = node.config;

      builder.addNode(
        node.id,
        wrapNode(node.id, "condition", ctx.onEvent, async (state) => {
          const raw = state.outputs?.[config.sourceNodeId] ?? "";
          const pass = evaluateCondition(raw, config.field, config.equals);
          const branch = pass ? "true" : "false";

          return {
            decisions: { ...(state.decisions ?? {}), [node.id]: branch },
            stepCount: (state.stepCount ?? 0) + 1,
          };
        })
      );
    }

    if (node.type === "end") {
      builder.addNode(
        node.id,
        wrapNode(node.id, "end", ctx.onEvent, async (state) => ({
          output: state.output ?? "",
          stepCount: (state.stepCount ?? 0) + 1,
        }))
      );
    }
  }

  for (const edge of def.edges) {
    if (conditionIds.has(edge.source)) continue;
    builder.addEdge(edge.source as any, edge.target as any);
  }

  for (const node of def.nodes) {
    if (node.type !== "condition") continue;
    const targets = getConditionTargets(def, node.id);
    if (targets.true && targets.false) {
      builder.addConditionalEdges(
        node.id as any,
        (state: any) => state.decisions?.[node.id] ?? "false",
        {
          true: targets.true as any,
          false: targets.false as any,
        }
      );
    }
  }

  const startNode = def.nodes.find((n) => n.type === "start")!;
  const endNode = def.nodes.find((n) => n.type === "end")!;

  builder.addEdge(START, startNode.id as any);
  builder.addEdge(endNode.id as any, END);

  return builder.compile();
}
