"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createBlankAgent,
  createFromTemplate,
  createFromWorkflowTemplate,
  deleteAgent,
  fetchAgent,
  listAgents,
  saveAgent,
  updateAgent,
} from "@/modules/agents/actions";
import { agentKeys } from "@/modules/agents/lib/query-keys";

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: listAgents,
  });
}

export function useAgent(agentId: string) {
  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: () => fetchAgent(agentId),
  });
}

export function useCreateBlankAgent() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createBlankAgent,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
  });
}

export function useCreateFromWorkflowTemplate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createFromWorkflowTemplate,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
  });
}

export function useCreateFromTemplate() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: createFromTemplate,
    onSuccess: (agent) => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
      router.push(`/agents/${agent.id}/builder`);
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
    },
  });
}

export function useUpdateAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name?: string; description?: string; instructions?: string }) =>
      updateAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
    },
  });
}

export function useSaveAgent(agentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      draftDefinition: any;
      canvas: any;
    }) => saveAgent(agentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.detail(agentId) });
      queryClient.invalidateQueries({ queryKey: agentKeys.list() });
    },
  });
}
