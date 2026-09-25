import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { runAgentNode } from "./run-agent-node";

export type RunEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_started"; tool: string; input: unknown }
  | { type: "tool_completed"; tool: string; output: string }
  | { type: "run_failed"; error: string };

export async function runAgentStream(
  definition: AgentDefinition,
  history: { role: string; content: string }[],
  userMessage: string,
  userId: string,
  onEvent: (event: RunEvent) => void
) {
  return runAgentNode(definition, history, userMessage, userId, onEvent);
}
