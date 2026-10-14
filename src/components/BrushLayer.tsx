import { useEffect, useRef } from "react";
import type { Camera, Point, Stroke } from "../types";

interface Props {
  camera: Camera;
  strokes: Stroke[];
  draft: Omit<Stroke, "id"> | null;
  width: number;
  height: number;
}

export function BrushLayer({ camera, strokes, draft, width, height }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    for (const s of strokes) drawStroke(ctx, s);
    if (draft) drawStroke(ctx, draft);
    ctx.restore();
  }, [camera, strokes, draft, width, height]);

  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
      style={{ width, height }}
    />
  );
}

function drawStroke(
  ctx: CanvasRenderingContext2D,
  s: { points: Point[]; color: string; width: number; opacity: number; tool: string },
) {
  if (s.points.length < 2) return;
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = s.color;
  ctx.globalAlpha = s.opacity;
  ctx.lineWidth = s.width;
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.moveTo(s.points[0].x, s.points[0].y);
  for (let i = 1; i < s.points.length; i++) ctx.lineTo(s.points[i].x, s.points[i].y);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}
