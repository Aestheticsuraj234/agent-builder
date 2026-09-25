"use client";

import Link from "next/link";
import { AgentSettingsForm } from "@/modules/agents/components/agent-settings-form";
import { useAgent } from "@/modules/agents/hooks/use-agents";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function BuilderPageContent({ agentId }: { agentId: string }) {
  const { data: agent, isLoading } = useAgent(agentId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <p className="text-muted-foreground">Agent not found.</p>
        <Button render={<Link href="/agents" />} nativeButton={false}>
          Back to agents
        </Button>
      </div>
    );
  }

  const definition = agent.draftDefinition as AgentDefinition;
  const starterPrompts = (agent.starterPrompts as string[]) ?? [];

  return (
    <div className="flex h-full min-h-[calc(100vh-0px)] flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{agent.icon}</span>
          <div>
            <h1 className="font-heading text-lg font-semibold">{agent.name}</h1>
            <p className="text-muted-foreground text-xs">Builder · Phase 1 shell</p>
          </div>
        </div>
        <Button variant="outline" render={<Link href="/agents" />} nativeButton={false}>
          Back to agents
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[220px_1fr_320px]">
        <aside className="border-r border-border p-4">
          <h2 className="mb-3 text-sm font-medium">Tools</h2>
          <p className="text-muted-foreground text-xs">Tool picker comes in Phase 2.</p>
          <ul className="mt-4 space-y-2 text-sm">
            {definition.tools.length === 0 ? (
              <li className="text-muted-foreground">No tools attached yet</li>
            ) : (
              definition.tools.map((tool) => (
                <li key={tool.toolId} className="rounded-lg bg-muted px-2 py-1">
                  {tool.toolId}
                </li>
              ))
            )}
          </ul>
        </aside>

        <main className="flex items-center justify-center bg-muted/30 p-6">
          <div className="max-w-md rounded-2xl border border-dashed border-border bg-background p-8 text-center">
            <p className="font-medium">Canvas area</p>
            <p className="text-muted-foreground mt-2 text-sm">
              React Flow editor will go here in Phase 2.
            </p>
            <p className="text-muted-foreground mt-4 text-xs">
              Model: {definition.model.modelId} · Memory:{" "}
              {definition.memory.enabled ? "on" : "off"}
            </p>
          </div>
        </main>

        <aside className="overflow-y-auto border-l border-border p-4">
          <h2 className="mb-3 text-sm font-medium">Settings</h2>
          <AgentSettingsForm agent={agent} definition={definition} />
          {starterPrompts.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-medium">Starter prompts</h3>
              <ul className="text-muted-foreground space-y-1 text-xs">
                {starterPrompts.map((prompt) => (
                  <li key={prompt} className="rounded-lg bg-muted px-2 py-1">
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
