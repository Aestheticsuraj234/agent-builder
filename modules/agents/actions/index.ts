"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";
import { defaultDefinition } from "@/modules/agents/lib/definition";
import { getTemplate } from "@/modules/agents/lib/templates";

export async function listAgents() {
  const user = await requireAuth();

  return prisma.agent.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
  });
}

export async function fetchAgent(agentId: string) {
  const user = await requireAuth();

  return prisma.agent.findFirst({
    where: { id: agentId, userId: user.id },
  });
}

export async function createBlankAgent() {
  const user = await requireAuth();

  return prisma.agent.create({
    data: {
      userId: user.id,
      name: "Untitled Agent",
      draftDefinition: defaultDefinition() as any,
    },
  });
}

export async function createFromTemplate(templateId: string) {
  const user = await requireAuth();
  const template = getTemplate(templateId);

  if (!template) {
    throw new Error("Template not found");
  }

  return prisma.agent.create({
    data: {
      userId: user.id,
      templateId: template.id,
      name: template.name,
      description: template.description,
      icon: template.icon,
      welcomeMessage: template.welcomeMessage,
      starterPrompts: template.starterPrompts,
      draftDefinition: template.definition as any,
    },
  });
}

export async function deleteAgent(agentId: string) {
  const user = await requireAuth();

  await prisma.agent.deleteMany({
    where: { id: agentId, userId: user.id },
  });
}

export async function updateAgent(
  agentId: string,
  data: {
    name?: string;
    description?: string;
    instructions?: string;
  }
) {
  const user = await requireAuth();

  const agent = await prisma.agent.findFirst({
    where: { id: agentId, userId: user.id },
  });

  if (!agent) {
    throw new Error("Agent not found");
  }

  const draftDefinition = agent.draftDefinition as ReturnType<typeof defaultDefinition>;

  return prisma.agent.update({
    where: { id: agentId },
    data: {
      name: data.name ?? agent.name,
      description: data.description ?? agent.description,
      draftDefinition: (data.instructions
        ? { ...draftDefinition, instructions: data.instructions }
        : draftDefinition) as any,
    },
  });
}
