export type CustomToolParam = {
  name: string;
  type: "string" | "number" | "boolean";
  description: string;
  required: boolean;
};

export type CustomToolConfig = {
  type: "custom";
  name: string;
  description: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  url: string;
  headers: { key: string; value: string }[];
  body: string;
  parameters: CustomToolParam[];
  timeoutMs: number;
};

export function defaultCustomToolConfig(): CustomToolConfig {
  return {
    type: "custom",
    name: "My Custom Tool",
    description: "Describe what this tool does so the AI knows when to use it.",
    method: "GET",
    url: "https://api.example.com/endpoint",
    headers: [{ key: "Content-Type", value: "application/json" }],
    body: '{\n  "query": "{{query}}"\n}',
    parameters: [
      {
        name: "query",
        type: "string",
        description: "The search query",
        required: true,
      },
    ],
    timeoutMs: 10000,
  };
}

export function isCustomToolConfig(config: unknown): config is CustomToolConfig {
  return (config as CustomToolConfig)?.type === "custom";
}
