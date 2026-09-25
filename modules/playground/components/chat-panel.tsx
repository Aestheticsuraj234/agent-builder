"use client";

import { useEffect, useRef, useState } from "react";
import { getLastRunTrace } from "@/modules/playground/actions/get-run-trace";
import { streamAgentRun } from "@/modules/playground/lib/stream-client";
import { useTraceStore } from "@/modules/builder/store/trace-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Input } from "@/components/ui/input";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { FlightCard } from "@/modules/playground/components/widgets/flight-card";
import { Spinner } from "@/components/ui/spinner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tools?: { tool: string; status: string }[];
};

function renderAssistantContent(content: string) {
  const imageMatch = content.match(/IMAGE_URL:(https?\S+)/);
  if (imageMatch) {
    return (
      <div className="space-y-2">
        <img src={imageMatch[1]} alt="Generated" className="max-w-full rounded-lg" />
        <p className="text-muted-foreground text-xs">{content.replace(imageMatch[0], "").trim()}</p>
      </div>
    );
  }

  try {
    const jsonText = content.match(/\{[\s\S]*\}/)?.[0];
    if (jsonText) {
      const json = JSON.parse(jsonText);
      if (json.widget === "flight") {
        return <FlightCard data={json} />;
      }
    }
  } catch {
    // plain text
  }

  return content;
}

export function ChatPanel({
  agentId,
  definition,
  welcomeMessage,
  starterPrompts,
}: {
  agentId: string;
  definition: unknown;
  welcomeMessage?: string;
  starterPrompts?: string[];
}) {
  const [tab, setTab] = useState<"chat" | "trace">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const traceEntries = useTraceStore((s) => s.entries);
  const resetTrace = useTraceStore((s) => s.reset);
  const onNodeStarted = useTraceStore((s) => s.onNodeStarted);
  const onNodeCompleted = useTraceStore((s) => s.onNodeCompleted);
  const onNodeFailed = useTraceStore((s) => s.onNodeFailed);
  const loadHistory = useTraceStore((s) => s.loadHistory);

  useEffect(() => {
    if (!conversationId) return;
    getLastRunTrace(conversationId).then((entries) => {
      if (entries.length) loadHistory(entries);
    });
  }, [conversationId]);

  function handleTraceEvent(event: { type: string; nodeId?: string; nodeType?: string; error?: string }) {
    if (event.type === "node_started" && event.nodeId && event.nodeType) {
      onNodeStarted(event.nodeId, event.nodeType);
    }
    if (event.type === "node_completed" && event.nodeId && event.nodeType) {
      onNodeCompleted(event.nodeId, event.nodeType);
    }
    if (event.type === "node_failed" && event.nodeId && event.nodeType) {
      onNodeFailed(event.nodeId, event.nodeType, event.error ?? "failed");
    }
  }

  async function sendMessage(text: string) {
    if (!text.trim() || isRunning) return;

    setInput("");
    setIsRunning(true);
    resetTrace();
    setTab("trace");

    abortRef.current = new AbortController();

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", tools: [] }]);

    let assistantText = "";
    const tools: { tool: string; status: string }[] = [];

    await streamAgentRun(
      agentId,
      { message: text, conversationId, definition },
      (event) => {
        handleTraceEvent(event);

        if (event.type === "text_delta") {
          assistantText += event.text;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: assistantText, tools: [...tools] };
            return copy;
          });
        }
        if (event.type === "tool_started") {
          tools.push({ tool: event.tool, status: "running" });
        }
        if (event.type === "tool_completed") {
          const t = tools.find((x) => x.tool === event.tool && x.status === "running");
          if (t) t.status = "done";
        }
        if (event.type === "run_completed") {
          setConversationId(event.conversationId);
        }
        if (event.type === "run_failed") {
          assistantText = event.error;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: event.error, tools: [...tools] };
            return copy;
          });
        }
      },
      abortRef.current.signal
    );

    setIsRunning(false);
    abortRef.current = null;
  }

  function stopRun() {
    abortRef.current?.abort();
    setIsRunning(false);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-2 border-b border-border px-4 py-2">
        <Button
          variant={tab === "chat" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("chat")}
        >
          Chat
        </Button>
        <Button
          variant={tab === "trace" ? "default" : "ghost"}
          size="sm"
          onClick={() => setTab("trace")}
        >
          Trace
        </Button>
      </div>

      {tab === "chat" ? (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {welcomeMessage || "Send a message to test your agent."}
                </p>
                {(starterPrompts ?? []).map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                    onClick={() => sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            )}

            <MessageGroup>
              {messages.map((msg, i) => (
                <Message key={i} align={msg.role === "user" ? "end" : "start"}>
                  <MessageContent>
                    <Bubble variant={msg.role === "user" ? "default" : "muted"}>
                      <BubbleContent>
                    {msg.role === "assistant"
                      ? renderAssistantContent(msg.content || (isRunning ? "..." : ""))
                      : msg.content || (isRunning ? "..." : "")}
                  </BubbleContent>
                    </Bubble>
                    {msg.tools && msg.tools.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {msg.tools.map((t, j) => (
                          <Badge key={j} variant="outline">
                            {t.tool} {t.status === "running" ? "…" : "✓"}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </MessageContent>
                </Message>
              ))}
            </MessageGroup>

            {isRunning && <Spinner className="size-4" />}
          </div>

          <form
            className="flex gap-2 border-t border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask your agent..."
              disabled={isRunning}
            />
            {isRunning ? (
              <Button type="button" variant="outline" onClick={stopRun}>
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()}>
                Send
              </Button>
            )}
          </form>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {traceEntries.length === 0 ? (
            <p className="text-muted-foreground text-sm">Send a message to see the workflow trace.</p>
          ) : (
            <div className="space-y-2">
              {traceEntries.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium capitalize">{entry.nodeType}</span>
                    <span className="text-muted-foreground"> ({entry.nodeId})</span>
                  </span>
                  <Badge
                    variant={
                      entry.status === "completed"
                        ? "default"
                        : entry.status === "failed"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {entry.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
