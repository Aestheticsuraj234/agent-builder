"use client";

import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import type { AgentDefinition } from "@/modules/agents/lib/definition";
import { canvasToDefinition, definitionToCanvas } from "@/modules/builder/lib/serialize";
import { getToolLabel } from "@/modules/builder/lib/tools-catalog";

type CanvasStore = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  init: (definition: AgentDefinition, canvas: any) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  addTool: (toolId: string) => void;
  toggleMemory: () => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  removeSelectedNode: () => void;
  getDefinition: () => AgentDefinition;
  getCanvas: () => { nodes: Node[]; edges: Edge[] };
  markClean: () => void;
};

function canConnect(connection: Connection, nodes: Node[]) {
  const source = nodes.find((n) => n.id === connection.source);
  const target = nodes.find((n) => n.id === connection.target);

  if (!source || !target) return false;
  if (target.type !== "agent") return false;
  if (source.type === "agent") return false;

  return source.type === "model" || source.type === "tool" || source.type === "memory";
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,

  init(definition, canvas) {
    const { nodes, edges } = definitionToCanvas(definition, canvas);
    set({ nodes, edges, selectedNodeId: null, isDirty: false });
  },

  onNodesChange(changes) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
      isDirty: true,
    });
  },

  onEdgesChange(changes) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
      isDirty: true,
    });
  },

  onConnect(connection) {
    if (!canConnect(connection, get().nodes)) return;

    set({
      edges: addEdge(connection, get().edges),
      isDirty: true,
    });
  },

  selectNode(nodeId) {
    set({ selectedNodeId: nodeId });
  },

  addTool(toolId) {
    const { nodes, edges } = get();
    const nodeId = `tool-${toolId}`;

    if (nodes.some((n) => n.id === nodeId)) return;

    const toolCount = nodes.filter((n) => n.type === "tool").length;

    set({
      nodes: [
        ...nodes,
        {
          id: nodeId,
          type: "tool",
          position: { x: 40, y: 120 + toolCount * 90 },
          data: { label: getToolLabel(toolId), toolId },
        },
      ],
      edges: [...edges, { id: `e-${nodeId}-agent`, source: nodeId, target: "agent" }],
      isDirty: true,
    });
  },

  toggleMemory() {
    const { nodes, edges } = get();
    const hasMemory = nodes.some((n) => n.type === "memory");

    if (hasMemory) {
      set({
        nodes: nodes.filter((n) => n.type !== "memory"),
        edges: edges.filter((e) => e.source !== "memory"),
        selectedNodeId: get().selectedNodeId === "memory" ? null : get().selectedNodeId,
        isDirty: true,
      });
      return;
    }

    set({
      nodes: [
        ...nodes,
        {
          id: "memory",
          type: "memory",
          position: { x: 520, y: 220 },
          data: { label: "Memory", enabled: true },
        },
      ],
      edges: [...edges, { id: "e-memory-agent", source: "memory", target: "agent" }],
      isDirty: true,
    });
  },

  updateNodeData(nodeId, data) {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
      isDirty: true,
    });
  },

  removeSelectedNode() {
    const { selectedNodeId, nodes, edges } = get();
    if (!selectedNodeId || selectedNodeId === "agent") return;

    set({
      nodes: nodes.filter((n) => n.id !== selectedNodeId),
      edges: edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId),
      selectedNodeId: null,
      isDirty: true,
    });
  },

  getDefinition() {
    const { nodes, edges } = get();
    return canvasToDefinition(nodes, edges);
  },

  getCanvas() {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  markClean() {
    set({ isDirty: false });
  },
}));
