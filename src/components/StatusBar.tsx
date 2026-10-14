import { useProjectStore } from "../store/projectStore";

export function StatusBar() {
  const zoom = useProjectStore((s) => s.camera.zoom);
  const tool = useProjectStore((s) => s.tool);
  const nodes = useProjectStore((s) => s.nodes.length);
  const links = useProjectStore((s) => s.connections.length);

  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-[#090D16] px-3 font-mono text-[10px] tracking-wide text-slate-500">
      <span>TOOL {tool.toUpperCase()}</span>
      <span>
        NODES {nodes} · EDGES {links}
      </span>
      <span>ZOOM {Math.round(zoom * 100)}%</span>
      <span>PAN: MMB / SPACE+LMB · ZOOM: CTRL+WHEEL</span>
    </footer>
  );
}
