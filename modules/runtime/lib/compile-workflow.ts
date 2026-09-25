import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import type { BuilderDefinition } from "@/modules/workflows/lib/schema";
import { builderToAgentDefinition } from "@/modules/workflows/lib/migrate-v1";
import { runAgentNode } from "./run-agent-node";
import type { RunEvent } from "./run-agent";
import { validateGraph } from "./validate-graph";

const WorkflowState = Annotation.Root({
  userMessage: Annotation<string>,
  history: Annotation<{ role: string; content: string }[]>,
  output: Annotation<string>,
  stepCount: Annotation<number>,
});

export type WorkflowContext = {
  userId: string;
  onEvent: (event: RunEvent) => void;
};

export function compileWorkflow(def: BuilderDefinition, ctx: WorkflowContext) {
  validateGraph(def);

  const builder = new StateGraph(WorkflowState);

  for (const node of def.nodes) {
    if (node.type === "start") {
      builder.addNode(node.id, async (state) => ({
        stepCount: (state.stepCount ?? 0) + 1,
        userMessage: state.userMessage,
        history: state.history,
      }));
    }

    if (node.type === "agent") {
      builder.addNode(node.id, async (state) => {
        if ((state.stepCount ?? 0) >= def.limits.maxGraphSteps) {
          throw new Error("Too many workflow steps");
        }

        const agentNodeDef = def.nodes.find((n) => n.type === "agent");
        const skillIds =
          agentNodeDef?.type === "agent" ? agentNodeDef.config.skillIds ?? [] : [];

        let agentDef = builderToAgentDefinition(def);
        if (skillIds.length) {
          const { applySkillsToAgent } = await import("@/modules/skills/lib/apply-skills");
          agentDef = await applySkillsToAgent(agentDef, ctx.userId, skillIds);
        }

        const text = await runAgentNode(
          agentDef,
          state.history ?? [],
          state.userMessage,
          ctx.userId,
          ctx.onEvent
        );

        return {
          output: text,
          stepCount: (state.stepCount ?? 0) + 1,
        };
      });
    }

    if (node.type === "end") {
      builder.addNode(node.id, async (state) => ({
        output: state.output ?? "",
        stepCount: (state.stepCount ?? 0) + 1,
      }));
    }
  }

  for (const edge of def.edges) {
    builder.addEdge(edge.source as any, edge.target as any);
  }

  const startNode = def.nodes.find((n) => n.type === "start")!;
  const endNode = def.nodes.find((n) => n.type === "end")!;

  builder.addEdge(START, startNode.id as any);
  builder.addEdge(endNode.id as any, END);

  return builder.compile();
}
