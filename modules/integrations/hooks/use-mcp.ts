"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMcpConnection,
  deleteMcpConnection,
  listMcpConnections,
  testConnection,
  toggleMcpConnection,
} from "@/modules/integrations/actions";
import { mcpKeys } from "@/modules/integrations/lib/query-keys";

export function useMcpConnections() {
  return useQuery({
    queryKey: mcpKeys.list(),
    queryFn: listMcpConnections,
  });
}

export function useCreateMcpConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMcpConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mcpKeys.list() });
    },
  });
}

export function useDeleteMcpConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMcpConnection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mcpKeys.list() });
    },
  });
}

export function useToggleMcpConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      toggleMcpConnection(id, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mcpKeys.list() });
    },
  });
}

export function useTestMcpConnection() {
  return useMutation({
    mutationFn: ({ url, authHeader }: { url: string; authHeader?: string }) =>
      testConnection(url, authHeader),
  });
}
