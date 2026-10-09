"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ResumeConfig } from "../lib/resume";
import { blankResume } from "../lib/resume-schema";
import { assertResumeUnchanged, duplicateResume, listResumes, openResume, ResumeConflictError, savedResumeText, saveResume } from "../lib/resume-storage";
import { getCurrentLocale } from "./useAppLocale";
import { useResumeEdits } from "./useResumeEdits";

export type SaveStatus = "unsaved" | "saving" | "saved" | "failed";

export function useResumePersistence(id: string, explicitId: boolean, locale: string) {
  const edits = useResumeEdits(blankResume(locale));
  const { config, replaceConfig } = edits;
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [error, setError] = useState<"missing" | "storage" | null>(null);
  const [status, setStatus] = useState<SaveStatus>("unsaved");
  const [conflict, setConflict] = useState<"changed" | "deleted" | null>(null);
  const latest = useRef<{ id: string; config: ResumeConfig } | null>(null);
  const saved = useRef("");
  const stored = useRef<string | null>(null);

  const fail = useCallback((error: unknown) => {
    setStatus("failed");
    if (error instanceof ResumeConflictError) setConflict(error.reason);
  }, []);

  const flush = useCallback(() => {
    const current = latest.current;
    if (!current) return false;
    try {
      // Check even clean documents: a different tab may have deleted or changed them.
      assertResumeUnchanged(current.id, stored.current);
      const encoded = JSON.stringify(current.config);
      if (saved.current !== encoded) {
        setStatus("saving");
        stored.current = saveResume(current.id, current.config, stored.current);
        saved.current = encoded;
      }
      setConflict(null);
      setStatus("saved");
      return true;
    } catch (error) { fail(error); return false; }
  }, [fail]);

  const load = useCallback(() => {
    try {
      const openingLocale = getCurrentLocale();
      const loaded = openResume(id, explicitId, openingLocale === "en-US" ? "Untitled resume" : "未命名简历", openingLocale);
      stored.current = savedResumeText(id);
      saved.current = stored.current || "";
      latest.current = { id, config: loaded };
      replaceConfig(loaded);
      setLoadedId(id);
      setStatus(saved.current === JSON.stringify(loaded) ? "saved" : "unsaved");
      setConflict(null);
      setError(null);
      return true;
    } catch (error) {
      // Failed reloads must not remove a still-recoverable in-memory draft.
      if (latest.current) fail(error);
      else setError(error instanceof Error && error.message === "resume not found" ? "missing" : "storage");
      return false;
    }
  }, [id, explicitId, fail, replaceConfig]);

  const saveCopy = useCallback(() => {
    const current = latest.current;
    if (!current) return null;
    try {
      const english = getCurrentLocale() === "en-US";
      const title = listResumes().find(item => item.id === current.id)?.title || (english ? "Untitled resume" : "未命名简历");
      const copy = duplicateResume(current.id, `${title} (${english ? "Copy" : "副本"})`, current.config);
      // The editor navigates to the new ID; cleanup must not save over the old one.
      latest.current = null;
      return copy.id;
    } catch (error) { fail(error); return null; }
  }, [fail]);

  useEffect(() => { load(); return () => { flush(); }; }, [load, flush]);
  useLayoutEffect(() => {
    if (loadedId === id) latest.current = { id, config };
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
    const externalChange = (event: StorageEvent) => {
      const current = latest.current;
      if (!current || (event.key !== null && event.key !== "resume_list" && event.key !== `resume_data_${current.id}`)) return;
      try { assertResumeUnchanged(current.id, stored.current); }
      catch (error) { fail(error); }
    };
    window.addEventListener("pagehide", flush);
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("storage", externalChange);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      flush();
      window.removeEventListener("pagehide", flush);
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("storage", externalChange);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [flush, fail]);
  return { ...edits, ready: loadedId === id, status, error, conflict, flush, reload: load, saveCopy };
}
