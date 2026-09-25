"use client";

import Link from "next/link";
import { AppIcon } from "@/components/app-icon";
import { useDeleteAgent } from "@/modules/agents/hooks/use-agents";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AgentCardProps = {
  agent: {
    id: string;
    name: string;
    description: string;
    icon: string;
    templateId: string | null;
  };
};

export function AgentCard({ agent }: AgentCardProps) {
  const deleteAgent = useDeleteAgent();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AppIcon name={agent.icon} badge />
          {agent.name}
        </CardTitle>
        <CardDescription>
          {agent.description || "No description yet"}
          {agent.templateId ? ` · from ${agent.templateId}` : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-xs">Click Open to edit this agent.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button render={<Link href={`/agents/${agent.id}/builder`} />} nativeButton={false}>
          Open
        </Button>
        <Button
          variant="outline"
          onClick={() => deleteAgent.mutate(agent.id)}
          disabled={deleteAgent.isPending}
        >
          {deleteAgent.isPending ? "Deleting..." : "Delete"}
        </Button>
      </CardFooter>
    </Card>
  );
}
