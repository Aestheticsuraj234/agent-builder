"use client";

import Link from "next/link";
import { useAgentRuns } from "@/modules/agents/hooks/use-runs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function RunsPageContent({ agentId }: { agentId: string }) {
  const { data: runs, isLoading } = useAgentRuns(agentId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Spinner />
      </div>
    );
  }

  const list = runs ?? [];

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Run history</h1>
          <p className="text-muted-foreground text-sm">Recent test chat runs for this agent.</p>
        </div>
        <Button variant="outline" render={<Link href={`/agents/${agentId}/builder`} />} nativeButton={false}>
          Back to builder
        </Button>
      </div>

      {list.length === 0 ? (
        <p className="text-muted-foreground text-sm">No runs yet. Use Test Chat in the builder.</p>
      ) : (
        <div className="space-y-3">
          {list.map((run) => (
            <div key={run.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{run.conversation.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(run.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge variant={run.status === "completed" ? "default" : "outline"}>
                  {run.status}
                </Badge>
              </div>
              {run.nodeExecutions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {run.nodeExecutions.map((n) => (
                    <Badge key={n.id} variant="outline" className="text-xs">
                      {n.nodeType} ({n.nodeId}): {n.status}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
