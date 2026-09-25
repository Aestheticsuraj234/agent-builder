"use client";

import { AppIcon } from "@/components/app-icon";
import { toolsCatalog } from "@/modules/builder/lib/tools-catalog";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";

export function ToolPicker() {
  const addTool = useCanvasStore((s) => s.addTool);
  const toggleMemory = useCanvasStore((s) => s.toggleMemory);
  const nodes = useCanvasStore((s) => s.nodes);

  const addedToolIds = nodes.filter((n) => n.type === "tool").map((n) => n.data.toolId as string);
  const hasMemory = nodes.some((n) => n.type === "memory");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-sm font-medium">Add tools</h2>
        <div className="space-y-1">
          {toolsCatalog.map((tool) => (
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
        <h2 className="mb-2 text-sm font-medium">Memory</h2>
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={toggleMemory}>
          <AppIcon name="memory" className="mr-2 size-4" />
          {hasMemory ? "Remove memory" : "Add memory"}
        </Button>
      </div>
    </div>
  );
}
