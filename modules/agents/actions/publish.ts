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

  const versionRecord = await prisma.agentVersion.create({
    data: {
      agentId,
      version,
      definition: agent.draftDefinition as any,
      canvas: agent.canvas as any,
    },
  });

  await prisma.agent.update({
    where: { id: agentId },
    data: { publishedVersionId: versionRecord.id },
  });

  return versionRecord;
}

export async function unpublishAgent(agentId: string) {
  const user = await requireAuth();

  await prisma.agent.updateMany({
    where: { id: agentId, userId: user.id },
    data: { publishedVersionId: null },
  });
}

export async function getPublishedAgent(agentId: string) {
  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { publishedVersion: true },
  });

  if (!agent?.publishedVersion) return null;

  return {
    version: agent.publishedVersion.version,
    definition: agent.publishedVersion.definition,
    canvas: agent.publishedVersion.canvas,
    agent,
  };
}

export async function getPublishedAgentForOwner(agentId: string) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.id },
    include: { publishedVersion: true },
  });

  if (!agent?.publishedVersion) return null;

  return {
    version: agent.publishedVersion.version,
    definition: agent.publishedVersion.definition,
    canvas: agent.publishedVersion.canvas,
    agent,
  };
}

export async function getDefinitionByVersion(agentId: string, version: number) {
  const record = await prisma.agentVersion.findFirst({
    where: { agentId, version },
  });

  return record?.definition ?? null;
}
