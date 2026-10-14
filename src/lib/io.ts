import type { ProjectDocument } from "../types";

export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function saveProjectFile(doc: ProjectDocument): Promise<string | null> {
  const payload = JSON.stringify(doc, null, 2);
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeTextFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: `${sanitizeFileName(doc.name)}.pflow`,
      filters: [{ name: "Project Flow", extensions: ["pflow"] }],
    });
    if (!path) return null;
    await writeTextFile(path, payload);
    return path;
  }
  downloadBlob(`${sanitizeFileName(doc.name)}.pflow`, payload, "application/json");
  return doc.name;
}

export async function openProjectFile(): Promise<ProjectDocument | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const { readTextFile } = await import("@tauri-apps/plugin-fs");
    const path = await open({
      multiple: false,
      filters: [{ name: "Project Flow", extensions: ["pflow", "json"] }],
    });
    if (!path || Array.isArray(path)) return null;
    const raw = await readTextFile(path);
    return JSON.parse(raw) as ProjectDocument;
  }
  return pickLocalJson();
}

export async function savePngFile(dataUrl: string, name: string): Promise<void> {
  const bytes = dataUrlToBytes(dataUrl);
  if (isTauri()) {
    const { save } = await import("@tauri-apps/plugin-dialog");
    const { writeFile } = await import("@tauri-apps/plugin-fs");
    const path = await save({
      defaultPath: `${sanitizeFileName(name)}.png`,
      filters: [{ name: "PNG", extensions: ["png"] }],
    });
    if (!path) return;
    await writeFile(path, bytes);
    return;
  }
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = `${sanitizeFileName(name)}.png`;
  a.click();
}

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]+/g, "_").trim() || "project";
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function pickLocalJson(): Promise<ProjectDocument | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pflow,application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file
        .text()
        .then((t) => resolve(JSON.parse(t) as ProjectDocument))
        .catch(() => resolve(null));
    };
    input.click();
  });
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
