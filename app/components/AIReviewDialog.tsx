"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAppLocale } from "../hooks/useAppLocale";
import { useModalFocus } from "../hooks/useModalFocus";

interface Props {
  original: string;
  suggestion: string;
  context: string;
  stale: boolean;
  error: string | null;
  onChange: (value: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export function AIReviewDialog({ original, suggestion, context, stale, error, onChange, onApply, onClose }: Props) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const suggestionId = useId();
  const suggestionInput = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  useModalFocus(true, onClose, "[data-ai-review]");
  const copy = async () => {
    const text = suggestion;
    setCopied(false);
    setCopyError(false);
    try {
      await navigator.clipboard.writeText(text);
      if (suggestionInput.current?.value === text) setCopied(true);
    } catch {
      if (!suggestionInput.current || suggestionInput.current.value !== text) return;
      suggestionInput.current.focus();
      suggestionInput.current.select();
      setCopyError(true);
    }
  };
  return (
    <motion.div data-ai-review role="dialog" aria-modal="true" aria-label={t("AI 建议", "AI suggestion")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex max-h-[90dvh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-zinc-100 p-6">
          <div className="flex min-w-0 items-center gap-3"><Sparkles aria-hidden="true" size={22} className="shrink-0 text-emerald-600" /><div className="min-w-0"><h2 className="text-lg font-bold">{t("AI 建议", "AI suggestion")}</h2>{context && <p className="truncate text-xs text-zinc-500">{context}</p>}</div></div>
          <button type="button" aria-label={t("关闭", "Close")} onClick={onClose} className="rounded-full p-2 text-zinc-500 hover:bg-zinc-100"><X size={20} /></button>
        </header>
        <div className="grid min-h-0 gap-4 overflow-y-auto p-6 md:grid-cols-2">
          <section className="space-y-2"><h3 className="text-xs font-bold text-zinc-500">{t("原文", "Original")}</h3><div className="min-h-40 whitespace-pre-wrap rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 md:h-72 md:overflow-auto">{original}</div></section>
          <div className="space-y-2"><label htmlFor={suggestionId} className="block text-xs font-bold text-emerald-600">{t("建议", "Suggestion")}</label><textarea id={suggestionId} ref={suggestionInput} value={suggestion} onChange={event => { setCopied(false); setCopyError(false); onChange(event.target.value); }} className="h-72 w-full resize-y rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-sm leading-relaxed text-zinc-800" /></div>
        </div>
        <footer className="shrink-0 space-y-3 border-t border-zinc-100 bg-zinc-50/60 p-6">
          {stale && <p role="status" className="text-sm text-amber-700">{t("原文已变化，可复制建议", "The original changed. You can copy the suggestion.")}</p>}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {copyError && <p role="alert" className="text-sm text-amber-700">{t("复制失败，请手动复制选中内容", "Copy failed. Copy the selected text manually.")}</p>}
          <div className="flex flex-wrap justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm">{t("保留原文", "Keep original")}</button>
            <button type="button" disabled={!suggestion.trim()} onClick={copy} className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm disabled:opacity-50"><Copy size={16} /><span role="status">{copied ? t("已复制", "Copied") : t("复制建议", "Copy suggestion")}</span></button>
            <button type="button" disabled={stale || !suggestion.trim()} onClick={onApply} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"><Check size={16} />{t("应用建议", "Apply suggestion")}</button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
