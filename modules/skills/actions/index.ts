"use server";

import prisma from "@/lib/db";
import { requireAuth } from "@/modules/auth/actions";
import { listAllBuiltinSkills } from "@/modules/skills/lib/apply-skills";

export async function listSkills() {
  const user = await requireAuth();

  const custom = await prisma.skill.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const builtins = listAllBuiltinSkills().map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    instructions: s.instructions,
    toolIds: s.toolIds,
    mcpConnectionIds: s.mcpConnectionIds,
    starterPrompts: s.starterPrompts,
    builtin: true,
    userId: user.id,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  }));

  return [...builtins, ...custom.map((s) => ({ ...s, builtin: false }))];
}

export async function createSkill(data: {
  name: string;
  description: string;
  instructions: string;
  toolIds: string[];
}) {
  const user = await requireAuth();

  return prisma.skill.create({
    data: {
      userId: user.id,
      name: data.name,
      description: data.description,
      instructions: data.instructions,
      toolIds: data.toolIds as any,
    },
  });
}

export async function deleteSkill(id: string) {
  const user = await requireAuth();

  await prisma.skill.deleteMany({
    where: { id, userId: user.id },
  });
}
