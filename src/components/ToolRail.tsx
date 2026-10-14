import {
  ArrowUpRight,
  Eraser,
  Frame,
  Hand,
  Minus,
  MousePointer2,
  PenLine,
  PlusSquare,
  Spline,
  StickyNote,
} from "lucide-react";
import type { Tool } from "../types";
import { useProjectStore } from "../store/projectStore";

const TOOLS: { id: Tool; icon: typeof PenLine; label: string; hint: string }[] = [
  { id: "select", icon: MousePointer2, label: "Выбор", hint: "V" },
  { id: "pan", icon: Hand, label: "Панорама", hint: "H / Space" },
  { id: "node", icon: PlusSquare, label: "Новый этап", hint: "N" },
  { id: "pen", icon: PenLine, label: "Карандаш", hint: "P" },
  { id: "marker", icon: Spline, label: "Маркер", hint: "M" },
  { id: "eraser", icon: Eraser, label: "Ластик", hint: "E" },
  { id: "line", icon: Minus, label: "Линия", hint: "L" },
  { id: "arrow", icon: ArrowUpRight, label: "Стрелка", hint: "A" },
  { id: "frame", icon: Frame, label: "Рамка", hint: "G" },
  { id: "sticker", icon: StickyNote, label: "Стикер", hint: "S" },
];

const COLORS = ["#06B6D4", "#8B5CF6", "#10B981", "#F43F5E", "#FDE047", "#F8FAFC"];

export function ToolRail() {
  const tool = useProjectStore((s) => s.tool);
  const setTool = useProjectStore((s) => s.setTool);
  const brushColor = useProjectStore((s) => s.brushColor);
  const brushWidth = useProjectStore((s) => s.brushWidth);
  const setBrush = useProjectStore((s) => s.setBrush);

  return (
    <aside className="glass m-3 flex w-16 flex-col items-center gap-1 rounded-2xl py-3">
      {TOOLS.map((t) => {
        const Icon = t.icon;
        const active = tool === t.id;
        return (
          <button
            key={t.id}
            title={`${t.label} (${t.hint})`}
            onClick={() => setTool(t.id)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              active
                ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_16px_rgba(6,182,212,0.25)]"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
      <div className="my-2 h-px w-8 bg-white/10" />
      {COLORS.map((c) => (
        <button
          key={c}
          onClick={() => setBrush({ brushColor: c })}
          className="h-5 w-5 rounded-full border border-white/20"
          style={{
            background: c,
            outline: brushColor === c ? "2px solid #06B6D4" : undefined,
            outlineOffset: 2,
          }}
        />
      ))}
      <input
        type="range"
        min={1}
        max={16}
        value={brushWidth}
        onChange={(e) => setBrush({ brushWidth: Number(e.target.value) })}
        className="mt-3 w-10 accent-cyan-400"
        title="Толщина штриха"
      />
    </aside>
  );
}
