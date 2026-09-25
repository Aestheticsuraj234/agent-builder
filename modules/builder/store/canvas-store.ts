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
  addAgentNode: () => void;
  markClean: () => void;
};

function getActiveAgentNode(nodes: Node[], selectedNodeId: string | null) {
  if (selectedNodeId) {
    const selected = nodes.find((n) => n.id === selectedNodeId && n.type === "agent");
    if (selected) return selected;
  }
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
  if (source.type === "agent" && target.type === "agent") return true;
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
    set({
      nodes: nodes.map((n) =>
        n.type === "agent"
          ? { ...n, data: { ...n.data, memoryEnabled: builder.memory.enabled } }
          : n
      ),
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
    return getActiveAgentNode(get().nodes, get().selectedNodeId)?.id ?? "agent";
  },

  addTool(toolId) {
    const agentNode = getActiveAgentNode(get().nodes, get().selectedNodeId);
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
    const agentNode = getActiveAgentNode(get().nodes, get().selectedNodeId);
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
    const agentNode = getActiveAgentNode(get().nodes, get().selectedNodeId);
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
    const agentNode = getActiveAgentNode(get().nodes, get().selectedNodeId);
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

    set({
      memoryEnabled: next,
      nodes: get().nodes.map((n) =>
        n.type === "agent" ? { ...n, data: { ...n.data, memoryEnabled: next } } : n
      ),
      isDirty: true,
    });
  },

  addAgentNode() {
    const { nodes, edges } = get();
    const endNode = nodes.find((n) => n.type === "end");
    if (!endNode) return;

    const edgeToEnd = edges.find((e) => e.target === endNode.id);
    const prevId = edgeToEnd?.source;
    if (!prevId) return;

    const newId = `agent-${Date.now()}`;
    const agentCount = nodes.filter((n) => n.type === "agent").length;

    set({
      nodes: [
        ...nodes,
        {
          id: newId,
          type: "agent",
          position: { x: 280, y: 180 + agentCount * 140 },
          data: {
            label: `Agent ${agentCount + 1}`,
            instructions: "You are a helpful assistant.",
            modelId: "gpt-4o-mini",
            tools: [],
            github: { owner: "", repo: "", defaultPrNumber: "" },
            mcpConnectionIds: [],
            skillIds: [],
          },
        },
      ],
      edges: [
        ...edges.filter((e) => !(e.source === prevId && e.target === endNode.id)),
        { id: `e-${prevId}-${newId}`, source: prevId, target: newId, animated: true },
        { id: `e-${newId}-${endNode.id}`, source: newId, target: endNode.id, animated: true },
      ],
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
