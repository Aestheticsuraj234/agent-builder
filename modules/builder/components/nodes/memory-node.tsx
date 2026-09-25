"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";

export function MemoryNode({ data }: NodeProps) {
  return (
    <div className="min-w-[120px] rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium">
        <AppIcon name="memory" className="size-3.5" />
        Memory
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        {(data.enabled as boolean) ? "Enabled" : "Off"}
      </p>
      <Handle type="source" position={Position.Left} />
    </div>
  );
}
