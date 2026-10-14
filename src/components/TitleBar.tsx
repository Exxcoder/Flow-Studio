import { Minus, Square, X } from "lucide-react";
import { useEffect, useState } from "react";
import { isTauri } from "../lib/io";

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    void (async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      setMaximized(await win.isMaximized());
      unlisten = await win.onResized(async () => {
        setMaximized(await win.isMaximized());
      });
    })();
    return () => unlisten?.();
  }, []);

  async function minimize() {
    if (!isTauri()) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().minimize();
  }

  async function toggleMax() {
    if (!isTauri()) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    if (await win.isMaximized()) await win.unmaximize();
    else await win.maximize();
  }

  async function close() {
    if (!isTauri()) return;
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    await getCurrentWindow().close();
  }

  return (
    <header
      data-tauri-drag-region
      className="titlebar-drag flex h-10 shrink-0 items-center border-b border-white/10 bg-[#090D16]"
    >
      <div data-tauri-drag-region className="flex items-center gap-2 px-3">
        <div className="h-3.5 w-3.5 rounded-sm bg-gradient-to-br from-cyan-400 to-violet-500 shadow-[0_0_12px_#06B6D4]" />
        <span className="text-xs font-semibold tracking-[0.18em] text-cyan-300/90">
          PROJECT FLOW STUDIO
        </span>
      </div>
      <div data-tauri-drag-region className="flex-1 self-stretch" />
      <div className="titlebar-no-drag flex h-full">
        <button
          className="flex h-full w-11 items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white"
          onClick={() => void minimize()}
          aria-label="Minimize"
        >
          <Minus size={14} />
        </button>
        <button
          className="flex h-full w-11 items-center justify-center text-slate-400 hover:bg-white/5 hover:text-white"
          onClick={() => void toggleMax()}
          aria-label="Maximize"
        >
          <Square size={11} className={maximized ? "opacity-80" : ""} />
        </button>
        <button
          className="flex h-full w-11 items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white"
          onClick={() => void close()}
          aria-label="Close"
        >
          <X size={14} />
        </button>
      </div>
    </header>
  );
}
