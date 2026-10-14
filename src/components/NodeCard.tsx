import type { FlowNode, PortSide } from "../types";
import { STATUS_LABEL } from "../types";
import { useProjectStore } from "../store/projectStore";

const PORTS: PortSide[] = ["top", "right", "bottom", "left"];

const STATUS_DOT: Record<FlowNode["status"], string> = {
  queued: "bg-slate-400",
  in_progress: "bg-yellow-400 shadow-[0_0_8px_#FACC15]",
  done: "bg-emerald-400 shadow-[0_0_8px_#10B981]",
};

interface Props {
  node: FlowNode;
  selected: boolean;
  onPortDown: (nodeId: string, port: PortSide, e: React.PointerEvent) => void;
  onNodeDown: (node: FlowNode, e: React.PointerEvent) => void;
}

export function NodeCard({ node, selected, onPortDown, onNodeDown }: Props) {
  const updateNode = useProjectStore((s) => s.updateNode);
  const toggleChecklist = useProjectStore((s) => s.toggleChecklist);

  return (
    <div
      data-node-id={node.id}
      className={`absolute rounded-xl border bg-[#111827]/90 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-md ${
        selected ? "border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.25)]" : "border-white/10"
      }`}
      style={{ left: node.x, top: node.y, width: node.width, minHeight: node.height }}
      onPointerDown={(e) => onNodeDown(node, e)}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/15 font-mono text-xs text-cyan-300">
          {node.number}
        </span>
        <input
          value={node.title}
          onChange={(e) => updateNode(node.id, { title: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-100 outline-none"
        />
        <span className={`h-2.5 w-2.5 rounded-full ${STATUS_DOT[node.status]}`} title={STATUS_LABEL[node.status]} />
      </div>
      <div className="px-3 py-2">
        <textarea
          value={node.description}
          onChange={(e) => updateNode(node.id, { description: e.target.value })}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder="Описание / markdown..."
          className="h-16 w-full resize-none bg-transparent text-xs leading-5 text-slate-300 outline-none placeholder:text-slate-600"
        />
        <ul className="mt-1 space-y-1">
          {node.checklist.slice(0, 4).map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-xs text-slate-300">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleChecklist(node.id, item.id)}
                onPointerDown={(e) => e.stopPropagation()}
                className="accent-emerald-400"
              />
              <span className={item.done ? "text-slate-500 line-through" : ""}>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
      {PORTS.map((port) => (
        <button
          key={port}
          data-port={port}
          data-node-id={node.id}
          title={`Порт: ${port}`}
          onPointerDown={(e) => {
            e.stopPropagation();
            onPortDown(node.id, port, e);
          }}
          className={`absolute z-10 h-3 w-3 rounded-full border-2 border-[#090D16] bg-cyan-400 hover:scale-125 ${
            port === "top"
              ? "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
              : port === "bottom"
                ? "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2"
                : port === "left"
                  ? "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  : "right-0 top-1/2 translate-x-1/2 -translate-y-1/2"
          }`}
        />
      ))}
    </div>
  );
}
