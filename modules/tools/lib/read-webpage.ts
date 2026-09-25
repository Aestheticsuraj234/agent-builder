import { tool } from "@langchain/core/tools";
import * as cheerio from "cheerio";
import { z } from "zod";

export const readWebpageTool = tool(
  async ({ url }) => {
    const res = await fetch(url, {
      headers: { "User-Agent": "AgentBuilder/1.0" },
    });

    if (!res.ok) {
      return `Failed to fetch page: ${res.status}`;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    $("script, style, nav, footer").remove();
    const text = $("body").text().replace(/\s+/g, " ").trim().slice(0, 8000);

    return JSON.stringify({ url, text });
  },
  {
    name: "read_webpage",
    description: "Read and extract text from a webpage URL",
    schema: z.object({
      url: z.string().describe("Full webpage URL"),
    }),
  }
);
