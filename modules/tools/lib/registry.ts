import type { StructuredTool } from "@langchain/core/tools";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { isCustomToolConfig } from "@/modules/builder/lib/custom-tool";
import { buildCustomTool } from "./custom-http";
import { calculatorTool } from "./calculator";
import { readWebpageTool } from "./read-webpage";
import { weatherTool } from "./weather";
import { webSearchTool } from "./web-search";

const builtInTools: Record<string, StructuredTool> = {
  calculator: calculatorTool,
  weather: weatherTool,
  web_search: webSearchTool,
  read_webpage: readWebpageTool,
};

export function getToolsForAgent(definition: AgentDefinition) {
  const tools: StructuredTool[] = [];

  for (const t of definition.tools) {
    if (isCustomToolConfig(t.config)) {
      tools.push(buildCustomTool(t.config));
      continue;
    }

    const builtIn = builtInTools[t.toolId];
    if (builtIn) {
      tools.push(builtIn);
    }
  }

  return tools;
}
