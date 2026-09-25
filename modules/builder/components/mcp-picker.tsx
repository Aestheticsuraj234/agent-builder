"use client";

import { useMcpConnections } from "@/modules/integrations/hooks/use-mcp";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function McpPicker() {
  const { data: connections, isLoading } = useMcpConnections();
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeData = useCanvasStore((s) => s.updateNodeData);

  const agentNode = nodes.find((n) => n.type === "agent");
  const attached = (agentNode?.data.mcpConnectionIds as string[]) ?? [];

  function toggle(id: string) {
    if (!agentNode) return;
    const next = attached.includes(id)
      ? attached.filter((x) => x !== id)
      : [...attached, id];
    updateNodeData(agentNode.id, { mcpConnectionIds: next });
  }

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading...</p>;

  const list = (connections ?? []).filter((c) => c.enabled);

  if (list.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No MCP servers.{" "}
        <Link href="/agents/integrations" className="text-primary underline">
          Add one
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-1">
      {list.map((c) => (
        <Button
          key={c.id}
          variant={attached.includes(c.id) ? "default" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={() => toggle(c.id)}
        >
          {c.name}
        </Button>
      ))}
    </div>
  );
}
