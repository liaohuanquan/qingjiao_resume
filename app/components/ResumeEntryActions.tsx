"use client";

import { ChevronDown } from "lucide-react";
import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeEntryAction } from "../lib/resume-edit";

export function ResumeEntryActions({ id, label, index, count, collapsed, bodyId, onToggle, onAction }: {
  id: string; label: string; index: number; count: number; collapsed: boolean; bodyId: string;
  onToggle: () => void;
  onAction: (action: ResumeEntryAction, trigger: HTMLButtonElement) => void;
}) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const actions: { action: ResumeEntryAction; title: string; disabled?: boolean }[] = [
    { action: "up", title: t("上移", "Move up"), disabled: index === 0 },
    { action: "down", title: t("下移", "Move down"), disabled: index === count - 1 },
    { action: "copy", title: t("复制", "Copy") },
    { action: "remove", title: t("删除", "Delete") },
  ];
  return <div role="group" aria-label={label} data-entry-id={id} className="space-y-2 border-b border-zinc-100 pb-3">
    <button type="button" aria-expanded={!collapsed} aria-controls={bodyId} onClick={onToggle}
      aria-label={`${collapsed ? t("展开", "Expand") : t("收起", "Collapse")} · ${label}`}
      className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm font-medium text-zinc-700 hover:bg-zinc-100">
      <span className="truncate">{label}</span><ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform ${collapsed ? "-rotate-90" : ""}`} />
    </button>
    <div className="flex flex-wrap justify-end gap-1">{actions.map(({ action, title, disabled }) => <button key={action} type="button" disabled={disabled} data-entry-action={action}
      aria-label={`${title} · ${label}`} onClick={event => onAction(action, event.currentTarget)}
      className={`rounded-md px-2 py-1.5 text-xs disabled:opacity-30 ${action === "remove" ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-100"}`}>{title}</button>)}</div>
  </div>;
}
