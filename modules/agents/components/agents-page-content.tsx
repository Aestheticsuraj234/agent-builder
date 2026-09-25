"use client";

import Link from "next/link";
import { AgentCard } from "@/modules/agents/components/agent-card";
import { useAgents } from "@/modules/agents/hooks/use-agents";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function AgentsPageContent() {
  const { data: agents, isLoading } = useAgents();

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const list = agents ?? [];

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">My Agents</h1>
          <p className="text-muted-foreground text-sm">Create and manage your AI agents.</p>
        </div>
        <Button render={<Link href="/agents/new" />} nativeButton={false}>
          Create Agent
        </Button>
      </div>

      {list.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-medium">No agents yet</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Pick a template or start with a blank agent.
          </p>
          <Button className="mt-4" render={<Link href="/agents/new" />} nativeButton={false}>
            Create your first agent
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
