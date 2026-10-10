"use client";

import { useEffect, useRef, useState } from "react";
import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeConfig, ResumeMetadata } from "../lib/resume";
import { readResume } from "../lib/resume-storage";
import { ResumePreview } from "./ResumePreview";

export function SavedResumePreview({ resume }: { resume: ResumeMetadata }) {
  const { locale } = useAppLocale();
  const root = useRef<HTMLDivElement>(null);
  const [config, setConfig] = useState<ResumeConfig | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let visible = false;
    const load = () => {
      try { setConfig(readResume(resume.id)); setFailed(false); }
      catch { setConfig(null); setFailed(true); }
    };
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      visible = true;
      load();
      observer.disconnect();
    }, { rootMargin: "160px" });
    if (root.current) observer.observe(root.current);
    const changed = (event: StorageEvent) => {
      if (visible && (event.key === null || event.key === `resume_data_${resume.id}`)) load();
    };
    window.addEventListener("storage", changed);
    return () => { observer.disconnect(); window.removeEventListener("storage", changed); };
  }, [resume.id, resume.lastModified]);
  return (
    <div ref={root} className="mb-5 rounded-xl border border-zinc-200 bg-zinc-100 p-3">
      {config ? <ResumePreview config={config} thumbnail /> : <div className="aspect-[210/297] flex items-center justify-center bg-white text-sm text-zinc-500">{failed ? (locale === "en-US" ? "Cannot read resume" : "读取失败") : (locale === "en-US" ? "Loading" : "加载中")}</div>}
    </div>
  );
}
