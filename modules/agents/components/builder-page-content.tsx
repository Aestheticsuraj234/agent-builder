"use client";

import Link from "next/link";
import { AgentBuilder } from "@/modules/builder/components/agent-builder";
import { useAgent } from "@/modules/agents/hooks/use-agents";
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

  return <AgentBuilder agent={agent} />;
}
