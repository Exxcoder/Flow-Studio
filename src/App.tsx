import { useEffect } from "react";
import { Board } from "./components/Board";
import { ExportModal } from "./components/ExportModal";
import { Inspector } from "./components/Inspector";
import { StatusBar } from "./components/StatusBar";
import { TitleBar } from "./components/TitleBar";
import { ToolRail } from "./components/ToolRail";
import { Toolbar } from "./components/Toolbar";
import { openProjectFile, saveProjectFile } from "./lib/io";
import { useProjectStore } from "./store/projectStore";
import type { Tool } from "./types";

const HOTKEYS: Record<string, Tool> = {
  v: "select",
  h: "pan",
  p: "pen",
  m: "marker",
  e: "eraser",
  n: "node",
  l: "line",
  a: "arrow",
  g: "frame",
  s: "sticker",
};

export default function App() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      const store = useProjectStore.getState();

      if (e.code === "Space" && !typing) {
        e.preventDefault();
        store.setSpaceDown(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveProjectFile(store.toDocument());
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "o") {
        e.preventDefault();
        void openProjectFile().then((doc) => doc && store.loadDocument(doc));
        return;
      }
      if (typing) return;
      if (e.key === "Delete" || e.key === "Backspace") store.deleteSelection();
      if (e.key === "Escape") {
        store.setTool("select");
        store.selectNode(null);
        store.setExportOpen(false);
      }
      const tool = HOTKEYS[e.key.toLowerCase()];
      if (tool && !e.ctrlKey && !e.metaKey) store.setTool(tool);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") useProjectStore.getState().setSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#090D16]">
      <TitleBar />
      <Toolbar />
      <div className="flex min-h-0 flex-1">
        <ToolRail />
        <div className="relative min-w-0 flex-1">
          <Board />
          <ExportModal />
        </div>
        <Inspector />
      </div>
      <StatusBar />
    </div>
  );
}
