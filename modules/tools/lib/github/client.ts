export type GithubDefaults = {
  owner?: string;
  repo?: string;
  defaultPrNumber?: string;
};

export async function githubFetch(
  token: string,
  path: string,
  accept = "application/vnd.github+json"
) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    return { error: text.slice(0, 2000), status: res.status };
  }

  if (accept === "application/vnd.github.diff") {
    const text = await res.text();
    return { diff: text.slice(0, 12000) };
  }

  return res.json();
}

export function parsePrInput(input: string) {
  const urlMatch = input.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/i);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2], pullNumber: urlMatch[3] };
  }

  if (/^\d+$/.test(input.trim())) {
    return { pullNumber: input.trim() };
  }

  return { pullNumber: input };
}

export function resolveRepo(
  args: { owner?: string; repo?: string },
  defaults: GithubDefaults
) {
  return {
    owner: args.owner || defaults.owner || "",
    repo: args.repo || defaults.repo || "",
  };
}
