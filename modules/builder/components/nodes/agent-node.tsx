"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";

export function AgentNode({ data }: NodeProps) {
  return (
    <div className="min-w-[160px] rounded-xl border-2 border-primary bg-card px-4 py-3 shadow-sm">
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Right} id="right" />
      <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
        <AppIcon name="bot" className="size-3.5" />
        Agent
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{(data.label as string) ?? "Main agent"}</p>
    </div>
  );
}
