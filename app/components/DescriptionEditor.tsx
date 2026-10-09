"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppLocale } from "../hooks/useAppLocale";
import { boldDescription, bulletDescription, linkDescription, webLink, type DescriptionEdit } from "../lib/resume-description";
import { Modal } from "./Modal";

export function DescriptionEditor({ id, label, value, onChange, placeholder, rows = 6 }: {
  id: string; label: string; value: string; onChange: (value: string) => void; placeholder?: string; rows?: number;
}) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const input = useRef<HTMLTextAreaElement>(null);
  const frame = useRef<number | null>(null);
  const [link, setLink] = useState<{ source: string; text: string; start: number; end: number; title: string; url: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => () => { if (frame.current !== null) cancelAnimationFrame(frame.current); }, []);

  const selection = () => ({ start: input.current?.selectionStart ?? value.length, end: input.current?.selectionEnd ?? value.length });
  const apply = (edit: DescriptionEdit) => {
    const node = input.current;
    // A formatting command is a separate session edit, including keyboard commands.
    if (document.activeElement === node) node?.blur();
    onChange(edit.text);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (!node || !node.isConnected || input.current !== node || node.value !== edit.text) return;
      node.focus({ preventScroll: true });
      node.setSelectionRange(edit.start, edit.end);
    });
  };
  const format = (kind: "bold" | "bullet") => {
    const { start, end } = selection();
    const text = input.current?.value ?? value;
    apply(kind === "bold" ? boldDescription(text, start, end) : bulletDescription(text, start, end));
  };
  const openLink = () => {
    const { start, end } = selection();
    const text = input.current?.value ?? value;
    setError(""); setLink({ source: value, text, start, end, title: text.slice(start, end).replace(/\r?\n/g, " "), url: "" });
  };
  return <div className="space-y-2">
    <label htmlFor={id} className="text-xs font-medium text-zinc-500">{label}</label>
    <div role="group" aria-label={t("正文格式", "Text formatting")} className="flex gap-1">
      <button type="button" onClick={() => format("bold")} title={t("加粗 (Ctrl/Cmd+B)", "Bold (Ctrl/Cmd+B)")} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold">{t("加粗", "Bold")}</button>
      <button type="button" onClick={() => format("bullet")} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs">{t("列表", "List")}</button>
      <button type="button" onClick={openLink} title={t("链接 (Ctrl/Cmd+K)", "Link (Ctrl/Cmd+K)")} className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs">{t("链接", "Link")}</button>
    </div>
    <textarea ref={input} id={id} value={value} rows={rows} placeholder={placeholder}
      className="block w-full resize-y rounded-lg border border-zinc-300 bg-white p-3 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-zinc-400"
      onChange={event => onChange(event.target.value)} onKeyDown={event => {
        if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey || event.nativeEvent.isComposing) return;
        const key = event.key.toLowerCase();
        if (key === "b") { event.preventDefault(); format("bold"); }
        else if (key === "k") { event.preventDefault(); openLink(); }
      }} />
    {link && createPortal(<div className="app-surface no-print fixed inset-0 z-[150]"><Modal title={t("插入链接", "Insert link")} close={() => setLink(null)} closeLabel={t("关闭", "Close")}>
      <form className="space-y-4" onSubmit={event => {
        event.preventDefault();
        if (value !== link.source) { setError(t("内容已变化，请重新选择", "Text changed. Select again.")); return; }
        const href = webLink(link.url);
        if (!href) { setError(t("请输入 http 或 https 地址", "Enter an HTTP or HTTPS URL.")); return; }
        apply(linkDescription(link.text, link.start, link.end, link.title.trim() || href, href));
        setLink(null);
      }}>
        <label className="block text-sm">{t("文字", "Text")}<input value={link.title} onChange={event => setLink({ ...link, title: event.target.value })} className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3" /></label>
        <label className="block text-sm">{t("地址", "URL")}<input type="url" required value={link.url} onChange={event => setLink({ ...link, url: event.target.value })} className="mt-2 w-full rounded-lg border border-zinc-300 bg-white p-3" /></label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3"><button type="button" onClick={() => setLink(null)} className="rounded-lg border px-4 py-2 text-sm">{t("取消", "Cancel")}</button><button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white">{t("插入", "Insert")}</button></div>
      </form>
    </Modal></div>, document.body)}
  </div>;
}
