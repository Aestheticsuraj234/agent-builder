"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { useSaveAgent } from "@/modules/agents/hooks/use-agents";
import { AgentCanvas } from "@/modules/builder/components/agent-canvas";
import { NodeSettingsPanel } from "@/modules/builder/components/node-settings-panel";
import { ToolPicker } from "@/modules/builder/components/tool-picker";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import { ChatPanel } from "@/modules/playground/components/chat-panel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
    welcomeMessage?: string;
    starterPrompts?: unknown;
  };
};

export function AgentBuilder({ agent }: AgentBuilderProps) {
  const init = useCanvasStore((s) => s.init);
  const isDirty = useCanvasStore((s) => s.isDirty);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const getDefinition = useCanvasStore((s) => s.getDefinition);
  const getCanvas = useCanvasStore((s) => s.getCanvas);
  const markClean = useCanvasStore((s) => s.markClean);
  const addAgentNode = useCanvasStore((s) => s.addAgentNode);

  const saveAgent = useSaveAgent(agent.id);

  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    init(agent.draftDefinition, agent.canvas);
  }, [agent.id]);

  useEffect(() => {
    setName(agent.name);
    setDescription(agent.description);
  }, [agent.name, agent.description]);

  useEffect(() => {
    if (selectedNodeId) {
      setSettingsOpen(true);
    }
  }, [selectedNodeId]);

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
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <AppIcon name={agent.icon} badge className="size-11" />
          <div className="min-w-0">
            <h1 className="truncate font-heading text-lg font-semibold">{name}</h1>
            <p className="text-muted-foreground text-xs">
              Visual builder {isDirty ? "· unsaved changes" : "· saved"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={addAgentNode}>
            Add agent step
          </Button>
          <Button variant="outline" size="sm" onClick={() => setToolsOpen(true)}>
            Tools
          </Button>
          <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
            Settings
          </Button>
          <Button variant="outline" size="sm" onClick={() => setChatOpen(true)}>
            Test Chat
          </Button>
          <Button onClick={handleSave} disabled={saveAgent.isPending}>
            {saveAgent.isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="outline" render={<Link href="/agents" />} nativeButton={false}>
            Back
          </Button>
        </div>
      </header>

      <main className="relative min-h-0 flex-1 bg-muted/20">
        <AgentCanvas />
      </main>

      <Drawer open={toolsOpen} onOpenChange={setToolsOpen} swipeDirection="left">
        <DrawerContent className="max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Add capabilities</DrawerTitle>
            <DrawerDescription>Pick tools and memory for the Agent node.</DrawerDescription>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <ToolPicker />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={chatOpen} onOpenChange={setChatOpen} swipeDirection="up">
        <DrawerContent className="h-[70vh] max-h-[70vh]">
          <DrawerHeader>
            <DrawerTitle>Test chat</DrawerTitle>
            <DrawerDescription>
              Try your agent with the current canvas config. Save first if you changed tools.
            </DrawerDescription>
          </DrawerHeader>
          <div className="min-h-0 flex-1 overflow-hidden">
            <ChatPanel
              agentId={agent.id}
              definition={getDefinition()}
              welcomeMessage={agent.welcomeMessage}
              starterPrompts={(agent.starterPrompts as string[]) ?? []}
            />
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={settingsOpen} onOpenChange={setSettingsOpen} swipeDirection="right">
        <DrawerContent className="max-w-md">
          <DrawerHeader>
            <DrawerTitle>Agent settings</DrawerTitle>
            <DrawerDescription>Edit agent info and selected node.</DrawerDescription>
          </DrawerHeader>
          <div className="space-y-6 overflow-y-auto px-4 pb-6">
            <div className="space-y-3">
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
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
