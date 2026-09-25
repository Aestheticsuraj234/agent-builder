"use client";

import { useState } from "react";
import { streamAgentRun } from "@/modules/playground/lib/stream-client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Input } from "@/components/ui/input";
import { Message, MessageContent, MessageGroup } from "@/components/ui/message";
import { Spinner } from "@/components/ui/spinner";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  tools?: { tool: string; status: string }[];
};

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string>();
  const [isRunning, setIsRunning] = useState(false);

  async function sendMessage(text: string) {
    if (!text.trim() || isRunning) return;

    setInput("");
    setIsRunning(true);

    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg, { role: "assistant", content: "", tools: [] }]);

    let assistantText = "";
    const tools: { tool: string; status: string }[] = [];

    await streamAgentRun(
      agentId,
      { message: text, conversationId, definition },
      (event) => {
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
      }
    );

    setIsRunning(false);
  }

  return (
    <div className="flex h-full flex-col">
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
                  <BubbleContent>{msg.content || (isRunning ? "..." : "")}</BubbleContent>
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
        <Button type="submit" disabled={isRunning || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
