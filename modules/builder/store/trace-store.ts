"use client";

import { create } from "zustand";

export type TraceEntry = {
  nodeId: string;
  nodeType: string;
  status: "running" | "completed" | "failed";
  error?: string;
  at: number;
};

type TraceStore = {
  entries: TraceEntry[];
  activeNodeId: string | null;
  reset: () => void;
  onNodeStarted: (nodeId: string, nodeType: string) => void;
  onNodeCompleted: (nodeId: string, nodeType: string) => void;
  onNodeFailed: (nodeId: string, nodeType: string, error: string) => void;
  loadHistory: (entries: TraceEntry[]) => void;
};

export const useTraceStore = create<TraceStore>((set) => ({
  entries: [],
  activeNodeId: null,

  reset() {
    set({ entries: [], activeNodeId: null });
  },

  onNodeStarted(nodeId, nodeType) {
    set((s) => ({
      activeNodeId: nodeId,
      entries: [
        ...s.entries,
        { nodeId, nodeType, status: "running", at: Date.now() },
      ],
    }));
  },

  onNodeCompleted(nodeId, nodeType) {
    set((s) => ({
      activeNodeId: null,
      entries: s.entries.map((e) =>
        e.nodeId === nodeId && e.status === "running"
          ? { ...e, status: "completed" as const }
          : e
      ),
    }));
  },

  onNodeFailed(nodeId, nodeType, error) {
    set((s) => ({
      activeNodeId: null,
      entries: s.entries.map((e) =>
        e.nodeId === nodeId && e.status === "running"
          ? { ...e, status: "failed" as const, error }
          : e
      ),
    }));
  },

  loadHistory(entries) {
    set({ entries, activeNodeId: null });
  },
}));

export function getNodeTraceStatus(nodeId: string, entries: TraceEntry[], activeNodeId: string | null) {
  if (activeNodeId === nodeId) return "running";
  const last = [...entries].reverse().find((e) => e.nodeId === nodeId);
  return last?.status ?? null;
}
