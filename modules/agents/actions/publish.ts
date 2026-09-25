"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";

export async function publishAgent(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.id },
  });

  if (!agent) throw new Error("Agent not found");

  const last = await prisma.agentVersion.findFirst({
    where: { agentId },
    orderBy: { version: "desc" },
  });

  const version = (last?.version ?? 0) + 1;

  return prisma.agentVersion.create({
    data: {
      agentId,
      version,
      definition: agent.draftDefinition as any,
    },
  });
}

export async function getPublishedAgent(agentId: string) {
  const version = await prisma.agentVersion.findFirst({
    where: { agentId },
    orderBy: { version: "desc" },
    include: { agent: true },
  });

  return version;
}
