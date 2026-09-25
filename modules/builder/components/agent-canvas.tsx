"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "@/modules/builder/components/nodes/agent-node";
import { MemoryNode } from "@/modules/builder/components/nodes/memory-node";
import { ModelNode } from "@/modules/builder/components/nodes/model-node";
import { ToolNode } from "@/modules/builder/components/nodes/tool-node";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";

const nodeTypes: NodeTypes = {
  agent: AgentNode,
  model: ModelNode,
  tool: ToolNode,
  memory: MemoryNode,
};

export function AgentCanvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const selectNode = useCanvasStore((s) => s.selectNode);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}
