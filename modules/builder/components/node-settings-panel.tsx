"use client";

import { allowedModels } from "@/modules/builder/lib/models";
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
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Agent instructions</h3>
        <div className="space-y-2">
          <Label htmlFor="instructions">Instructions</Label>
          <Textarea
            id="instructions"
            rows={10}
            defaultValue={(selectedNode.data.instructions as string) ?? ""}
            onChange={(e) => updateNodeData(selectedNode.id, { instructions: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (selectedNode.type === "model") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Model</h3>
        <div className="space-y-2">
          <Label htmlFor="model">Choose model</Label>
          <select
            id="model"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={(selectedNode.data.modelId as string) ?? "gpt-4o-mini"}
            onChange={(e) => updateNodeData(selectedNode.id, { modelId: e.target.value })}
          >
            {allowedModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (selectedNode.type === "tool") {
    return (
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Tool</h3>
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
