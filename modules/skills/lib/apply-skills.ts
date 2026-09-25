import type { AgentDefinition } from "@/modules/agents/lib/definition";
import prisma from "@/lib/db";
import { builtinSkills, getBuiltinSkill, type SkillData } from "./builtin-skills";

async function loadSkills(userId: string, skillIds: string[]) {
  const result: SkillData[] = [];

  for (const id of skillIds) {
    const builtin = getBuiltinSkill(id);
    if (builtin) {
      result.push(builtin);
      continue;
    }

    const row = await prisma.skill.findFirst({
      where: { id, userId },
    });

    if (row) {
      result.push({
        id: row.id,
        name: row.name,
        description: row.description,
        instructions: row.instructions,
        toolIds: row.toolIds as string[],
        mcpConnectionIds: row.mcpConnectionIds as string[],
        starterPrompts: row.starterPrompts as string[],
        builtin: false,
      });
    }
  }

  return result;
}

export async function applySkillsToAgent(
  definition: AgentDefinition,
  userId: string,
  skillIds: string[]
) {
  if (!skillIds.length) return definition;

  const skills = await loadSkills(userId, skillIds);
  if (!skills.length) return definition;

  const extraInstructions = skills.map((s) => s.instructions).join("\n\n");
  const toolIds = new Set(definition.tools.map((t) => t.toolId));
  const mcpIds = new Set(definition.mcpConnectionIds ?? []);

  for (const skill of skills) {
    for (const toolId of skill.toolIds) {
      if (!toolIds.has(toolId)) {
        toolIds.add(toolId);
        definition.tools.push({ toolId, config: {} });
      }
    }
    for (const mcpId of skill.mcpConnectionIds) {
      mcpIds.add(mcpId);
    }
  }

  return {
    ...definition,
    instructions: `${definition.instructions}\n\n${extraInstructions}`.trim(),
    mcpConnectionIds: [...mcpIds],
  };
}

export function listAllBuiltinSkills() {
  return builtinSkills;
}
