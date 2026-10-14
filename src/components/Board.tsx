import { useEffect, useMemo, useRef, useState } from "react";
import { clamp, nearestPort, screenToWorld } from "../lib/geometry";
import { GRID, MAX_ZOOM, MIN_ZOOM, type Endpoint, type Point, type PortSide, type ShapeType } from "../types";
import { useProjectStore } from "../store/projectStore";
import { BrushLayer } from "./BrushLayer";
import { ConnectionLayer } from "./ConnectionLayer";
import { NodeCard } from "./NodeCard";
import { ShapeLayer } from "./ShapeLayer";

export function Board() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [draft, setDraft] = useState<{
    from: Endpoint;
    to: Point;
    toPort: PortSide;
  } | null>(null);
  const [shapeStart, setShapeStart] = useState<Point | null>(null);

  const camera = useProjectStore((s) => s.camera);
  const setCamera = useProjectStore((s) => s.setCamera);
  const tool = useProjectStore((s) => s.tool);
  const spaceDown = useProjectStore((s) => s.spaceDown);
  const nodes = useProjectStore((s) => s.nodes);
  const connections = useProjectStore((s) => s.connections);
  const strokes = useProjectStore((s) => s.strokes);
  const shapes = useProjectStore((s) => s.shapes);
  const selectedNodeId = useProjectStore((s) => s.selectedNodeId);
  const draftStroke = useProjectStore((s) => s.draftStroke);
  const brushWidth = useProjectStore((s) => s.brushWidth);

  const addNodeAt = useProjectStore((s) => s.addNodeAt);
  const moveNode = useProjectStore((s) => s.moveNode);
  const selectNode = useProjectStore((s) => s.selectNode);
  const addConnection = useProjectStore((s) => s.addConnection);
  const beginStroke = useProjectStore((s) => s.beginStroke);
  const appendStroke = useProjectStore((s) => s.appendStroke);
  const commitStroke = useProjectStore((s) => s.commitStroke);
  const eraseAt = useProjectStore((s) => s.eraseAt);
  const addShape = useProjectStore((s) => s.addShape);
  const selectShape = useProjectStore((s) => s.selectShape);

  const panRef = useRef<{
    sx: number;
    sy: number;
    cx: number;
    cy: number;
  } | null>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    const onNativeWheel = (ev: WheelEvent) => {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
    };
    el.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      ro.disconnect();
      el.removeEventListener("wheel", onNativeWheel);
    };
  }, []);

  const gridStyle = useMemo(() => {
    const sizePx = GRID * camera.zoom;
    return {
      backgroundColor: "#090D16",
      backgroundImage: [
        `radial-gradient(circle, rgba(6,182,212,0.22) 1px, transparent 1.2px)`,
        `linear-gradient(rgba(15,23,42,0.55) 1px, transparent 1px)`,
        `linear-gradient(90deg, rgba(15,23,42,0.55) 1px, transparent 1px)`,
      ].join(","),
      backgroundSize: `${sizePx}px ${sizePx}px, ${sizePx * 4}px ${sizePx * 4}px, ${sizePx * 4}px ${sizePx * 4}px`,
      backgroundPosition: `${camera.x}px ${camera.y}px`,
    } as const;
  }, [camera]);

  function localPoint(e: { clientX: number; clientY: number }): Point {
    const r = rootRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  function worldOf(e: { clientX: number; clientY: number }): Point {
    const p = localPoint(e);
    return screenToWorld(p.x, p.y, camera.x, camera.y, camera.zoom);
  }

  function isPanEvent(e: React.PointerEvent) {
    return e.button === 1 || tool === "pan" || (spaceDown && e.button === 0);
  }

  function onWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) {
      setCamera({ ...camera, x: camera.x - e.deltaX, y: camera.y - e.deltaY });
      return;
    }
    e.preventDefault();
    const p = localPoint(e);
    const world = screenToWorld(p.x, p.y, camera.x, camera.y, camera.zoom);
    const next = clamp(camera.zoom * (e.deltaY < 0 ? 1.08 : 0.92), MIN_ZOOM, MAX_ZOOM);
    setCamera({
      zoom: next,
      x: p.x - world.x * next,
      y: p.y - world.y * next,
    });
  }

  function onPointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    if (isPanEvent(e)) {
      panRef.current = { sx: e.clientX, sy: e.clientY, cx: camera.x, cy: camera.y };
      return;
    }
    if (e.button !== 0) return;
    const w = worldOf(e);

    if (tool === "pen" || tool === "marker") {
      beginStroke(w, tool);
      return;
    }
    if (tool === "eraser") {
      eraseAt(w, brushWidth * 2);
      beginStroke(w, "eraser");
      return;
    }
    if (tool === "node") {
      addNodeAt(w.x - 140, w.y - 40);
      return;
    }
    if (tool === "sticker") {
      addShape("sticker", w, { x: w.x + 160, y: w.y + 110 }, "Заметка");
      return;
    }
    if (tool === "line" || tool === "arrow" || tool === "frame") {
      setShapeStart(w);
      return;
    }
    selectNode(null);
    selectShape(null);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (panRef.current) {
      const d = panRef.current;
      setCamera({
        ...camera,
        x: d.cx + (e.clientX - d.sx),
        y: d.cy + (e.clientY - d.sy),
      });
      return;
    }
    const w = worldOf(e);
    if (dragRef.current) {
      moveNode(dragRef.current.id, w.x - dragRef.current.ox, w.y - dragRef.current.oy);
      return;
    }
    if (draft) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const portEl = el?.closest("[data-port]") as HTMLElement | null;
      const nodeId = portEl?.getAttribute("data-node-id");
      const port = portEl?.getAttribute("data-port") as PortSide | null;
      if (nodeId && port) {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) {
          setDraft({ from: draft.from, to: w, toPort: port });
          return;
        }
      }
      const over = nodes.find(
        (n) => w.x >= n.x && w.x <= n.x + n.width && w.y >= n.y && w.y <= n.y + n.height,
      );
      setDraft({
        from: draft.from,
        to: w,
        toPort: over ? nearestPort(over, w) : "left",
      });
      return;
    }
    if (useProjectStore.getState().draftStroke) {
      if (tool === "eraser") eraseAt(w, brushWidth * 2);
      else appendStroke(w);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    panRef.current = null;
    dragRef.current = null;
    commitStroke();
    if (draft) {
      const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      const portEl = el?.closest("[data-port]") as HTMLElement | null;
      const nodeId = portEl?.getAttribute("data-node-id");
      const port = portEl?.getAttribute("data-port") as PortSide | null;
      if (nodeId && port && nodeId !== draft.from.nodeId) {
        addConnection(draft.from, { nodeId, port });
      } else {
        const w = worldOf(e);
        const over = nodes.find(
          (n) => w.x >= n.x && w.x <= n.x + n.width && w.y >= n.y && w.y <= n.y + n.height,
        );
        if (over && over.id !== draft.from.nodeId) {
          addConnection(draft.from, { nodeId: over.id, port: nearestPort(over, w) });
        }
      }
      setDraft(null);
    }
    if (shapeStart && (tool === "line" || tool === "arrow" || tool === "frame")) {
      const w = worldOf(e);
      if (Math.hypot(w.x - shapeStart.x, w.y - shapeStart.y) > 8) {
        addShape(tool as ShapeType, shapeStart, w);
      }
      setShapeStart(null);
    }
  }

  return (
    <div
      id="flow-board"
      ref={rootRef}
      className="relative h-full w-full overflow-hidden"
      style={{
        ...gridStyle,
        cursor: spaceDown || tool === "pan" ? "grab" : tool === "pen" || tool === "marker" ? "crosshair" : "default",
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      <BrushLayer
        camera={camera}
        strokes={strokes}
        draft={draftStroke}
        width={size.w}
        height={size.h}
      />
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})` }}
      >
        <ShapeLayer shapes={shapes} />
        <ConnectionLayer nodes={nodes} connections={connections} draft={draft} />
        {nodes.map((n) => (
          <NodeCard
            key={n.id}
            node={n}
            selected={selectedNodeId === n.id}
            onPortDown={(nodeId, port, ev) => {
              ev.preventDefault();
              rootRef.current?.setPointerCapture(ev.pointerId);
              setDraft({
                from: { nodeId, port },
                to: worldOf(ev),
                toPort: port === "right" ? "left" : "right",
              });
            }}
            onNodeDown={(node, ev) => {
              if (ev.button !== 0 || spaceDown) return;
              ev.stopPropagation();
              rootRef.current?.setPointerCapture(ev.pointerId);
              selectNode(node.id);
              const w = worldOf(ev);
              dragRef.current = { id: node.id, ox: w.x - node.x, oy: w.y - node.y };
            }}
          />
        ))}
      </div>
    </div>
  );
}
