import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const calculatorTool = tool(
  async ({ expression }) => {
    const cleaned = expression.replace(/\s/g, "");
    if (!/^[\d+\-*/().]+$/.test(cleaned)) {
      return "Invalid math expression";
    }
    try {
      return String(new Function(`"use strict"; return (${cleaned})`)());
    } catch {
      return "Could not calculate";
    }
  },
  {
    name: "calculator",
    description: "Do math calculations. Example: 12 * 8",
    schema: z.object({
      expression: z.string().describe("Math expression like 12 * 8"),
    }),
  }
);
