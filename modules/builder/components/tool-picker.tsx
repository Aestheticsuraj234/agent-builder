"use client";

import { AppIcon } from "@/components/app-icon";
import { toolsCatalog } from "@/modules/builder/lib/tools-catalog";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";

export function ToolPicker() {
  const addTool = useCanvasStore((s) => s.addTool);
  const addCustomTool = useCanvasStore((s) => s.addCustomTool);
  const toggleMemory = useCanvasStore((s) => s.toggleMemory);
  const nodes = useCanvasStore((s) => s.nodes);

  const addedToolIds = nodes.filter((n) => n.type === "tool").map((n) => n.data.toolId as string);
  const hasMemory = nodes.some((n) => n.type === "memory");
  const generalTools = toolsCatalog.filter((t) => !t.id.startsWith("github_"));
  const githubTools = toolsCatalog.filter((t) => t.id.startsWith("github_"));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-sm font-medium">General tools</h2>
        <div className="space-y-1">
          {generalTools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              className="w-full justify-start"
              disabled={addedToolIds.includes(tool.id)}
              onClick={() => addTool(tool.id)}
            >
              <AppIcon name={tool.icon} className="mr-2 size-4" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium">GitHub tools</h2>
        <p className="text-muted-foreground mb-2 text-xs">Uses your GitHub sign-in token.</p>
        <div className="space-y-1">
          {githubTools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              className="w-full justify-start"
              disabled={addedToolIds.includes(tool.id)}
              onClick={() => addTool(tool.id)}
            >
              <AppIcon name={tool.icon} className="mr-2 size-4" />
              {tool.label}
            </Button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium">Custom tool</h2>
        <Button
          variant="default"
          size="sm"
          className="w-full justify-start"
          onClick={addCustomTool}
        >
          <AppIcon name="custom" className="mr-2 size-4" />
          Create custom tool
        </Button>
        <p className="text-muted-foreground mt-2 text-xs">
          Call any HTTP API with your own params, headers, and body.
        </p>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium">Memory</h2>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={toggleMemory}>
          <AppIcon name="memory" className="mr-2 size-4" />
          {hasMemory ? "Remove memory" : "Add memory"}
        </Button>
      </div>
    </div>
  );
}
