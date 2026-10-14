import type { FlowNode, Point, PortSide } from "../types";

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function screenToWorld(
  sx: number,
  sy: number,
  panX: number,
  panY: number,
  zoom: number,
): Point {
  return { x: (sx - panX) / zoom, y: (sy - panY) / zoom };
}

export function portPoint(node: FlowNode, port: PortSide): Point {
  switch (port) {
    case "top":
      return { x: node.x + node.width / 2, y: node.y };
    case "right":
      return { x: node.x + node.width, y: node.y + node.height / 2 };
    case "bottom":
      return { x: node.x + node.width / 2, y: node.y + node.height };
    case "left":
      return { x: node.x, y: node.y + node.height / 2 };
  }
}

function portOffset(port: PortSide, magnitude: number): Point {
  switch (port) {
    case "top":
      return { x: 0, y: -magnitude };
    case "right":
      return { x: magnitude, y: 0 };
    case "bottom":
      return { x: 0, y: magnitude };
    case "left":
      return { x: -magnitude, y: 0 };
  }
}

export function bezierPath(
  from: Point,
  fromPort: PortSide,
  to: Point,
  toPort: PortSide,
): string {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const mag = Math.max(48, dist * 0.38);
  const a = portOffset(fromPort, mag);
  const b = portOffset(toPort, mag);
  return `M ${from.x} ${from.y} C ${from.x + a.x} ${from.y + a.y}, ${to.x + b.x} ${to.y + b.y}, ${to.x} ${to.y}`;
}

export function nearestPort(node: FlowNode, world: Point): PortSide {
  const ports: PortSide[] = ["top", "right", "bottom", "left"];
  let best: PortSide = "right";
  let bestD = Infinity;
  for (const p of ports) {
    const pt = portPoint(node, p);
    const d = Math.hypot(pt.x - world.x, pt.y - world.y);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function hitStroke(points: Point[], world: Point, threshold: number): boolean {
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (distToSegment(world, a, b) <= threshold) return true;
  }
  return false;
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = clamp(t, 0, 1);
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
