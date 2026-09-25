export type StreamEvent =
  | { type: "text_delta"; text: string }
  | { type: "tool_started"; tool: string; input: unknown }
  | { type: "tool_completed"; tool: string; output: string }
  | { type: "node_started"; nodeId: string; nodeType: string }
  | { type: "node_completed"; nodeId: string; nodeType: string }
  | { type: "node_failed"; nodeId: string; nodeType: string; error: string }
  | { type: "run_completed"; conversationId: string; runId?: string }
  | { type: "run_failed"; error: string };

export async function streamAgentRun(
  agentId: string,
  body: { message: string; conversationId?: string; definition: unknown },
  onEvent: (event: StreamEvent) => void,
  signal?: AbortSignal
) {
  const res = await fetch(`/api/agents/${agentId}/runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    onEvent({ type: "run_failed", error: "Request failed" });
    return;
  }

  const reader = res.body?.getReader();
  if (!reader) return;

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    if (signal?.aborted) {
      reader.cancel();
      break;
    }

    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const event = JSON.parse(line.slice(6)) as StreamEvent;
      onEvent(event);
    }
  }
}
