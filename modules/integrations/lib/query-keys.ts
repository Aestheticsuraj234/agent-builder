export const mcpKeys = {
  all: ["mcp"] as const,
  list: () => [...mcpKeys.all, "list"] as const,
};
