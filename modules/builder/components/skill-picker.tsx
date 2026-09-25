"use client";

import { useSkills } from "@/modules/skills/hooks/use-skills";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SkillPicker() {
  const { data: skills, isLoading } = useSkills();
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const agentNode =
    nodes.find((n) => n.id === selectedNodeId && n.type === "agent") ??
    nodes.find((n) => n.type === "agent");
  const attached = (agentNode?.data.skillIds as string[]) ?? [];

  function toggle(id: string) {
    if (!agentNode) return;
    const next = attached.includes(id)
      ? attached.filter((x) => x !== id)
      : [...attached, id];
    updateNodeData(agentNode.id, { skillIds: next });
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  const list = skills ?? [];

  return (
    <div className="space-y-1">
      {list.map((s) => (
        <Button
          key={s.id}
          variant={attached.includes(s.id) ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() => toggle(s.id)}
        >
          {s.name}
          {(s as any).builtin && (
            <span className="text-muted-foreground ml-2 text-xs">built-in</span>
          )}
        </Button>
      ))}
      <Link href="/agents/skills" className="text-primary mt-2 block text-xs underline">
        Manage skills
      </Link>
    </div>
  );
}
