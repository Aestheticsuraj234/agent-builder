import type { BuilderDefinition } from "@/modules/workflows/lib/schema";

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
  const nodeIds = new Set(def.nodes.map((n) => n.id));

  for (const edge of def.edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      throw new Error("Edge points to unknown node");
    }
  }

  let current = startId;
  const visited = new Set<string>();

  while (current !== endId) {
    if (visited.has(current)) {
      throw new Error("Workflow has a cycle");
    }
    visited.add(current);

    const next = def.edges.find((e) => e.source === current);
    if (!next) {
      throw new Error("No path from Start to End");
    }
    current = next.target;
  }

  const agents = def.nodes.filter((n) => n.type === "agent");
  if (agents.length === 0) {
    throw new Error("Workflow needs at least one Agent node");
  }

  return true;
}
