import type { BuilderDefinition } from "@/modules/workflows/lib/schema";

function reachesEnd(def: BuilderDefinition, startId: string, endId: string) {
  const visited = new Set<string>();

  function walk(nodeId: string): boolean {
    if (nodeId === endId) return true;
    if (visited.has(nodeId)) return false;
    visited.add(nodeId);

    const node = def.nodes.find((n) => n.id === nodeId);
    if (node?.type === "condition") {
      const trueEdge = def.edges.find(
        (e) => e.source === nodeId && e.sourceHandle === "true"
      );
      const falseEdge = def.edges.find(
        (e) => e.source === nodeId && e.sourceHandle === "false"
      );
      if (!trueEdge || !falseEdge) return false;
      return walk(trueEdge.target) && walk(falseEdge.target);
    }

    const nextEdges = def.edges.filter((e) => e.source === nodeId && !e.sourceHandle);
    if (nextEdges.length === 0) return false;
    return nextEdges.every((e) => walk(e.target));
  }

  return walk(startId);
}

export function validateGraph(def: BuilderDefinition) {
  const starts = def.nodes.filter((n) => n.type === "start");
  const ends = def.nodes.filter((n) => n.type === "end");

  if (starts.length !== 1) {
    throw new Error("Workflow needs exactly one Start node");
  }

  if (ends.length !== 1) {
    throw new Error("Workflow needs exactly one End node");
  }

  const startId = starts[0].id;
  const endId = ends[0].id;

  const agents = def.nodes.filter((n) => n.type === "agent");
  if (agents.length === 0) {
    throw new Error("Workflow needs at least one Agent node");
  }

  for (const node of def.nodes) {
    if (node.type === "condition") {
      const trueEdge = def.edges.find(
        (e) => e.source === node.id && e.sourceHandle === "true"
      );
      const falseEdge = def.edges.find(
        (e) => e.source === node.id && e.sourceHandle === "false"
      );
      if (!trueEdge || !falseEdge) {
        throw new Error(`Condition ${node.id} needs true and false branches`);
      }
    }
  }

  if (!reachesEnd(def, startId, endId)) {
    throw new Error("All paths must reach End");
  }

  return true;
}
