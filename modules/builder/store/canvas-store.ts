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
import type { BuilderDefinition } from "@/modules/workflows/lib/schema";
import {
  canvasToAgentDefinition,
  canvasToBuilderDefinition,
  loadCanvasFromDraft,
} from "@/modules/builder/lib/serialize";
import { defaultCustomToolConfig } from "@/modules/builder/lib/custom-tool";

type ToolEntry = { toolId: string; config: Record<string, unknown> };

type CanvasStore = {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  selectedToolIndex: number | null;
  memoryEnabled: boolean;
  limits: BuilderDefinition["limits"];
  isDirty: boolean;
  init: (draftDefinition: unknown, canvas: any) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId: string | null) => void;
  selectTool: (index: number | null) => void;
  getAgentNodeId: () => string;
  addTool: (toolId: string) => void;
  addCustomTool: () => void;
  removeTool: (index: number) => void;
  updateTool: (index: number, config: Record<string, unknown>) => void;
  toggleMemory: () => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  getDefinition: () => BuilderDefinition;
  getAgentDefinition: () => AgentDefinition;
  getCanvas: () => { nodes: Node[]; edges: Edge[] };
  markClean: () => void;
};

function getAgentNode(nodes: Node[]) {
  return nodes.find((n) => n.type === "agent");
}

function updateAgentData(nodes: Node[], agentId: string, patch: Record<string, unknown>) {
  return nodes.map((node) =>
    node.id === agentId ? { ...node, data: { ...node.data, ...patch } } : node
  );
}

function canConnect(connection: Connection, nodes: Node[]) {
  const source = nodes.find((n) => n.id === connection.source);
  const target = nodes.find((n) => n.id === connection.target);
  if (!source || !target) return false;

  if (source.type === "start" && target.type === "agent") return true;
  if (source.type === "agent" && target.type === "end") return true;

  return false;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedToolIndex: null,
  memoryEnabled: false,
  limits: { maxGraphSteps: 10, maxToolCalls: 5, timeoutMs: 60000 },
  isDirty: false,

  init(draftDefinition, canvas) {
    const { nodes, edges } = loadCanvasFromDraft(draftDefinition, canvas);
    const builder = canvasToBuilderDefinition(nodes, edges);
    const agentNode = getAgentNode(nodes);

    set({
      nodes: agentNode
        ? updateAgentData(nodes, agentNode.id, { memoryEnabled: builder.memory.enabled })
        : nodes,
      edges,
      selectedNodeId: null,
      selectedToolIndex: null,
      memoryEnabled: builder.memory.enabled,
      limits: builder.limits,
      isDirty: false,
    });
  },

  onNodesChange(changes) {
    const filtered = changes.filter((change) => {
      if (change.type !== "remove") return true;
      const node = get().nodes.find((n) => n.id === change.id);
      return node?.type !== "start" && node?.type !== "agent" && node?.type !== "end";
    });

    set({
      nodes: applyNodeChanges(filtered, get().nodes),
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
      edges: addEdge({ ...connection, animated: true }, get().edges),
      isDirty: true,
    });
  },

  selectNode(nodeId) {
    set({ selectedNodeId: nodeId, selectedToolIndex: null });
  },

  selectTool(index) {
    set({ selectedToolIndex: index });
  },

  getAgentNodeId() {
    return getAgentNode(get().nodes)?.id ?? "agent";
  },

  addTool(toolId) {
    const agentNode = getAgentNode(get().nodes);
    if (!agentNode) return;

    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    if (tools.some((t) => t.toolId === toolId)) return;

    const nextTools = [...tools, { toolId, config: {} }];
    set({
      nodes: updateAgentData(get().nodes, agentNode.id, { tools: nextTools }),
      isDirty: true,
    });
  },

  addCustomTool() {
    const agentNode = getAgentNode(get().nodes);
    if (!agentNode) return;

    const toolId = `custom-${Date.now()}`;
    const config = defaultCustomToolConfig();
    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    const nextTools = [...tools, { toolId, config }];

    set({
      nodes: updateAgentData(get().nodes, agentNode.id, { tools: nextTools }),
      selectedNodeId: agentNode.id,
      selectedToolIndex: nextTools.length - 1,
      isDirty: true,
    });
  },

  removeTool(index) {
    const agentNode = getAgentNode(get().nodes);
    if (!agentNode) return;

    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    const nextTools = tools.filter((_, i) => i !== index);

    set({
      nodes: updateAgentData(get().nodes, agentNode.id, { tools: nextTools }),
      selectedToolIndex: null,
      isDirty: true,
    });
  },

  updateTool(index, config) {
    const agentNode = getAgentNode(get().nodes);
    if (!agentNode) return;

    const tools = (agentNode.data.tools as ToolEntry[]) ?? [];
    const nextTools = tools.map((t, i) =>
      i === index ? { ...t, config, toolId: t.toolId } : t
    );

    set({
      nodes: updateAgentData(get().nodes, agentNode.id, { tools: nextTools }),
      isDirty: true,
    });
  },

  toggleMemory() {
    const next = !get().memoryEnabled;
    const agentNode = getAgentNode(get().nodes);

    set({
      memoryEnabled: next,
      nodes: agentNode
        ? updateAgentData(get().nodes, agentNode.id, { memoryEnabled: next })
        : get().nodes,
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

  getDefinition() {
    const { nodes, edges, memoryEnabled, limits } = get();
    return canvasToBuilderDefinition(nodes, edges, { memoryEnabled, limits });
  },

  getAgentDefinition() {
    const { nodes, edges, memoryEnabled, limits } = get();
    return canvasToAgentDefinition(nodes, edges, { memoryEnabled, limits });
  },

  getCanvas() {
    const { nodes, edges } = get();
    return { nodes, edges };
  },

  markClean() {
    set({ isDirty: false });
  },
}));
