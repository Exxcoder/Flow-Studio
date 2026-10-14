import { Trash2 } from "lucide-react";
import { STATUS_LABEL, type NodeStatus } from "../types";
import { useProjectStore } from "../store/projectStore";

const STATUSES: NodeStatus[] = ["queued", "in_progress", "done"];

export function Inspector() {
  const node = useProjectStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId) ?? null);
  const shape = useProjectStore((s) => s.shapes.find((n) => n.id === s.selectedShapeId) ?? null);
  const updateNode = useProjectStore((s) => s.updateNode);
  const setStatus = useProjectStore((s) => s.setStatus);
  const removeNode = useProjectStore((s) => s.removeNode);
  const addChecklistItem = useProjectStore((s) => s.addChecklistItem);
  const removeChecklistItem = useProjectStore((s) => s.removeChecklistItem);
  const toggleChecklist = useProjectStore((s) => s.toggleChecklist);
  const updateShape = useProjectStore((s) => s.updateShape);
  const removeShape = useProjectStore((s) => s.removeShape);

  if (!node && !shape) {
    return (
      <aside className="glass m-3 hidden w-72 rounded-2xl p-4 text-xs text-slate-500 xl:block">
        Выберите карточку этапа, чтобы править заголовок, статус и чек-лист. Тяните магнитные порты
        для связи A → B.
      </aside>
    );
  }

  if (shape && !node) {
    return (
      <aside className="glass m-3 w-72 rounded-2xl p-4">
        <h3 className="mb-3 text-xs tracking-widest text-violet-300">ЭЛЕМЕНТ</h3>
        <label className="text-[10px] uppercase text-slate-500">Подпись</label>
        <input
          value={shape.label}
          onChange={(e) => updateShape(shape.id, { label: e.target.value })}
          className="mb-3 mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm outline-none"
        />
        <button
          onClick={() => removeShape(shape.id)}
          className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
        >
          <Trash2 size={13} /> Удалить
        </button>
      </aside>
    );
  }

  if (!node) return null;

  return (
    <aside className="glass m-3 w-72 overflow-auto rounded-2xl p-4">
      <h3 className="mb-3 text-xs tracking-widest text-cyan-300">ЭТАП {node.number}</h3>
      <label className="text-[10px] uppercase text-slate-500">Заголовок</label>
      <input
        value={node.title}
        onChange={(e) => updateNode(node.id, { title: e.target.value })}
        className="mb-3 mt-1 w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-sm outline-none"
      />
      <label className="text-[10px] uppercase text-slate-500">Статус</label>
      <div className="mb-3 mt-1 grid grid-cols-3 gap-1">
        {STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => setStatus(node.id, st)}
            className={`rounded-md px-1 py-1 text-[10px] ${
              node.status === st ? "bg-cyan-400/20 text-cyan-200" : "bg-white/5 text-slate-400"
            }`}
          >
            {STATUS_LABEL[st]}
          </button>
        ))}
      </div>
      <label className="text-[10px] uppercase text-slate-500">Описание</label>
      <textarea
        value={node.description}
        onChange={(e) => updateNode(node.id, { description: e.target.value })}
        className="mb-3 mt-1 h-24 w-full resize-none rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none"
      />
      <label className="text-[10px] uppercase text-slate-500">Чек-лист</label>
      <ul className="mt-1 space-y-1">
        {node.checklist.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleChecklist(node.id, item.id)}
              className="accent-emerald-400"
            />
            <span className="flex-1">{item.text}</span>
            <button className="text-slate-500" onClick={() => removeChecklistItem(node.id, item.id)}>
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.elements.namedItem("item") as HTMLInputElement;
          if (input.value.trim()) {
            addChecklistItem(node.id, input.value.trim());
            input.value = "";
          }
        }}
      >
        <input
          name="item"
          placeholder="Новый пункт…"
          className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1.5 text-xs outline-none"
        />
      </form>
      <button
        onClick={() => removeNode(node.id)}
        className="mt-4 inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
      >
        <Trash2 size={13} /> Удалить этап
      </button>
    </aside>
  );
}
