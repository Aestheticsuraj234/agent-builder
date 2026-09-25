"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";

export function EndNode({ data }: NodeProps) {
  return (
    <div className="min-w-[140px] rounded-xl border-2 border-rose-500/60 bg-card px-4 py-3 shadow-sm">
      <Handle type="target" position={Position.Top} id="top" />
      <p className="flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
        <AppIcon name="flag" className="size-3.5" />
        End
      </p>
      <p className="text-muted-foreground mt-1 text-xs">
        {(data.label as string) ?? "Response out"}
      </p>
    </div>
  );
}
