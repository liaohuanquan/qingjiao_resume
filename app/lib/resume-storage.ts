import type { ResumeConfig, ResumeMetadata, ResumeSnapshot } from "./resume";
import { blankResume, color, parseResumeConfig, record } from "./resume-schema";

const dataKey = (id: string) => `resume_data_${id}`;
const historyKey = (id: string) => `resume_history_${id}`;

export class ResumeConflictError extends Error {
  constructor(public reason: "changed" | "deleted") {
    super(`resume ${reason}`);
    this.name = "ResumeConflictError";
  }
}

export function assertResumeUnchanged(id: string, expected: string | null) {
  if (!listResumes().some(item => item.id === id)) throw new ResumeConflictError("deleted");
  if (savedResumeText(id) !== expected) throw new ResumeConflictError("changed");
}
export function downloadFile(value: unknown, filename: string, raw = false) {
  const url = URL.createObjectURL(new Blob([raw ? String(value) : JSON.stringify(value, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url; link.download = filename.replace(/[\\/:*?"<>|]/g, "-");
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Keep the previous values so a failed multi-key operation does not report success.
function writeChanges(changes: Map<string, string | null>) {
  const old = new Map([...changes.keys()].map(key => [key, localStorage.getItem(key)]));
  try {
    changes.forEach((value, key) => value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value));
  } catch (error) {
    old.forEach((value, key) => {
      try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); }
      catch { /* Preserve the original write error. */ }
    });
    throw error;
  }
}

function parseMetadata(value: unknown): ResumeMetadata {
  const item = record(value);
  if (typeof item.id !== "string" || !item.id || typeof item.title !== "string" || typeof item.lastModified !== "string") throw new Error("invalid metadata");
  return { id: item.id, title: item.title, lastModified: item.lastModified, theme: color(item.theme), templateId: item.templateId === undefined ? undefined : parseResumeConfig({ resumeData: {}, templateId: item.templateId }).templateId };
}
export function listResumes(): ResumeMetadata[] {
  const raw = localStorage.getItem("resume_list");
  if (raw === null) return [];
  const list: unknown = JSON.parse(raw);
  if (!Array.isArray(list)) throw new Error("invalid resume list");
  const parsed = list.map(parseMetadata);
  if (new Set(parsed.map(item => item.id)).size !== parsed.length) throw new Error("duplicate resume id");
  return parsed;
}

function legacyConfig(): ResumeConfig | null {
  const raw = localStorage.getItem("resume_v2_data");
  if (raw === null) return null;
  const read = (key: string) => { const value = localStorage.getItem(key); return value === null ? undefined : JSON.parse(value); };
  const data = record(JSON.parse(raw));
  const savedAspect = localStorage.getItem("resume_avatar_aspect");
  const config = parseResumeConfig({ resumeData: { ...data, avatarAspect: data.avatarAspect ?? (savedAspect === null ? undefined : Number(savedAspect)) }, modules: read("resume_v2_modules"), typography: read("resume_v2_typography"), themeColor: localStorage.getItem("resume_v2_theme") || undefined });
  const avatar = localStorage.getItem("resume_avatar");
  if (avatar && !config.resumeData.avatar) config.resumeData.avatar = avatar;
  return parseResumeConfig(config);
}

export function readResume(id: string): ResumeConfig {
  const raw = localStorage.getItem(dataKey(id));
  if (raw !== null) return parseResumeConfig(JSON.parse(raw));
  if (id === "default-1") {
    const legacy = legacyConfig();
    if (legacy) return legacy;
  }
  // Older versions created list entries before any body was saved.
  if (listResumes().some(item => item.id === id)) return blankResume();
  throw new Error("resume not found");
}

export function savedResumeText(id: string): string | null {
  return localStorage.getItem(dataKey(id));
}

export function listResumesWithLegacy(locale: string): ResumeMetadata[] {
  const list = listResumes();
  if (list.length || (localStorage.getItem("resume_v2_data") === null && localStorage.getItem(dataKey("default-1")) === null)) return list;
  openResume("default-1", false, locale === "en-US" ? "Untitled resume" : "未命名简历", locale);
  return listResumes();
}

export function createResume(title: string, config = blankResume(), id: string = crypto.randomUUID()): ResumeMetadata {
  const list = listResumes();
  if (list.some(item => item.id === id) || localStorage.getItem(dataKey(id)) !== null) throw new Error("resume already exists");
  const valid = parseResumeConfig(config);
  const metadata = { id, title, lastModified: new Date().toISOString(), theme: valid.themeColor, templateId: valid.templateId };
  writeChanges(new Map([[dataKey(id), JSON.stringify(valid)], ["resume_list", JSON.stringify([metadata, ...list])]]));
  return metadata;
}

export function openResume(id: string, explicitId: boolean, title: string, locale: string): ResumeConfig {
  const list = listResumes();
  const exists = list.some(item => item.id === id);
  const raw = localStorage.getItem(dataKey(id));
  if (exists) {
    // A validated migration is saved by the editor; a full store must not hide readable content.
    return readResume(id);
  }
  if (raw !== null) {
    const config = parseResumeConfig(JSON.parse(raw));
    const metadata = { id, title, lastModified: new Date().toISOString(), theme: config.themeColor, templateId: config.templateId };
    writeChanges(new Map([["resume_list", JSON.stringify([metadata, ...list])]]));
    return config;
  }
  const legacy = id === "default-1" ? legacyConfig() : null;
  if (explicitId && !legacy) throw new Error("resume not found");
  const config = parseResumeConfig(legacy || blankResume(locale));
  createResume(title, config, id);
  return config;
}

export function saveResume(id: string, config: ResumeConfig, expected: string | null) {
  assertResumeUnchanged(id, expected);
  const list = listResumes();
  const valid = parseResumeConfig(config);
  const encoded = JSON.stringify(valid);
  const updated = list.map(item => item.id === id ? { ...item, theme: valid.themeColor, templateId: valid.templateId, lastModified: new Date().toISOString() } : item);
  writeChanges(new Map([[dataKey(id), encoded], ["resume_list", JSON.stringify(updated)]]));
  return encoded;
}
export function renameResume(id: string, title: string) {
  const list = listResumes();
  if (!list.some(item => item.id === id)) throw new Error("resume not found");
  writeChanges(new Map([["resume_list", JSON.stringify(list.map(item => item.id === id ? { ...item, title, lastModified: new Date().toISOString() } : item))]]));
}
export function deleteResume(id: string) {
  const changes = new Map<string, string | null>([[dataKey(id), null], [historyKey(id), null], ["resume_list", JSON.stringify(listResumes().filter(item => item.id !== id))]]);
  if (id === "default-1") ["resume_v2_data", "resume_v2_modules", "resume_v2_theme", "resume_v2_typography", "resume_avatar", "resume_avatar_aspect"].forEach(key => changes.set(key, null));
  writeChanges(changes);
}
export function duplicateResume(id: string, title: string, draft?: ResumeConfig): ResumeMetadata {
  const config = draft ? parseResumeConfig(draft) : readResume(id);
  const history = readHistory(id).map(snapshot => ({ ...snapshot, id: crypto.randomUUID() }));
  const newId = crypto.randomUUID();
  const metadata = { id: newId, title, lastModified: new Date().toISOString(), theme: config.themeColor, templateId: config.templateId };
  writeChanges(new Map([[dataKey(newId), JSON.stringify(config)], [historyKey(newId), JSON.stringify(history)], ["resume_list", JSON.stringify([metadata, ...listResumes()])]]));
  return metadata;
}

function parseHistory(value: unknown): ResumeSnapshot[] {
  if (!Array.isArray(value)) throw new Error("invalid history");
  return value.map(value => {
    const item = record(value);
    if (typeof item.id !== "string" || typeof item.label !== "string" || typeof item.createdAt !== "string") throw new Error("invalid snapshot");
    return { id: item.id, label: item.label, createdAt: item.createdAt, config: parseResumeConfig(item.config) };
  });
}
export function readHistory(id: string) {
  const raw = localStorage.getItem(historyKey(id));
  return raw === null ? [] : parseHistory(JSON.parse(raw)).slice(0, 10);
}
export function saveSnapshot(id: string, label: string, config: ResumeConfig) {
  if (!listResumes().some(item => item.id === id)) throw new Error("resume not found");
  const valid = parseResumeConfig(config);
  const history = readHistory(id);
  if (JSON.stringify(history[0]?.config) === JSON.stringify(valid)) return history;
  const next = [{ id: crypto.randomUUID(), label, createdAt: new Date().toISOString(), config: valid }, ...history].slice(0, 10);
  writeChanges(new Map([[historyKey(id), JSON.stringify(next)]]));
  return next;
}

export interface ResumeBackup { version: 1; resumes: { metadata: ResumeMetadata; config: ResumeConfig; history: ResumeSnapshot[] }[] }
export function exportBackup(): ResumeBackup {
  return { version: 1, resumes: listResumes().map(metadata => ({ metadata, config: readResume(metadata.id), history: readHistory(metadata.id) })) };
}
export function parseResumeBackup(value: unknown): ResumeBackup {
  const backup = record(value);
  if (backup.version !== 1 || !Array.isArray(backup.resumes)) throw new Error("invalid backup");
  // Validate the entire file before writing any entry.
  const resumes = backup.resumes.map(value => {
    const entry = record(value);
    return { metadata: parseMetadata(entry.metadata), config: parseResumeConfig(entry.config), history: parseHistory(entry.history).slice(0, 10) };
  });
  return { version: 1, resumes };
}
export function restoreBackup(value: unknown): number {
  const { resumes: entries } = parseResumeBackup(value);
  if (!entries.length) return 0;
  const changes = new Map<string, string | null>();
  const restored = entries.map(entry => {
    const id = crypto.randomUUID();
    changes.set(dataKey(id), JSON.stringify(entry.config));
    changes.set(historyKey(id), JSON.stringify(entry.history.slice(0, 10).map(snapshot => ({ ...snapshot, id: crypto.randomUUID() }))));
    return { ...entry.metadata, id, theme: entry.config.themeColor, templateId: entry.config.templateId };
  });
  changes.set("resume_list", JSON.stringify([...restored, ...listResumes()]));
  writeChanges(changes);
  return restored.length;
}

function appKey(key: string) {
  return ["resume_list", "app_locale", "app_preferences", "ai_providers", "ai_settings", "selected_template_id", "resume_avatar", "resume_avatar_aspect"].includes(key) || key.startsWith("resume_data_") || key.startsWith("resume_history_") || ["resume_v2_data", "resume_v2_modules", "resume_v2_theme", "resume_v2_typography"].includes(key);
}
export function downloadRawStorage() {
  const values: Record<string, string> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && appKey(key) && !key.startsWith("ai_")) values[key] = localStorage.getItem(key) || "";
  }
  downloadFile(values, "resume-recovery.json");
}
export function clearAppStorage() {
  const changes = new Map<string, string | null>();
  for (let i = 0; i < localStorage.length; i++) { const key = localStorage.key(i); if (key && appKey(key)) changes.set(key, null); }
  writeChanges(changes);
}
