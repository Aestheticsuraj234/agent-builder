"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

export async function listAgentRuns(agentId: string) {
  const user = await requireAuth();

  return prisma.agentRun.findMany({
    where: { agentId, userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      conversation: { select: { title: true } },
      nodeExecutions: { orderBy: { createdAt: "asc" } },
    },
    take: 50,
  });
}

export async function getAgentRun(runId: string) {
  const user = await requireAuth();

  return prisma.agentRun.findFirst({
    where: { id: runId, userId: user.id },
    include: {
      nodeExecutions: { orderBy: { createdAt: "asc" } },
      events: { orderBy: { sequence: "asc" } },
      conversation: true,
    },
  });
}
