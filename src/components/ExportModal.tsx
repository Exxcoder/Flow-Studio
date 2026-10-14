import { Check, Copy, X } from "lucide-react";
import { useMemo, useState } from "react";
import { buildLlmPrompt } from "../lib/prompt";
import { useProjectStore } from "../store/projectStore";

export function ExportModal() {
  const open = useProjectStore((s) => s.exportOpen);
  const setExportOpen = useProjectStore((s) => s.setExportOpen);
  const name = useProjectStore((s) => s.name);
  const nodes = useProjectStore((s) => s.nodes);
  const connections = useProjectStore((s) => s.connections);
  const [copied, setCopied] = useState(false);

  const prompt = useMemo(
    () => buildLlmPrompt(name, nodes, connections),
    [name, nodes, connections],
  );

  if (!open) return null;

  async function copy() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-8">
      <div className="glass flex max-h-full w-full max-w-3xl flex-col rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-cyan-200">Экспорт для AI / Выгрузка</h2>
            <p className="text-xs text-slate-500">Топологический обход графа → LLM-ready Markdown</p>
          </div>
          <button onClick={() => setExportOpen(false)} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
        <pre className="flex-1 overflow-auto px-5 py-4 font-mono text-[11px] leading-5 text-slate-200">
          {prompt}
        </pre>
        <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
          <button
            onClick={copy}
            className="inline-flex items-center gap-2 rounded-md bg-cyan-400 px-3 py-1.5 text-sm font-medium text-slate-950"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? "Скопировано" : "Копировать в буфер"}
          </button>
        </div>
      </div>
    </div>
  );
}
