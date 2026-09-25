import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const generateImageTool = tool(
  async ({ prompt }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return "Missing OPENAI_API_KEY";

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const data = await res.json();
    const url = data?.data?.[0]?.url;
    return url ? `IMAGE_URL:${url}` : "Image generation failed";
  },
  {
    name: "generate_image",
    description: "Generate an image from a text prompt.",
    schema: z.object({ prompt: z.string() }),
  }
);
