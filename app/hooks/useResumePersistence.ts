"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ResumeConfig } from "../lib/resume";
import { blankResume } from "../lib/resume-schema";
import { openResume, savedResumeText, saveResume } from "../lib/resume-storage";
import { getCurrentLocale } from "./useAppLocale";

export type SaveStatus = "unsaved" | "saving" | "saved" | "failed";

export function useResumePersistence(id: string, explicitId: boolean, locale: string) {
  const [config, setConfig] = useState<ResumeConfig>(() => blankResume(locale));
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<"missing" | "storage" | null>(null);
  const [status, setStatus] = useState<SaveStatus>("unsaved");
  const latest = useRef<{ id: string; config: ResumeConfig } | null>(null);
  const saved = useRef("");

  const flush = useCallback(() => {
    const current = latest.current;
    if (!current) return false;
    const encoded = JSON.stringify(current.config);
    if (saved.current === encoded) return true;
    setStatus("saving");
    try {
      saveResume(current.id, current.config);
      saved.current = encoded;
      setStatus("saved");
      return true;
    } catch {
      setStatus("failed");
      return false;
    }
  }, []);

  const load = useCallback(() => {
    try {
      const openingLocale = getCurrentLocale();
      const loaded = openResume(id, explicitId, openingLocale === "en-US" ? "Untitled resume" : "未命名简历", openingLocale);
      saved.current = savedResumeText(id) || "";
      latest.current = { id, config: loaded };
      setConfig(loaded); setLoadedId(id);
      setStatus(saved.current === JSON.stringify(loaded) ? "saved" : "unsaved");
      setError(null);
    } catch (error) {
      latest.current = null; setLoadedId(null);
      setError(error instanceof Error && error.message === "resume not found" ? "missing" : "storage");
    }
  }, [id, explicitId]);

  useEffect(() => { load(); return () => { flush(); }; }, [load, flush]);
  useLayoutEffect(() => {
    if (loadedId !== id) return;
    latest.current = { id, config };
  }, [id, loadedId, config]);
  useEffect(() => {
    if (loadedId !== id || saved.current === JSON.stringify(config)) return;
    setStatus(previous => previous === "failed" ? "failed" : "unsaved");
    const timer = window.setTimeout(flush, 500);
    return () => window.clearTimeout(timer);
  }, [config, id, loadedId, flush]);
  useEffect(() => {
    const hidden = () => { if (document.visibilityState === "hidden") flush(); };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (latest.current && !flush()) { event.preventDefault(); event.returnValue = ""; }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("visibilitychange", hidden);
    return () => { flush(); window.removeEventListener("pagehide", flush); window.removeEventListener("beforeunload", beforeUnload); document.removeEventListener("visibilitychange", hidden); };
  }, [flush]);
  return { config, setConfig, ready: loadedId === id, status, error, flush, reload: load };
}
