export type SkillData = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  toolIds: string[];
  mcpConnectionIds: string[];
  starterPrompts: string[];
  builtin: boolean;
};

export const builtinSkills: SkillData[] = [
  {
    id: "builtin-pr-review",
    name: "PR Review",
    description: "Review pull requests with GitHub tools.",
    instructions:
      "You review pull requests for bugs, security issues, and style. Use GitHub tools to read diffs and summarize changes clearly.",
    toolIds: ["github_get_pr", "github_get_diff", "read_webpage"],
    mcpConnectionIds: [],
    starterPrompts: ["Review PR #42 for bugs", "Summarize this PR's changes"],
    builtin: true,
  },
  {
    id: "builtin-research",
    name: "Web Research",
    description: "Search and summarize the web.",
    instructions:
      "You research topics on the web. Search, read pages, and summarize with sources.",
    toolIds: ["web_search", "read_webpage"],
    mcpConnectionIds: [],
    starterPrompts: ["Summarize recent AI agent news"],
    builtin: true,
  },
  {
    id: "builtin-coding",
    name: "Coding Helper",
    description: "Explore GitHub repos.",
    instructions:
      "You help users understand code in GitHub repos. Use github_read_file and github_search_code.",
    toolIds: ["github_read_file", "github_search_code"],
    mcpConnectionIds: [],
    starterPrompts: ["Find where auth is handled"],
    builtin: true,
  },
  {
    id: "builtin-writing",
    name: "Writing",
    description: "Draft and edit text.",
    instructions: "You help users write and edit clear, engaging text.",
    toolIds: ["web_search"],
    mcpConnectionIds: [],
    starterPrompts: ["Improve this paragraph"],
    builtin: true,
  },
  {
    id: "builtin-weather",
    name: "Weather",
    description: "Forecast lookups.",
    instructions: "You give concise weather forecasts for any city.",
    toolIds: ["weather"],
    mcpConnectionIds: [],
    starterPrompts: ["Weather in Tokyo this week"],
    builtin: true,
  },
  {
    id: "builtin-image-prompt",
    name: "Image Prompt",
    description: "Craft image generation prompts.",
    instructions:
      "You write detailed image generation prompts. Ask clarifying questions when needed.",
    toolIds: [],
    mcpConnectionIds: [],
    starterPrompts: ["Prompt for a sunset over mountains"],
    builtin: true,
  },
];

export function getBuiltinSkill(id: string) {
  return builtinSkills.find((s) => s.id === id);
}
