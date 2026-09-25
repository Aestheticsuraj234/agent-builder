import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const webSearchTool = tool(
  async ({ query }) => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
      return "Web search is not configured. Add TAVILY_API_KEY to .env";
    }

    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        max_results: 5,
      }),
    });

    const data = await res.json();

    return JSON.stringify(
      (data.results ?? []).map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
      }))
    );
  },
  {
    name: "web_search",
    description: "Search the web for recent information",
    schema: z.object({
      query: z.string().describe("Search query"),
    }),
  }
);
