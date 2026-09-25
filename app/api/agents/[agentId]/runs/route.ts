import { headers } from "next/headers";
import prisma from "@/lib/db";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { auth } from "@/modules/auth/lib/auth";
import { runAgentStream } from "@/modules/runtime/lib/run-agent";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ agentId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { agentId } = await params;
  const body = await req.json();
  const message = body.message as string;
  const conversationId = body.conversationId as string | undefined;
  const definition = body.definition as AgentDefinition;

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: session.user.id },
  });

  if (!agent) {
    return new Response("Not found", { status: 404 });
  }

  let conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.user.id, agentId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      })
    : null;

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        agentId,
        title: message.slice(0, 60),
      },
      include: { messages: true },
    });
  }

  const history = conversation.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      role: "user",
      content: message,
    },
  });

  const toolEvents: any[] = [];
  let assistantText = "";

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        assistantText = await runAgentStream(definition, history, message, (event) => {
          if (event.type === "text_delta") {
            send(event);
          }
          if (event.type === "tool_started") {
            toolEvents.push({ ...event, status: "started" });
            send(event);
          }
          if (event.type === "tool_completed") {
            toolEvents.push({ ...event, status: "completed" });
            send(event);
          }
          if (event.type === "run_failed") {
            send(event);
          }
        });

        await prisma.message.create({
          data: {
            conversationId: conversation!.id,
            role: "assistant",
            content: assistantText || "No response",
            toolEvents,
          },
        });

        send({ type: "run_completed", conversationId: conversation!.id });
      } catch (err: any) {
        send({ type: "run_failed", error: err?.message ?? "Run failed" });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
