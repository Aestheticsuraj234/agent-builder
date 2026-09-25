"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";
import { getToolIcon, getToolLabel } from "@/modules/builder/lib/tools-catalog";

type ToolEntry = { toolId: string; config?: Record<string, unknown> };

const traceRing: Record<string, string> = {
  running: "ring-4 ring-yellow-400/70",
  completed: "ring-4 ring-emerald-400/70",
  failed: "ring-4 ring-red-400/70",
};

export function AgentNode({ data }: NodeProps) {
  const trace = data.traceStatus as string | null;
  const tools = (data.tools as ToolEntry[]) ?? [];
  const modelId = (data.modelId as string) ?? "gpt-4o-mini";
  const memoryEnabled = !!data.memoryEnabled;
  const mcpCount = ((data.mcpConnectionIds as string[]) ?? []).length;

  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-xl border-2 border-primary bg-card px-4 py-3 shadow-sm ${trace ? traceRing[trace] ?? "" : ""}`}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <AppIcon name="bot" className="size-3.5" />
        Agent
      </p>
      <p className="mt-1 truncate text-xs font-medium">
        {(data.label as string) ?? "Main agent"}
      </p>
      <p className="text-muted-foreground mt-0.5 truncate text-xs">{modelId}</p>

      {(tools.length > 0 || memoryEnabled || mcpCount > 0) && (
        <div className="mt-2 flex flex-wrap gap-1">
          {memoryEnabled && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
              <AppIcon name="memory" className="size-2.5" />
              Memory
            </span>
          )}
          {mcpCount > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px]">
              MCP ×{mcpCount}
            </span>
          )}
          {tools.map((tool, i) => (
            <span
              key={`${tool.toolId}-${i}`}
              className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px]"
            >
              <AppIcon name={getToolIcon(tool.toolId, tool.config)} className="size-2.5" />
              {getToolLabel(tool.toolId, tool.config)}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}
