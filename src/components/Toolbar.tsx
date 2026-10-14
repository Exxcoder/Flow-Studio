import type { ReactNode } from "react";
import { Download, FolderOpen, Image, Save, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { openProjectFile, savePngFile, saveProjectFile } from "../lib/io";
import { useProjectStore } from "../store/projectStore";

export function Toolbar() {
  const name = useProjectStore((s) => s.name);
  const setName = useProjectStore((s) => s.setName);
  const setExportOpen = useProjectStore((s) => s.setExportOpen);
  const toDocument = useProjectStore((s) => s.toDocument);
  const loadDocument = useProjectStore((s) => s.loadDocument);

  async function onSave() {
    await saveProjectFile(toDocument());
  }

  async function onOpen() {
    const doc = await openProjectFile();
    if (doc) loadDocument(doc);
  }

  async function onPng() {
    const el = document.getElementById("flow-board");
    if (!el) return;
    const dataUrl = await toPng(el, {
      pixelRatio: 2,
      backgroundColor: "#090D16",
    });
    await savePngFile(dataUrl, name);
  }

  return (
    <div className="glass flex h-12 shrink-0 items-center gap-3 px-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-64 rounded-md border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-slate-100 outline-none ring-cyan-400/40 focus:ring"
      />
      <div className="h-5 w-px bg-white/10" />
      <ToolBtn icon={<Save size={15} />} label="Сохранить .pflow" onClick={onSave} />
      <ToolBtn icon={<FolderOpen size={15} />} label="Открыть" onClick={onOpen} />
      <ToolBtn icon={<Image size={15} />} label="Экспорт PNG" onClick={onPng} />
      <div className="flex-1" />
      <button
        onClick={() => setExportOpen(true)}
        className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1.5 text-sm font-medium text-slate-950 shadow-[0_0_24px_rgba(6,182,212,0.35)] hover:brightness-110"
      >
        <Sparkles size={15} />
        Экспорт для AI / Выгрузка
        <Download size={14} />
      </button>
    </div>
  );
}

function ToolBtn({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200"
    >
      {icon}
      {label}
    </button>
  );
}
