import { bezierPath, portPoint } from "../lib/geometry";
import type { Connection, Endpoint, FlowNode, Point, PortSide } from "../types";
import { useProjectStore } from "../store/projectStore";

interface Props {
  nodes: FlowNode[];
  connections: Connection[];
  draft: { from: Endpoint; to: Point; toPort: PortSide } | null;
}

export function ConnectionLayer({ nodes, connections, draft }: Props) {
  const selectedConnectionId = useProjectStore((s) => s.selectedConnectionId);
  const selectConnection = useProjectStore((s) => s.selectConnection);
  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <svg className="pointer-events-none absolute inset-0 h-[8000px] w-[8000px] overflow-visible">
      <defs>
        <marker id="flow-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#06B6D4" />
        </marker>
        <marker id="flow-arrow-hot" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="#A78BFA" />
        </marker>
      </defs>
      {connections.map((c) => {
        const fromNode = byId.get(c.from.nodeId);
        const toNode = byId.get(c.to.nodeId);
        if (!fromNode || !toNode) return null;
        const a = portPoint(fromNode, c.from.port);
        const b = portPoint(toNode, c.to.port);
        const d = bezierPath(a, c.from.port, b, c.to.port);
        const hot = selectedConnectionId === c.id;
        return (
          <path
            key={c.id}
            d={d}
            fill="none"
            stroke={hot ? "#A78BFA" : "#06B6D4"}
            strokeWidth={hot ? 3.2 : 2.1}
            markerEnd={hot ? "url(#flow-arrow-hot)" : "url(#flow-arrow)"}
            className="pointer-events-auto cursor-pointer"
            onPointerDown={(e) => {
              e.stopPropagation();
              selectConnection(c.id);
            }}
          />
        );
      })}
      {draft &&
        (() => {
          const fromNode = byId.get(draft.from.nodeId);
          if (!fromNode) return null;
          const a = portPoint(fromNode, draft.from.port);
          return (
            <path
              d={bezierPath(a, draft.from.port, draft.to, draft.toPort)}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth={2}
              strokeDasharray="6 4"
              markerEnd="url(#flow-arrow-hot)"
            />
          );
        })()}
    </svg>
  );
}
