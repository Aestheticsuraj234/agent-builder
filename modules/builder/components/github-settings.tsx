"use client";

import type { GithubConfig } from "@/modules/agents/lib/definition";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GithubSettings({
  nodeId,
  github,
}: {
  nodeId: string;
  github: GithubConfig;
}) {
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  function update(field: keyof GithubConfig, value: string) {
    updateNodeData(nodeId, {
      github: { ...github, [field]: value },
    });
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-3">
      <p className="text-sm font-medium">GitHub repo defaults</p>
      <p className="text-muted-foreground text-xs">
        Used by Coding Helper and PR Review tools. Sign in with GitHub to access private repos.
      </p>
      <div className="space-y-2">
        <Label htmlFor="gh-owner">Owner</Label>
        <Input
          id="gh-owner"
          placeholder="octocat"
          value={github.owner}
          onChange={(e) => update("owner", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gh-repo">Repo</Label>
        <Input
          id="gh-repo"
          placeholder="Hello-World"
          value={github.repo}
          onChange={(e) => update("repo", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gh-pr">Default PR (optional)</Label>
        <Input
          id="gh-pr"
          placeholder="42 or https://github.com/owner/repo/pull/42"
          value={github.defaultPrNumber}
          onChange={(e) => update("defaultPrNumber", e.target.value)}
        />
      </div>
    </div>
  );
}
