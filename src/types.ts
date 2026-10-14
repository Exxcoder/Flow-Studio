export type Tool =
  | "select"
  | "pan"
  | "pen"
  | "marker"
  | "eraser"
  | "line"
  | "arrow"
  | "frame"
  | "sticker"
  | "node";

export type NodeStatus = "queued" | "in_progress" | "done";
export type PortSide = "top" | "right" | "bottom" | "left";
export type DrawTool = "pen" | "marker" | "eraser";

export interface Point {
  x: number;
  y: number;
}

export interface Camera {
  x: number;
  y: number;
  zoom: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface FlowNode {
  id: string;
  number: number;
  title: string;
  description: string;
  status: NodeStatus;
  x: number;
  y: number;
  width: number;
  height: number;
  checklist: ChecklistItem[];
}

export interface Endpoint {
  nodeId: string;
  port: PortSide;
}

export interface Connection {
  id: string;
  from: Endpoint;
  to: Endpoint;
}

export interface Stroke {
  id: string;
  points: Point[];
  color: string;
  width: number;
  opacity: number;
  tool: DrawTool;
}

export type ShapeType = "line" | "arrow" | "frame" | "sticker";

export interface Shape {
  id: string;
  type: ShapeType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  label: string;
}

export interface ProjectDocument {
  version: 1;
  name: string;
  camera: Camera;
  nodes: FlowNode[];
  connections: Connection[];
  strokes: Stroke[];
  shapes: Shape[];
}

export const STATUS_LABEL: Record<NodeStatus, string> = {
  queued: "В очереди",
  in_progress: "В процессе",
  done: "Завершено",
};

export const MIN_ZOOM = 0.2;
export const MAX_ZOOM = 3;
export const GRID = 24;
