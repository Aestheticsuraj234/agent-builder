"use client";

import { CustomToolSettings } from "@/modules/builder/components/custom-tool-settings";
import { GithubSettings } from "@/modules/builder/components/github-settings";
import type { GithubConfig } from "@/modules/agents/lib/definition";
import { isCustomToolConfig } from "@/modules/builder/lib/custom-tool";
import { popularGptModels } from "@/modules/builder/lib/models";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function NodeSettingsPanel() {
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const removeSelectedNode = useCanvasStore((s) => s.removeSelectedNode);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <p className="text-muted-foreground text-sm">
        Click a node on the canvas to edit its settings.
      </p>
    );
  }

  if (selectedNode.type === "agent") {
    const github = (selectedNode.data.github as GithubConfig) ?? {
      owner: "",
      repo: "",
      defaultPrNumber: "",
    };

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Agent instructions</h3>
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            rows={8}
            defaultValue={(selectedNode.data.instructions as string) ?? ""}
            onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
          />
        </div>
        <GithubSettings nodeId={selectedNode.id} github={github} />
      </div>
    );
  }

  if (selectedNode.type === "model") {
    const modelId = (selectedNode.data.modelId as string) ?? "gpt-4o-mini";

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Model</h3>
        <div className="space-y-2">
          <Label htmlFor="model">Model ID</Label>
          <Input
            id="model"
            value={modelId}
            placeholder="gpt-4o-mini"
            onChange={(e) => updateNodeData(selectedNode.id, { modelId: e.target.value })}
          />
          <p className="text-muted-foreground text-xs">
            Type any OpenAI GPT model ID.
          </p>
        </div>
        <div className="space-y-2">
          <Label>Popular picks</Label>
          <div className="flex flex-wrap gap-1.5">
            {popularGptModels.map((model) => (
              <Button
                key={model}
                type="button"
                variant={modelId === model ? "default" : "outline"}
                size="xs"
                onClick={() => updateNodeData(selectedNode.id, { modelId: model })}
              >
                {model}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedNode.type === "tool") {
    const config = selectedNode.data.config;

    if (isCustomToolConfig(config)) {
      return (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Custom tool</h3>
          <CustomToolSettings nodeId={selectedNode.id} config={config} />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Built-in tool</h3>
        <p className="text-sm">{(selectedNode.data.label as string) ?? ""}</p>
        <p className="text-muted-foreground text-xs">{(selectedNode.data.toolId as string) ?? ""}</p>
        <Button variant="outline" size="sm" onClick={removeSelectedNode}>
          Remove tool
        </Button>
      </div>
    );
  }

  if (selectedNode.type === "memory") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Memory</h3>
        <p className="text-muted-foreground text-sm">
          When enabled, the agent remembers the conversation.
        </p>
        <Button variant="outline" size="sm" onClick={removeSelectedNode}>
          Remove memory
        </Button>
      </div>
    );
  }

  return null;
}
