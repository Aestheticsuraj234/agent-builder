export const toolsCatalog = [
  { id: "calculator", label: "Calculator", icon: "calculator" },
  { id: "weather", label: "Weather", icon: "weather" },
  { id: "web_search", label: "Web Search", icon: "web_search" },
  { id: "read_webpage", label: "Read Webpage", icon: "read_webpage" },
  { id: "generate_image", label: "Generate Image", icon: "writing" },
  { id: "github_read_file", label: "GitHub Read File", icon: "github_read_file" },
  { id: "github_search_code", label: "GitHub Search Code", icon: "github_search_code" },
  { id: "github_get_pr", label: "GitHub Get PR", icon: "github_get_pr" },
  { id: "github_get_diff", label: "GitHub Get Diff", icon: "github_get_diff" },
];

export function getToolLabel(toolId: string, config?: unknown) {
  if ((config as { type?: string; name?: string })?.type === "custom") {
    return (config as { name: string }).name;
  }
  return toolsCatalog.find((t) => t.id === toolId)?.label ?? toolId;
}

export function getToolIcon(toolId: string, config?: unknown) {
  if ((config as { type?: string })?.type === "custom") return "custom";
  return toolsCatalog.find((t) => t.id === toolId)?.icon ?? "bot";
}
