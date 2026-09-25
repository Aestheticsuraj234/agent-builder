"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";

export function StartNode({ data }: NodeProps) {
  return (
    <div className="min-w-[140px] rounded-xl border-2 border-emerald-500/60 bg-card px-4 py-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <AppIcon name="play" className="size-3.5" />
        Start
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        {(data.label as string) ?? "User message in"}
      </p>
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
}
