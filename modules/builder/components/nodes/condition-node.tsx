"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AppIcon } from "@/components/app-icon";

const traceRing: Record<string, string> = {
  running: "ring-4 ring-yellow-400/70",
  completed: "ring-4 ring-emerald-400/70",
  failed: "ring-4 ring-red-400/70",
};

export function ConditionNode({ data }: NodeProps) {
  const trace = data.traceStatus as string | null;
  const equals = (data.equals as string) ?? "";

  return (
    <div
      className={`min-w-[180px] rounded-xl border-2 border-amber-500/60 bg-card px-4 py-3 shadow-sm ${trace ? traceRing[trace] ?? "" : ""}`}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <p className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
        <AppIcon name="model" className="size-3.5" />
        Condition
      </p>
      <p className="mt-1 text-xs">equals &quot;{equals}&quot;</p>
      <div className="mt-3 flex justify-between text-[10px]">
        <span>true</span>
        <span>false</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="true" style={{ left: "25%" }} />
      <Handle type="source" position={Position.Bottom} id="false" style={{ left: "75%" }} />
    </div>
  );
}
