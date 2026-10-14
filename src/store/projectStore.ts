import { create } from "zustand";
import { hitStroke } from "../lib/geometry";
import { uid } from "../lib/ids";
import type {
  Camera,
  ChecklistItem,
  Connection,
  DrawTool,
  Endpoint,
  FlowNode,
  NodeStatus,
  Point,
  ProjectDocument,
  Shape,
  ShapeType,
  Stroke,
  Tool,
} from "../types";

interface DraftStroke {
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  tool: DrawTool;
}

interface ProjectState {
  name: string;
  camera: Camera;
  nodes: FlowNode[];
  connections: Connection[];
  strokes: Stroke[];
  shapes: Shape[];
  tool: Tool;
  brushColor: string;
  brushWidth: number;
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  selectedShapeId: string | null;
  spaceDown: boolean;
  draftStroke: DraftStroke | null;
  exportOpen: boolean;

  setName: (name: string) => void;
  setCamera: (camera: Camera) => void;
  setTool: (tool: Tool) => void;
  setBrush: (patch: Partial<Pick<ProjectState, "brushColor" | "brushWidth">>) => void;
  setSpaceDown: (v: boolean) => void;
  setExportOpen: (v: boolean) => void;
  selectNode: (id: string | null) => void;
  selectConnection: (id: string | null) => void;
  selectShape: (id: string | null) => void;

  addNodeAt: (x: number, y: number) => string;
  updateNode: (id: string, patch: Partial<FlowNode>) => void;
  moveNode: (id: string, x: number, y: number) => void;
  removeNode: (id: string) => void;
  addChecklistItem: (nodeId: string, text: string) => void;
  toggleChecklist: (nodeId: string, itemId: string) => void;
  removeChecklistItem: (nodeId: string, itemId: string) => void;
  setStatus: (nodeId: string, status: NodeStatus) => void;

  addConnection: (from: Endpoint, to: Endpoint) => void;
  removeConnection: (id: string) => void;

  beginStroke: (point: Point, tool: DrawTool) => void;
  appendStroke: (point: Point) => void;
  commitStroke: () => void;
  eraseAt: (point: Point, radius: number) => void;

  addShape: (type: ShapeType, a: Point, b: Point, label?: string) => void;
  updateShape: (id: string, patch: Partial<Shape>) => void;
  removeShape: (id: string) => void;

  loadDocument: (doc: ProjectDocument) => void;
  toDocument: () => ProjectDocument;
  deleteSelection: () => void;
}

function sampleProject(): Pick<
  ProjectState,
  "name" | "camera" | "nodes" | "connections" | "strokes" | "shapes"
> {
  const a = uid("n");
  const b = uid("n");
  const c = uid("n");
  const nodes: FlowNode[] = [
    {
      id: a,
      number: 1,
      title: "Исследование и ТЗ",
      description: "Собрать требования, ограничения стека и критерии готовности.",
      status: "done",
      x: 180,
      y: 220,
      width: 280,
      height: 210,
      checklist: [
        { id: uid("c"), text: "Описать пользовательские сценарии", done: true },
        { id: uid("c"), text: "Зафиксировать стек Tauri + React", done: true },
      ],
    },
    {
      id: b,
      number: 2,
      title: "Архитектура холста",
      description: "Два слоя: SVG-граф (ноды/связи) и Canvas (кисть).",
      status: "in_progress",
      x: 560,
      y: 180,
      width: 280,
      height: 210,
      checklist: [
        { id: uid("c"), text: "Pan / Zoom камера", done: true },
        { id: uid("c"), text: "Bezier-коннекторы", done: false },
      ],
    },
    {
      id: c,
      number: 3,
      title: "Экспорт в LLM",
      description: "Топологический обход графа → Markdown-промпт.",
      status: "queued",
      x: 960,
      y: 260,
      width: 280,
      height: 210,
      checklist: [{ id: uid("c"), text: "Копирование в буфер", done: false }],
    },
  ];
  return {
    name: "Project Flow Studio",
    camera: { x: 40, y: 20, zoom: 1 },
    nodes,
    connections: [
      { id: uid("e"), from: { nodeId: a, port: "right" }, to: { nodeId: b, port: "left" } },
      { id: uid("e"), from: { nodeId: b, port: "right" }, to: { nodeId: c, port: "left" } },
    ],
    strokes: [],
    shapes: [
      {
        id: uid("s"),
        type: "frame",
        x1: 140,
        y1: 120,
        x2: 1280,
        y2: 520,
        color: "#8B5CF6",
        label: "Пайплайн v1",
      },
    ],
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...sampleProject(),
  tool: "select",
  brushColor: "#06B6D4",
  brushWidth: 3,
  selectedNodeId: null,
  selectedConnectionId: null,
  selectedShapeId: null,
  spaceDown: false,
  draftStroke: null,
  exportOpen: false,

  setName: (name) => set({ name }),
  setCamera: (camera) => set({ camera }),
  setTool: (tool) => set({ tool, selectedConnectionId: null }),
  setBrush: (patch) => set(patch),
  setSpaceDown: (spaceDown) => set({ spaceDown }),
  setExportOpen: (exportOpen) => set({ exportOpen }),
  selectNode: (selectedNodeId) =>
    set({ selectedNodeId, selectedConnectionId: null, selectedShapeId: null }),
  selectConnection: (selectedConnectionId) =>
    set({ selectedConnectionId, selectedNodeId: null, selectedShapeId: null }),
  selectShape: (selectedShapeId) =>
    set({ selectedShapeId, selectedNodeId: null, selectedConnectionId: null }),

  addNodeAt: (x, y) => {
    const id = uid("n");
    const number = (get().nodes.reduce((m, n) => Math.max(m, n.number), 0) || 0) + 1;
    const node: FlowNode = {
      id,
      number,
      title: `Этап ${number}`,
      description: "",
      status: "queued",
      x,
      y,
      width: 280,
      height: 210,
      checklist: [],
    };
    set({ nodes: [...get().nodes, node], selectedNodeId: id, tool: "select" });
    return id;
  },

  updateNode: (id, patch) =>
    set({ nodes: get().nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)) }),

  moveNode: (id, x, y) =>
    set({ nodes: get().nodes.map((n) => (n.id === id ? { ...n, x, y } : n)) }),

  removeNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      connections: get().connections.filter((c) => c.from.nodeId !== id && c.to.nodeId !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    }),

  addChecklistItem: (nodeId, text) => {
    const item: ChecklistItem = { id: uid("c"), text, done: false };
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, checklist: [...n.checklist, item] } : n,
      ),
    });
  },

  toggleChecklist: (nodeId, itemId) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id !== nodeId
          ? n
          : {
              ...n,
              checklist: n.checklist.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)),
            },
      ),
    }),

  removeChecklistItem: (nodeId, itemId) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id !== nodeId ? n : { ...n, checklist: n.checklist.filter((i) => i.id !== itemId) },
      ),
    }),

  setStatus: (nodeId, status) =>
    set({ nodes: get().nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)) }),

  addConnection: (from, to) => {
    if (from.nodeId === to.nodeId) return;
    const exists = get().connections.some(
      (c) =>
        c.from.nodeId === from.nodeId &&
        c.from.port === from.port &&
        c.to.nodeId === to.nodeId &&
        c.to.port === to.port,
    );
    if (exists) return;
    set({ connections: [...get().connections, { id: uid("e"), from, to }] });
  },

  removeConnection: (id) =>
    set({
      connections: get().connections.filter((c) => c.id !== id),
      selectedConnectionId: get().selectedConnectionId === id ? null : get().selectedConnectionId,
    }),

  beginStroke: (point, tool) => {
    const { brushColor, brushWidth } = get();
    set({
      draftStroke: {
        points: [point],
        color: tool === "eraser" ? "#090D16" : brushColor,
        width: tool === "marker" ? brushWidth * 3 : brushWidth,
        opacity: tool === "marker" ? 0.35 : 1,
        tool,
      },
    });
  },

  appendStroke: (point) => {
    const draft = get().draftStroke;
    if (!draft) return;
    const last = draft.points[draft.points.length - 1];
    if (last && Math.hypot(last.x - point.x, last.y - point.y) < 1.2) return;
    set({ draftStroke: { ...draft, points: [...draft.points, point] } });
  },

  commitStroke: () => {
    const draft = get().draftStroke;
    set({ draftStroke: null });
    if (!draft || draft.points.length < 2) return;
    if (draft.tool === "eraser") return;
    set({
      strokes: [
        ...get().strokes,
        {
          id: uid("k"),
          points: draft.points,
          color: draft.color,
          width: draft.width,
          opacity: draft.opacity,
          tool: draft.tool,
        },
      ],
    });
  },

  eraseAt: (point, radius) => {
    set({
      strokes: get().strokes.filter((s) => !hitStroke(s.points, point, radius + s.width)),
    });
  },

  addShape: (type, a, b, label = "") => {
    const shape: Shape = {
      id: uid("s"),
      type,
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      color: type === "sticker" ? "#FDE047" : "#06B6D4",
      label:
        label ||
        (type === "sticker" ? "Заметка" : type === "frame" ? "Группа" : ""),
    };
    set({ shapes: [...get().shapes, shape], selectedShapeId: shape.id, tool: "select" });
  },

  updateShape: (id, patch) =>
    set({ shapes: get().shapes.map((s) => (s.id === id ? { ...s, ...patch } : s)) }),

  removeShape: (id) =>
    set({
      shapes: get().shapes.filter((s) => s.id !== id),
      selectedShapeId: get().selectedShapeId === id ? null : get().selectedShapeId,
    }),

  loadDocument: (doc) =>
    set({
      name: doc.name ?? "Untitled",
      camera: doc.camera ?? { x: 0, y: 0, zoom: 1 },
      nodes: doc.nodes ?? [],
      connections: doc.connections ?? [],
      strokes: doc.strokes ?? [],
      shapes: doc.shapes ?? [],
      selectedNodeId: null,
      selectedConnectionId: null,
      selectedShapeId: null,
    }),

  toDocument: () => {
    const { name, camera, nodes, connections, strokes, shapes } = get();
    return { version: 1, name, camera, nodes, connections, strokes, shapes };
  },

  deleteSelection: () => {
    const { selectedNodeId, selectedConnectionId, selectedShapeId } = get();
    if (selectedNodeId) get().removeNode(selectedNodeId);
    else if (selectedConnectionId) get().removeConnection(selectedConnectionId);
    else if (selectedShapeId) get().removeShape(selectedShapeId);
  },
}));

