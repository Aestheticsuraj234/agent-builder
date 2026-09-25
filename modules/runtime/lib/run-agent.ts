import { ChatOpenAI } from "@langchain/openai";
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
  ToolMessage,
  type BaseMessage,
} from "@langchain/core/messages";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { getToolsForAgent } from "@/modules/tools/lib/registry";

export type RunEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_started"; tool: string; input: unknown }
  | { type: "tool_completed"; tool: string; output: string }
  | { type: "run_failed"; error: string };

export async function runAgentStream(
  definition: AgentDefinition,
  history: { role: string; content: string }[],
  userMessage: string,
  onEvent: (event: RunEvent) => void
) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    onEvent({ type: "run_failed", error: "Add OPENAI_API_KEY to .env" });
    return "";
  }

  const tools = getToolsForAgent(definition);
  const model = new ChatOpenAI({
    model: definition.model.modelId,
    apiKey,
  });

  const modelWithTools = tools.length > 0 ? model.bindTools(tools) : model;

  const messages: BaseMessage[] = [
    new SystemMessage(definition.instructions),
    ...history.map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
    ),
    new HumanMessage(userMessage),
  ];

  let toolCallCount = 0;

  while (true) {
    const response = await modelWithTools.invoke(messages);
    messages.push(response);

    const toolCalls = response.tool_calls ?? [];

    if (toolCalls.length === 0) {
      const text = String(response.content ?? "");
      onEvent({ type: "text_delta", text });
      return text;
    }

    for (const call of toolCalls) {
      toolCallCount++;

      if (toolCallCount > definition.limits.maxToolCalls) {
        onEvent({ type: "run_failed", error: "Too many tool calls" });
        return "";
      }

      onEvent({ type: "tool_started", tool: call.name, input: call.args });

      const matchedTool = tools.find((t) => t.name === call.name);
      let output = "Tool not found";

      if (matchedTool) {
        try {
          output = String(await matchedTool.invoke(call.args));
        } catch (err: any) {
          output = err?.message ?? "Tool failed";
        }
      }

      onEvent({ type: "tool_completed", tool: call.name, output });

      messages.push(
        new ToolMessage({
          content: output,
          tool_call_id: call.id ?? call.name,
        })
      );
    }
  }
}
