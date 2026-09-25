import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { CustomToolConfig } from "@/modules/builder/lib/custom-tool";

function fillTemplate(template: string, params: Record<string, unknown>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(params[key] ?? ""));
}

export function buildCustomTool(config: CustomToolConfig) {
  const paramSchema: Record<string, any> = {};

  for (const param of config.parameters) {
    let field: any =
      param.type === "number"
        ? z.number()
        : param.type === "boolean"
          ? z.boolean()
          : z.string();

    if (!param.required) {
      field = field.optional();
    }

    paramSchema[param.name] = field.describe(param.description);
  }

  const schema =
    Object.keys(paramSchema).length > 0 ? z.object(paramSchema) : z.object({});

  return tool(
    async (params) => {
      const url = fillTemplate(config.url, params as Record<string, unknown>);
      const headers: Record<string, string> = {};

      for (const h of config.headers) {
        if (h.key) headers[h.key] = fillTemplate(h.value, params as Record<string, unknown>);
      }

      const options: RequestInit = {
        method: config.method,
        headers,
        signal: AbortSignal.timeout(config.timeoutMs),
      };

      if (config.method !== "GET" && config.body) {
        options.body = fillTemplate(config.body, params as Record<string, unknown>);
      }

      const res = await fetch(url, options);
      const text = await res.text();

      return text.slice(0, 8000);
    },
    {
      name: config.name.replace(/\s+/g, "_").toLowerCase(),
      description: config.description,
      schema,
    }
  );
}
