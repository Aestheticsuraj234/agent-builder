"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSkill, deleteSkill, listSkills } from "@/modules/skills/actions";

export const skillKeys = {
  all: ["skills"] as const,
  list: () => [...skillKeys.all, "list"] as const,
};

export function useSkills() {
  return useQuery({
    queryKey: skillKeys.list(),
    queryFn: listSkills,
  });
}

export function useCreateSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.list() });
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSkill,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: skillKeys.list() });
    },
  });
}
