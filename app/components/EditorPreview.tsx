"use client";

import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { Maximize, Minus, Plus } from "lucide-react";
import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeConfig } from "../lib/resume";
import { CONTENT_HEIGHT, PAPER_HEIGHT, PAPER_MARGIN, PAPER_WIDTH } from "../lib/resume-layout";
import { ResumeDocument } from "./ResumeDocument";

const MIN_SCALE = 0.1;
const MAX_SCALE = 1.5;

export const EditorPreview = forwardRef<HTMLDivElement, { config: ResumeConfig; active: boolean; onPagesChange: (pages: number) => void; onEditModule: (id: string) => void }>(function EditorPreview({ config, active, onPagesChange, onEditModule }, ref) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const container = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const [panning, setPanning] = useState(false);
  const [metrics, setMetrics] = useState({ height: PAPER_HEIGHT, fitScale: 0.8, pages: 1 });
  const [zoom, setZoom] = useState({ fit: true, scale: 0.8 });
  const scale = zoom.fit ? metrics.fitScale : zoom.scale;
  // The parent waits for fonts and images on this same sheet before native printing.
  useImperativeHandle(ref, () => paper.current!, []);

  useLayoutEffect(() => {
    const root = container.current;
    const sheet = paper.current;
    if (!root || !sheet) return;
    const measure = () => {
      const style = getComputedStyle(root);
      const width = root.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
      const height = Math.max(PAPER_HEIGHT, sheet.scrollHeight);
      const fitScale = Math.max(MIN_SCALE, Math.min(1, width / PAPER_WIDTH));
      // scrollHeight rounds up to whole pixels; allow that rounding at a page boundary.
      const pages = Math.max(1, Math.ceil((height - PAPER_MARGIN * 2 - 1) / CONTENT_HEIGHT));
      setMetrics(previous => previous.height === height && previous.fitScale === fitScale && previous.pages === pages ? previous : { height, fitScale, pages });
    };
    measure();
    // Measure the unscaled sheet; screen zoom never determines print pagination.
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, []);
  useEffect(() => onPagesChange(metrics.pages), [metrics.pages, onPagesChange]);
  useEffect(() => { if (!active) { drag.current = null; setPanning(false); } }, [active]);

  const changeZoom = (delta: number) => setZoom(previous => ({ fit: false, scale: Math.max(MIN_SCALE, Math.min(MAX_SCALE, (previous.fit ? metrics.fitScale : previous.scale) + delta)) }));
  const startDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !event.isPrimary) return;
    if (event.target instanceof Element && event.target.closest(".resume-document, button, a, input, textarea, select")) return;
    const root = event.currentTarget;
    drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, left: root.scrollLeft, top: root.scrollTop };
    root.setPointerCapture(event.pointerId);
    event.preventDefault();
    setPanning(true);
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setPanning(false);
  };
  return <section id="resume-editor-panel-preview" data-editor-panel data-preview-section tabIndex={-1} aria-label={t("简历预览", "Resume preview")} className={`flex-1 min-w-0 bg-zinc-100 flex flex-col overflow-hidden group absolute inset-0 z-20 lg:relative lg:flex lg:translate-x-0 lg:visible transition-transform duration-300 ${active ? "translate-x-0 visible" : "translate-x-full invisible"}`}>
    <p className="no-print absolute bottom-5 left-5 z-30 rounded-lg bg-white px-3 py-2 text-xs text-zinc-500">{t(`约 ${metrics.pages} 页`, `About ${metrics.pages} pages`)}</p>
    <div role="group" aria-label={t("预览缩放", "Preview zoom")} className="no-print absolute right-4 top-1/2 z-30 flex -translate-y-1/2 flex-col gap-2 rounded-2xl border border-zinc-200 bg-white/90 p-1.5 shadow-xl backdrop-blur-md opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100 transition-opacity">
      <button type="button" aria-label={t("放大", "Zoom in")} title={t("放大", "Zoom in")} disabled={scale >= MAX_SCALE} onClick={() => changeZoom(0.1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"><Plus size={18} /></button>
      <span className="flex h-10 items-center justify-center border-y border-zinc-100 text-xs text-zinc-500">{Math.round(scale * 100)}%</span>
      <button type="button" aria-label={t("缩小", "Zoom out")} title={t("缩小", "Zoom out")} disabled={scale <= MIN_SCALE} onClick={() => changeZoom(-0.1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100 disabled:opacity-30"><Minus size={18} /></button>
      <button type="button" aria-label={t("适配宽度", "Fit width")} title={t("适配宽度", "Fit width")} aria-pressed={zoom.fit} onClick={() => setZoom(previous => ({ ...previous, fit: true }))} className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"><Maximize size={18} /></button>
    </div>
    <div ref={container} data-preview-container tabIndex={0} aria-label={t("滚动预览", "Scroll preview")} className={`flex-1 overflow-auto p-4 pb-24 sm:p-8 sm:pb-24 bg-zinc-200/50 scrollbar-hide ${panning ? "cursor-grabbing" : "cursor-grab"}`} onPointerDown={startDrag}
      onPointerMove={event => {
        const origin = drag.current;
        if (!origin || origin.pointerId !== event.pointerId) return;
        event.preventDefault();
        event.currentTarget.scrollLeft = origin.left - (event.clientX - origin.x);
        event.currentTarget.scrollTop = origin.top - (event.clientY - origin.y);
      }} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={() => { drag.current = null; setPanning(false); }}>
      <div className="resume-preview-center flex min-h-full min-w-full justify-start">
        <div className="resume-preview-sizing relative mx-auto shrink-0 overflow-hidden shadow-xl" style={{ width: PAPER_WIDTH * scale, height: metrics.height * scale }}>
          <div className="resume-preview-scale absolute left-0 top-0 cursor-text" style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: PAPER_WIDTH }}>
            <ResumeDocument ref={paper} config={config} pageGuides avatarAlt={t("头像", "Avatar")} onEditModule={onEditModule} editLabel={t("编辑", "Edit")} />
          </div>
        </div>
      </div>
    </div>
  </section>;
});
