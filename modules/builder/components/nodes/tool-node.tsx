"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";
import { getToolIcon } from "@/modules/builder/lib/tools-catalog";

export function ToolNode({ data }: NodeProps) {
  const icon = getToolIcon(data.toolId as string, data.config);

  return (
    <div className="min-w-[140px] rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium">
        <AppIcon name={icon} className="size-3.5" />
        {(data.label as string) ?? "Tool"}
      </p>
      <p className="text-muted-foreground mt-1 text-xs">{(data.toolId as string) ?? ""}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
