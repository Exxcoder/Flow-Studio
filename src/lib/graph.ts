import type { Connection, FlowNode } from "../types";

export function topologicalOrder(nodes: FlowNode[], connections: Connection[]): FlowNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, string[]>();

  for (const n of nodes) {
    incoming.set(n.id, 0);
    outgoing.set(n.id, []);
  }

  for (const c of connections) {
    if (!byId.has(c.from.nodeId) || !byId.has(c.to.nodeId)) continue;
    if (c.from.nodeId === c.to.nodeId) continue;
    outgoing.get(c.from.nodeId)!.push(c.to.nodeId);
    incoming.set(c.to.nodeId, (incoming.get(c.to.nodeId) ?? 0) + 1);
  }

  const queue = nodes
    .filter((n) => (incoming.get(n.id) ?? 0) === 0)
    .sort((a, b) => a.number - b.number);

  const result: FlowNode[] = [];
  const seen = new Set<string>();

  while (queue.length) {
    const node = queue.shift()!;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    result.push(node);
    for (const nextId of outgoing.get(node.id) ?? []) {
      const nextCount = (incoming.get(nextId) ?? 1) - 1;
      incoming.set(nextId, nextCount);
      if (nextCount === 0) {
        const next = byId.get(nextId);
        if (next) queue.push(next);
      }
    }
    queue.sort((a, b) => a.number - b.number);
  }

  const leftover = nodes.filter((n) => !seen.has(n.id)).sort((a, b) => a.number - b.number);
  return [...result, ...leftover];
}

export function successors(
  nodeId: string,
  connections: Connection[],
  nodes: FlowNode[],
): FlowNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return connections
    .filter((c) => c.from.nodeId === nodeId)
    .map((c) => byId.get(c.to.nodeId))
    .filter((n): n is FlowNode => Boolean(n));
}
