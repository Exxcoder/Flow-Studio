import type { Shape } from "../types";
import { useProjectStore } from "../store/projectStore";

export function ShapeLayer({ shapes }: { shapes: Shape[] }) {
  const selectedShapeId = useProjectStore((s) => s.selectedShapeId);
  const selectShape = useProjectStore((s) => s.selectShape);
  const updateShape = useProjectStore((s) => s.updateShape);

  return (
    <svg className="absolute inset-0 h-[8000px] w-[8000px] overflow-visible">
      <defs>
        <marker id="shape-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
          <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
        </marker>
      </defs>
      {shapes.map((s) => {
        const hot = selectedShapeId === s.id;
        const x = Math.min(s.x1, s.x2);
        const y = Math.min(s.y1, s.y2);
        const w = Math.abs(s.x2 - s.x1);
        const h = Math.abs(s.y2 - s.y1);
        if (s.type === "line" || s.type === "arrow") {
          return (
            <line
              key={s.id}
              x1={s.x1}
              y1={s.y1}
              x2={s.x2}
              y2={s.y2}
              stroke={s.color}
              strokeWidth={hot ? 3 : 2}
              markerEnd={s.type === "arrow" ? "url(#shape-arrow)" : undefined}
              className="cursor-pointer"
              onPointerDown={(e) => {
                e.stopPropagation();
                selectShape(s.id);
              }}
            />
          );
        }
        if (s.type === "frame") {
          return (
            <g key={s.id} onPointerDown={(e) => { e.stopPropagation(); selectShape(s.id); }}>
              <rect
                x={x}
                y={y}
                width={w}
                height={h}
                fill={`${s.color}14`}
                stroke={s.color}
                strokeDasharray="8 6"
                strokeWidth={hot ? 2.4 : 1.4}
                rx={16}
              />
              <text x={x + 12} y={y + 22} fill={s.color} fontSize="12">
                {s.label}
              </text>
            </g>
          );
        }
        return (
          <g key={s.id} onPointerDown={(e) => { e.stopPropagation(); selectShape(s.id); }}>
            <rect x={x} y={y} width={160} height={110} fill={s.color} rx={4} opacity={0.92} />
            <foreignObject x={x + 8} y={y + 8} width={144} height={94}>
              <textarea
                value={s.label}
                onChange={(e) => updateShape(s.id, { label: e.target.value })}
                className="h-full w-full resize-none bg-transparent text-xs text-slate-900 outline-none"
              />
            </foreignObject>
          </g>
        );
      })}
    </svg>
  );
}
