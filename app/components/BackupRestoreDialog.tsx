"use client";

import { Modal } from "./Modal";
import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeBackup } from "../lib/resume-storage";

export function BackupRestoreDialog({ backup, filename, error, onRestore, onClose }: { backup: ResumeBackup; filename: string; error: string; onRestore: () => void; onClose: () => void }) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  return <Modal title={t("恢复备份", "Restore backup")} close={onClose} closeLabel={t("关闭", "Close")}>
    <p className="mb-2 break-all text-sm text-zinc-500">{filename}</p>
    <p className="mb-4 text-sm">{t("将新增简历，现有内容保留", "Adds new resumes and keeps existing content.")}</p>
    <p className="mb-3 text-sm font-medium">{t(`${backup.resumes.length} 份简历`, `${backup.resumes.length} resumes`)}</p>
    <ul className="max-h-64 divide-y divide-zinc-100 overflow-y-auto rounded-xl border border-zinc-200 px-4">{backup.resumes.map((entry, index) => <li key={index} className="flex items-start justify-between gap-4 py-3 text-sm"><span className="min-w-0 break-words">{entry.metadata.title || t("未命名简历", "Untitled resume")}</span><span className="shrink-0 text-xs text-zinc-500">{t(`历史 ${entry.history.length} 份`, `${entry.history.length} snapshots`)}</span></li>)}</ul>
    {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
    <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">{t("取消", "Cancel")}</button><button type="button" disabled={!backup.resumes.length} onClick={onRestore} className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50">{t("确认恢复", "Restore")}</button></div>
  </Modal>;
}
