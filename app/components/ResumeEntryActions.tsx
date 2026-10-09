"use client";

import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeEntryAction } from "../lib/resume-edit";

export function ResumeEntryActions({ id, label, index, count, onAction }: {
  id: string; label: string; index: number; count: number;
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
  return <div role="group" aria-label={label} data-entry-id={id} className="flex flex-wrap justify-end gap-1 border-b border-zinc-100 pb-3">
    {actions.map(({ action, title, disabled }) => <button key={action} type="button" disabled={disabled} data-entry-action={action}
      aria-label={`${title} · ${label}`} onClick={event => onAction(action, event.currentTarget)}
      className={`rounded-md px-2 py-1.5 text-xs disabled:opacity-30 ${action === "remove" ? "text-red-600 hover:bg-red-50" : "text-zinc-600 hover:bg-zinc-100"}`}>{title}</button>)}
  </div>;
}
