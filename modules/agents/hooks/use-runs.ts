"use client";

import { useQuery } from "@tanstack/react-query";
import { getAgentRun, listAgentRuns } from "@/modules/agents/actions/runs";

export const runKeys = {
  list: (agentId: string) => ["runs", agentId] as const,
  detail: (runId: string) => ["runs", "detail", runId] as const,
};

export function useAgentRuns(agentId: string) {
  return useQuery({
    queryKey: runKeys.list(agentId),
    queryFn: () => listAgentRuns(agentId),
  });
}

export function useAgentRun(runId: string) {
  return useQuery({
    queryKey: runKeys.detail(runId),
    queryFn: () => getAgentRun(runId),
  });
}
