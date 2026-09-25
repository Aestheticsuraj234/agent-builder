import type { StructuredTool } from "@langchain/core/tools";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { isCustomToolConfig } from "@/modules/builder/lib/custom-tool";
import { buildCustomTool } from "./custom-http";
import { calculatorTool } from "./calculator";
import { createGithubTools } from "./github";
import { getGithubToken } from "./github/token";
import { readWebpageTool } from "./read-webpage";
import { weatherTool } from "./weather";
import { getMcpTools } from "@/modules/integrations/lib/mcp-client";
import { webSearchTool } from "./web-search";

const builtInTools: Record<string, StructuredTool> = {
  calculator: calculatorTool,
  weather: weatherTool,
  web_search: webSearchTool,
  read_webpage: readWebpageTool,
};

const githubToolIds = [
  "github_read_file",
  "github_search_code",
  "github_get_pr",
  "github_get_diff",
];

export async function getToolsForAgent(definition: AgentDefinition, userId: string) {
  const tools: StructuredTool[] = [];
  const needsGithub = definition.tools.some((t) => githubToolIds.includes(t.toolId));

  let githubTools: Record<string, StructuredTool> = {};

  if (needsGithub) {
    const token = await getGithubToken(userId);
    githubTools = createGithubTools(token, {
      owner: definition.github?.owner,
      repo: definition.github?.repo,
      defaultPrNumber: definition.github?.defaultPrNumber,
    });
  }

  for (const t of definition.tools) {
    if (isCustomToolConfig(t.config)) {
      tools.push(buildCustomTool(t.config));
      continue;
    }

    if (githubToolIds.includes(t.toolId)) {
      const ghTool = githubTools[t.toolId];
      if (ghTool) tools.push(ghTool);
      continue;
    }

    const builtIn = builtInTools[t.toolId];
    if (builtIn) {
      tools.push(builtIn);
    }
  }

  if (definition.mcpConnectionIds?.length) {
    const mcpTools = await getMcpTools(userId, definition.mcpConnectionIds);
    tools.push(...mcpTools);
  }

  return tools;
}
