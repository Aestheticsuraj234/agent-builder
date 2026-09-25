import type { AgentDefinition } from "./definition";
import { defaultDefinition } from "./definition";

export type AgentTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  welcomeMessage: string;
  starterPrompts: string[];
  definition: AgentDefinition;
};

export const templates: AgentTemplate[] = [
  {
    id: "weather",
    name: "Weather Assistant",
    description: "Get forecasts for any city.",
    icon: "weather",
    welcomeMessage: "Ask me about the weather anywhere.",
    starterPrompts: ["What's the forecast in Tokyo?", "Will it rain in London this week?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a weather assistant. Give clear, concise forecasts. Mention temperature, conditions, and anything useful for planning.",
      tools: [{ toolId: "weather", config: {} }],
    },
  },
  {
    id: "web-research",
    name: "Web Research Assistant",
    description: "Search the web and summarize what you find.",
    icon: "web-research",
    welcomeMessage: "I can search the web and summarize results for you.",
    starterPrompts: ["Summarize recent news on AI agents", "What are people saying about Next.js 16?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a research assistant. Search the web, read pages when needed, and summarize findings. Cite your sources.",
      tools: [
        { toolId: "web_search", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
    },
  },
  {
    id: "travel",
    name: "Travel Assistant",
    description: "Plan trips with weather, search, and quick math.",
    icon: "travel",
    welcomeMessage: "Let's plan your next trip.",
    starterPrompts: ["Plan a weekend in Paris", "What's the weather like in Bali in December?"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a travel assistant. Help users plan trips with weather info, web research, and simple calculations. Do not book flights or hotels.",
      tools: [
        { toolId: "weather", config: {} },
        { toolId: "web_search", config: {} },
        { toolId: "calculator", config: {} },
      ],
    },
  },
  {
    id: "writing",
    name: "Writing Assistant",
    description: "Help with drafts, edits, and ideas.",
    icon: "writing",
    welcomeMessage: "Tell me what you'd like to write.",
    starterPrompts: ["Help me write a blog intro about AI", "Improve this paragraph for clarity"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a writing assistant. Help users draft, edit, and refine text. Be clear and match the tone they want.",
      tools: [{ toolId: "web_search", config: {} }],
    },
  },
  {
    id: "coding",
    name: "Coding Helper",
    description: "Explore repos and explain code.",
    icon: "coding",
    welcomeMessage: "Ask me about code in your GitHub repos.",
    starterPrompts: ["Explain how auth works in my repo", "Find where we handle API routes"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a coding assistant. Help users understand code in their GitHub repo. Use github_read_file and github_search_code. Set owner/repo in settings or ask the user.",
      tools: [
        { toolId: "github_read_file", config: {} },
        { toolId: "github_search_code", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
      github: { owner: "", repo: "", defaultPrNumber: "" },
    },
  },
  {
    id: "pr-review",
    name: "PR Review Assistant",
    description: "Review pull requests for bugs and style.",
    icon: "pr-review",
    welcomeMessage: "Paste a PR link or ask me to review changes.",
    starterPrompts: ["Review this PR for bugs", "Summarize the changes in PR #42"],
    definition: {
      ...defaultDefinition(),
      instructions:
        "You are a PR review assistant. Use github_get_pr and github_get_diff to review changes. Ask for PR number or URL if not set in GitHub settings.",
      tools: [
        { toolId: "github_get_pr", config: {} },
        { toolId: "github_get_diff", config: {} },
        { toolId: "read_webpage", config: {} },
      ],
      github: { owner: "", repo: "", defaultPrNumber: "" },
    },
  },
];

export function getTemplate(templateId: string) {
  return templates.find((t) => t.id === templateId);
}
