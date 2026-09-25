import { tool } from "@langchain/core/tools";
import { z } from "zod";
import type { GithubDefaults } from "./client";
import { githubFetch, parsePrInput, resolveRepo } from "./client";

export function createGithubTools(token: string | null, defaults: GithubDefaults = {}) {
  if (!token) {
    const stub = (name: string, description: string) =>
      tool(async () => "GitHub is not connected. Sign in with GitHub first.", {
        name,
        description,
        schema: z.object({}),
      });

    return {
      github_read_file: stub("github_read_file", "Read a file from GitHub"),
      github_search_code: stub("github_search_code", "Search code on GitHub"),
      github_get_pr: stub("github_get_pr", "Get PR details from GitHub"),
      github_get_diff: stub("github_get_diff", "Get PR diff from GitHub"),
    };
  }

  const github_read_file = tool(
    async ({ owner, repo, path }) => {
      const repoInfo = resolveRepo({ owner, repo }, defaults);
      if (!repoInfo.owner || !repoInfo.repo) {
        return "Set GitHub owner and repo in agent settings, or pass owner/repo to the tool.";
      }

      const data = await githubFetch(
        token,
        `/repos/${repoInfo.owner}/${repoInfo.repo}/contents/${path}`
      );

      if (data.error) return `GitHub error: ${data.error}`;

      if (Array.isArray(data)) {
        return JSON.stringify(data.map((f: any) => ({ name: f.name, path: f.path, type: f.type })));
      }

      const content = data.content
        ? Buffer.from(data.content, "base64").toString("utf-8").slice(0, 8000)
        : "";

      return JSON.stringify({ path: data.path, content });
    },
    {
      name: "github_read_file",
      description: "Read a file from a GitHub repository",
      schema: z.object({
        path: z.string().describe("File path in the repo"),
        owner: z.string().optional().describe("Repo owner"),
        repo: z.string().optional().describe("Repo name"),
      }),
    }
  );

  const github_search_code = tool(
    async ({ query, owner, repo }) => {
      const repoInfo = resolveRepo({ owner, repo }, defaults);
      if (!repoInfo.owner || !repoInfo.repo) {
        return "Set GitHub owner and repo in agent settings, or pass owner/repo to the tool.";
      }

      const q = encodeURIComponent(`repo:${repoInfo.owner}/${repoInfo.repo} ${query}`);
      const data = await githubFetch(token, `/search/code?q=${q}&per_page=5`);

      if (data.error) return `GitHub error: ${data.error}`;

      const items = (data.items ?? []).map((item: any) => ({
        name: item.name,
        path: item.path,
        url: item.html_url,
      }));

      return JSON.stringify(items);
    },
    {
      name: "github_search_code",
      description: "Search code in a GitHub repository",
      schema: z.object({
        query: z.string().describe("Code search query"),
        owner: z.string().optional(),
        repo: z.string().optional(),
      }),
    }
  );

  const github_get_pr = tool(
    async ({ pr, owner, repo }) => {
      const repoInfo = resolveRepo({ owner, repo }, defaults);
      const parsed = parsePrInput(pr || defaults.defaultPrNumber || "");

      const o = parsed.owner || repoInfo.owner;
      const r = parsed.repo || repoInfo.repo;
      const num = parsed.pullNumber;

      if (!o || !r || !num) {
        return "Need owner, repo, and PR number or URL. Set defaults in agent GitHub settings.";
      }

      const data = await githubFetch(token, `/repos/${o}/${r}/pulls/${num}`);
      if (data.error) return `GitHub error: ${data.error}`;

      return JSON.stringify({
        title: data.title,
        body: data.body,
        state: data.state,
        user: data.user?.login,
        url: data.html_url,
        changed_files: data.changed_files,
        additions: data.additions,
        deletions: data.deletions,
      });
    },
    {
      name: "github_get_pr",
      description: "Get pull request details by number or GitHub URL",
      schema: z.object({
        pr: z.string().optional().describe("PR number or full GitHub PR URL"),
        owner: z.string().optional(),
        repo: z.string().optional(),
      }),
    }
  );

  const github_get_diff = tool(
    async ({ pr, owner, repo }) => {
      const repoInfo = resolveRepo({ owner, repo }, defaults);
      const parsed = parsePrInput(pr || defaults.defaultPrNumber || "");

      const o = parsed.owner || repoInfo.owner;
      const r = parsed.repo || repoInfo.repo;
      const num = parsed.pullNumber;

      if (!o || !r || !num) {
        return "Need owner, repo, and PR number or URL. Set defaults in agent GitHub settings.";
      }

      const data = await githubFetch(
        token,
        `/repos/${o}/${r}/pulls/${num}`,
        "application/vnd.github.diff"
      );

      if (data.error) return `GitHub error: ${data.error}`;
      return data.diff ?? "No diff found";
    },
    {
      name: "github_get_diff",
      description: "Get the diff for a pull request",
      schema: z.object({
        pr: z.string().optional().describe("PR number or full GitHub PR URL"),
        owner: z.string().optional(),
        repo: z.string().optional(),
      }),
    }
  );

  return {
    github_read_file,
    github_search_code,
    github_get_pr,
    github_get_diff,
  };
}
