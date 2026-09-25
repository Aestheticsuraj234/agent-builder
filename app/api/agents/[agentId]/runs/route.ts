import { headers } from "next/headers";
import prisma from "@/lib/db";
import { auth } from "@/modules/auth/lib/auth";
import { getDefinitionByVersion } from "@/modules/agents/actions/publish";
import { runWorkflowStream } from "@/modules/runtime/lib/run-workflow";

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
  const publishedVersion = body.publishedVersion as number | undefined;
  let definition = body.definition;

  if (publishedVersion) {
    const pinned = await getDefinitionByVersion(agentId, publishedVersion);
    if (pinned) definition = pinned;
  }

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
        publishedVersion: publishedVersion ?? null,
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

  const run = await prisma.agentRun.create({
    data: {
      conversationId: conversation.id,
      agentId,
      userId: session.user.id,
      status: "running",
    },
  });

  const toolEvents: any[] = [];
  let assistantText = "";
  let eventSeq = 0;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: unknown) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      async function logEvent(eventType: string, payload: any) {
        eventSeq++;
        await prisma.runEvent.create({
          data: {
            runId: run.id,
            sequence: eventSeq,
            eventType,
            payload: payload as any,
          },
        });
      }

      try {
        assistantText = await runWorkflowStream(
          definition,
          history,
          message,
          session.user.id,
          async (event) => {
            if (event.type === "text_delta") {
              send(event);
              await logEvent("text_delta", event);
            }
            if (event.type === "tool_started") {
              toolEvents.push({ ...event, status: "started" });
              send(event);
              await logEvent("tool_started", event);
            }
            if (event.type === "tool_completed") {
              toolEvents.push({ ...event, status: "completed" });
              send(event);
              await logEvent("tool_completed", event);
            }
            if (event.type === "node_started") {
              send(event);
              await logEvent("node_started", event);
              await prisma.nodeExecution.create({
                data: {
                  runId: run.id,
                  nodeId: event.nodeId,
                  nodeType: event.nodeType,
                  status: "running",
                },
              });
            }
            if (event.type === "node_completed") {
              send(event);
              await logEvent("node_completed", event);
              await prisma.nodeExecution.updateMany({
                where: { runId: run.id, nodeId: event.nodeId, status: "running" },
                data: { status: "completed" },
              });
            }
            if (event.type === "node_failed") {
              send(event);
              await logEvent("node_failed", event);
              await prisma.nodeExecution.updateMany({
                where: { runId: run.id, nodeId: event.nodeId, status: "running" },
                data: { status: "failed", error: event.error },
              });
            }
            if (event.type === "run_failed") {
              send(event);
              await logEvent("run_failed", event);
            }
          }
        );

        await prisma.message.create({
          data: {
            conversationId: conversation!.id,
            role: "assistant",
            content: assistantText || "No response",
            toolEvents,
          },
        });

        await prisma.agentRun.update({
          where: { id: run.id },
          data: { status: "completed" },
        });

        send({ type: "run_completed", conversationId: conversation!.id, runId: run.id });
      } catch (err: any) {
        await prisma.agentRun.update({
          where: { id: run.id },
          data: { status: "failed" },
        });
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
