"use client";

import { AppIcon } from "@/components/app-icon";
import { McpPicker } from "@/modules/builder/components/mcp-picker";
import { SkillPicker } from "@/modules/builder/components/skill-picker";
import { toolsCatalog } from "@/modules/builder/lib/tools-catalog";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";

export function ToolPicker() {
  const addTool = useCanvasStore((s) => s.addTool);
  const addCustomTool = useCanvasStore((s) => s.addCustomTool);
  const toggleMemory = useCanvasStore((s) => s.toggleMemory);
  const nodes = useCanvasStore((s) => s.nodes);
  const memoryEnabled = useCanvasStore((s) => s.memoryEnabled);

  const agentNode = nodes.find((n) => n.type === "agent");
  const tools = (agentNode?.data.tools as { toolId: string }[]) ?? [];
  const addedToolIds = tools.map((t) => t.toolId);
  const generalTools = toolsCatalog.filter((t) => !t.id.startsWith("github_"));
  const githubTools = toolsCatalog.filter((t) => t.id.startsWith("github_"));

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-xs">
        Tools attach to the Agent node and show as badges on the canvas.
      </p>

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
        <h2 className="mb-2 text-sm font-medium">Skills</h2>
        <SkillPicker />
      </div>

      <div>
        <h2 className="mb-2 text-sm font-medium">MCP integrations</h2>
        <McpPicker />
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
          {memoryEnabled ? "Disable memory" : "Enable memory"}
        </Button>
      </div>
    </div>
  );
}
