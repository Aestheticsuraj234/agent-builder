"use client";

import { CustomToolSettings } from "@/modules/builder/components/custom-tool-settings";
import { GithubSettings } from "@/modules/builder/components/github-settings";
import { McpPicker } from "@/modules/builder/components/mcp-picker";
import { SkillPicker } from "@/modules/builder/components/skill-picker";
import type { GithubConfig } from "@/modules/agents/lib/definition";
import { isCustomToolConfig } from "@/modules/builder/lib/custom-tool";
import { popularGptModels } from "@/modules/builder/lib/models";
import { getToolLabel } from "@/modules/builder/lib/tools-catalog";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ToolEntry = { toolId: string; config: Record<string, unknown> };

export function NodeSettingsPanel() {
  const nodes = useCanvasStore((s) => s.nodes);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const selectedToolIndex = useCanvasStore((s) => s.selectedToolIndex);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);
  const removeTool = useCanvasStore((s) => s.removeTool);
  const updateTool = useCanvasStore((s) => s.updateTool);
  const selectTool = useCanvasStore((s) => s.selectTool);
  const memoryEnabled = useCanvasStore((s) => s.memoryEnabled);
  const toggleMemory = useCanvasStore((s) => s.toggleMemory);

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const agentNode = nodes.find((n) => n.type === "agent");

  if (selectedToolIndex !== null && agentNode) {
    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    const tool = tools[selectedToolIndex];

    if (tool && isCustomToolConfig(tool.config)) {
      return (
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => selectTool(null)}>
            ← Back to agent
          </Button>
          <h3 className="text-sm font-medium">Custom tool</h3>
          <CustomToolSettings
            config={tool.config}
            onChange={(config) => updateTool(selectedToolIndex, config)}
            onRemove={() => removeTool(selectedToolIndex)}
          />
        </div>
      );
    }
  }

  if (!selectedNode) {
    return (
      <p className="text-muted-foreground text-sm">
        Click Start, Agent, or End on the canvas to edit settings.
      </p>
    );
  }

  if (selectedNode.type === "start") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Start node</h3>
        <p className="text-muted-foreground text-sm">
          Entry point for each user message. Execution flows to the connected Agent node.
        </p>
      </div>
    );
  }

  if (selectedNode.type === "end") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">End node</h3>
        <p className="text-muted-foreground text-sm">
          Final output returned to the user after the Agent finishes.
        </p>
      </div>
    );
  }

  if (selectedNode.type === "agent") {
    const github = (selectedNode.data.github as GithubConfig) ?? {
      owner: "",
      repo: "",
      defaultPrNumber: "",
    };
    const modelId = (selectedNode.data.modelId as string) ?? "gpt-4o-mini";
    const tools = (selectedNode.data.tools as ToolEntry[]) ?? [];

    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Agent</h3>

        <div className="space-y-2">
          <Label htmlFor="agent-label">Label</Label>
          <Input
            id="agent-label"
            defaultValue={(selectedNode.data.label as string) ?? "Main agent"}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            rows={6}
            defaultValue={(selectedNode.data.instructions as string) ?? ""}
            onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model ID</Label>
          <Input
            id="model"
            value={modelId}
            placeholder="gpt-4o-mini"
            onChange={(e) => updateNodeData(selectedNode.id, { modelId: e.target.value })}
          />
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

        <div className="space-y-2">
          <Label>Tools ({tools.length})</Label>
          <p className="text-muted-foreground text-xs">
            Add tools from the Tools drawer. Click a custom tool to edit it.
          </p>
          {tools.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tools yet.</p>
          ) : (
            <div className="space-y-1">
              {tools.map((tool, i) => (
                <div
                  key={`${tool.toolId}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <button
                    type="button"
                    className="text-left text-sm hover:underline"
                    onClick={() => {
                      if (isCustomToolConfig(tool.config)) selectTool(i);
                    }}
                  >
                    {getToolLabel(tool.toolId, tool.config)}
                  </button>
                  <Button variant="ghost" size="xs" onClick={() => removeTool(i)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Memory</Label>
          <Button variant="outline" size="sm" onClick={toggleMemory}>
            {memoryEnabled ? "Disable memory" : "Enable memory"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label>Skills</Label>
          <SkillPicker />
        </div>

        <div className="space-y-2">
          <Label>MCP servers</Label>
          <McpPicker />
        </div>

        <GithubSettings nodeId={selectedNode.id} github={github} />
      </div>
    );
  }

  return null;
}
