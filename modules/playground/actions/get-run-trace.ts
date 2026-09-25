"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

export async function getLastRunTrace(conversationId: string) {
  const user = await requireAuth();

  const run = await prisma.agentRun.findFirst({
    where: { conversationId, userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { nodeExecutions: { orderBy: { createdAt: "asc" } } },
  });

  if (!run) return [];

  return run.nodeExecutions.map((n) => ({
    nodeId: n.nodeId,
    nodeType: n.nodeType,
    status: n.status as "running" | "completed" | "failed",
    error: n.error || undefined,
    at: n.createdAt.getTime(),
  }));
}
