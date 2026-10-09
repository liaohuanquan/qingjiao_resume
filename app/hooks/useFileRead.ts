"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ReadOutcome = { ok: true; text: string } | { ok: false };
export type FileReadResult = ReadOutcome & { current: () => boolean };
type ReadTask = { reader: FileReader; resolve: (result: FileReadResult | null) => void };

// Cancelling also invalidates results already queued for an awaiting caller.
export function useFileRead() {
  const active = useRef<ReadTask | null>(null);
  const generation = useRef(0);
  const mounted = useRef(true);
  const [pending, setPending] = useState(false);
  const cancel = useCallback(() => {
    generation.current++;
    const task = active.current;
    active.current = null;
    if (task) {
      task.reader.onload = task.reader.onerror = task.reader.onabort = null;
      if (task.reader.readyState === FileReader.LOADING) task.reader.abort();
      task.resolve(null);
    }
    if (mounted.current) setPending(false);
  }, []);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; cancel(); };
  }, [cancel]);
  const read = useCallback((file: File, mode: "text" | "dataURL" = "text"): Promise<FileReadResult | null> => {
    cancel();
    const token = generation.current;
    const current = () => mounted.current && generation.current === token;
    setPending(true);
    return new Promise<FileReadResult | null>(resolve => {
      let reader: FileReader;
      try { reader = new FileReader(); }
      catch { if (mounted.current) setPending(false); resolve({ ok: false, current }); return; }
      const task = { reader, resolve };
      active.current = task;
      const finish = (outcome: ReadOutcome) => {
        if (active.current !== task) return;
        active.current = null;
        reader.onload = reader.onerror = reader.onabort = null;
        if (mounted.current) setPending(false);
        resolve({ ...outcome, current });
      };
      reader.onload = () => finish(typeof reader.result === "string" ? { ok: true, text: reader.result } : { ok: false });
      reader.onerror = () => finish({ ok: false });
      reader.onabort = () => { if (active.current === task) cancel(); };
      try { if (mode === "text") reader.readAsText(file); else reader.readAsDataURL(file); }
      catch { finish({ ok: false }); }
    });
  }, [cancel]);
  return { read, cancel, pending };
}
