"use client";

import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { AgentNode } from "@/modules/builder/components/nodes/agent-node";
import { EndNode } from "@/modules/builder/components/nodes/end-node";
import { StartNode } from "@/modules/builder/components/nodes/start-node";
import { useCanvasStore } from "@/modules/builder/store/canvas-store";
import {
  getNodeTraceStatus,
  useTraceStore,
} from "@/modules/builder/store/trace-store";

const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  end: EndNode,
};

function withTrace(nodes: Node[], entries: ReturnType<typeof useTraceStore.getState>["entries"], activeNodeId: string | null) {
  return nodes.map((n) => ({
    ...n,
    data: {
      ...n.data,
      traceStatus: getNodeTraceStatus(n.id, entries, activeNodeId),
    },
  }));
}

export function AgentCanvas() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const selectNode = useCanvasStore((s) => s.selectNode);
  const traceEntries = useTraceStore((s) => s.entries);
  const activeNodeId = useTraceStore((s) => s.activeNodeId);

  const tracedNodes = withTrace(nodes, traceEntries, activeNodeId);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={tracedNodes}
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
