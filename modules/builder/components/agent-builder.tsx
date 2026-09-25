"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { useSaveAgent } from "@/modules/agents/hooks/use-agents";
import { AgentCanvas } from "@/modules/builder/components/agent-canvas";
import { NodeSettingsPanel } from "@/modules/builder/components/node-settings-panel";
import { ToolPicker } from "@/modules/builder/components/tool-picker";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AgentBuilderProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    draftDefinition: unknown;
    canvas: unknown;
  };
};

export function AgentBuilder({ agent }: AgentBuilderProps) {
  const init = useCanvasStore((s) => s.init);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const getDefinition = useCanvasStore((s) => s.getDefinition);
  const getCanvas = useCanvasStore((s) => s.getCanvas);
  const markClean = useCanvasStore((s) => s.markClean);

  const saveAgent = useSaveAgent(agent.id);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);

  useEffect(() => {
    init(agent.draftDefinition as AgentDefinition, agent.canvas as any);
  }, [agent.id]);

  useEffect(() => {
    setName(agent.name);
    setDescription(agent.description);
  }, [agent.name, agent.description]);

  function handleSave() {
    saveAgent.mutate(
      {
        name,
        description,
        draftDefinition: getDefinition(),
        canvas: getCanvas(),
      },
      { onSuccess: () => markClean() }
    );
  }

  return (
    <div className="flex h-full min-h-[calc(100vh-0px)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <AppIcon name={agent.icon} className="size-7" />
          <div>
            <h1 className="font-heading text-lg font-semibold">{name}</h1>
            <p className="text-muted-foreground text-xs">
              Visual builder {isDirty ? "· unsaved changes" : "· saved"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saveAgent.isPending}>
            {saveAgent.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" render={<Link href="/agents" />} nativeButton={false}>
            Back
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr_320px]">
        <aside className="overflow-y-auto border-r border-border p-4">
          <ToolPicker />
        </aside>

        <main className="min-h-0 bg-muted/20">
          <AgentCanvas />
        </main>

        <aside className="overflow-y-auto border-l border-border p-4">
          <div className="mb-6 space-y-3">
            <h2 className="text-sm font-medium">Agent info</h2>
            <div className="space-y-2">
              <Label htmlFor="agent-name">Name</Label>
              <Input id="agent-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-desc">Description</Label>
              <Input
                id="agent-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <NodeSettingsPanel />
        </aside>
      </div>
    </div>
  );
}
