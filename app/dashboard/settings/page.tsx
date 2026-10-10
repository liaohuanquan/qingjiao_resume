"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { resetLocale, useAppLocale } from "../../hooks/useAppLocale";
import { useFileRead } from "../../hooks/useFileRead";
import { Modal } from "../../components/Modal";
import { BackupRestoreDialog } from "../../components/BackupRestoreDialog";
import { clearAppStorage, downloadFile, downloadRawStorage, exportBackup, parseResumeBackup, restoreBackup, type ResumeBackup } from "../../lib/resume-storage";
import { defaultPreferences, readPreferences, savePreferences, type Preferences } from "../../lib/preferences";
import { resetAI } from "../../lib/ai-client";

export default function SettingsPage() {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preferencesError, setPreferencesError] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [restorePreview, setRestorePreview] = useState<{ backup: ResumeBackup; filename: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { read: readBackupFile, cancel: cancelBackupRead, pending: reading } = useFileRead();

  const loadPreferences = useCallback(() => {
    try { setPreferences(readPreferences()); setReady(true); setPreferencesError(false); }
    catch { setReady(false); setPreferencesError(true); setStatus(""); }
  }, []);
  useEffect(() => {
    loadPreferences();
    const external = (event: StorageEvent) => {
      if (event.key === "app_preferences" || event.key === null) { setStatus(""); loadPreferences(); }
      if (event.key === null || (event.key === "resume_list" && event.newValue === null)) {
        cancelBackupRead(); setRestorePreview(null); setStatus(""); setError("");
      }
    };
    window.addEventListener("storage", external);
    window.addEventListener("app-preferences-change", loadPreferences);
    return () => { window.removeEventListener("storage", external); window.removeEventListener("app-preferences-change", loadPreferences); };
  }, [loadPreferences, cancelBackupRead]);
  const change = (value: Preferences) => {
    if (!ready) return;
    try { savePreferences(value); setPreferences(value); setError(""); setStatus(t("已保存", "Saved")); }
    catch { setStatus(""); setError(t("保存失败", "Save failed")); }
  };
  const download = () => {
    setStatus(""); setError("");
    try { downloadFile(exportBackup(locale), "qingjiao-resumes.json"); }
    catch { setError(t("备份失败，请下载原始数据", "Backup failed. Download recovery data.")); }
  };
  const closeRestore = useCallback(() => { cancelBackupRead(); setRestorePreview(null); setError(""); }, [cancelBackupRead]);
  const previewRestore = async (file: File) => {
    setRestorePreview(null); setStatus(""); setError("");
    const result = await readBackupFile(file);
    if (!result?.current()) return;
    setStatus(""); setError("");
    if (!result.ok) { setError(t("文件读取失败", "Cannot read file")); return; }
    try {
      const backup = parseResumeBackup(JSON.parse(result.text));
      if (!backup.resumes.length) { setError(t("备份为空", "Backup is empty")); return; }
      setRestorePreview({ backup, filename: file.name });
    } catch { setError(t("备份格式无效", "Invalid backup format")); }
  };
  const applyRestore = () => {
    if (!restorePreview) return;
    setStatus(""); setError("");
    try {
      const count = restoreBackup(restorePreview.backup);
      closeRestore();
      setStatus(t(`已导入 ${count} 份简历`, `Imported ${count} resumes`));
    } catch { setError(t("恢复失败，请检查存储空间", "Restore failed. Check storage capacity.")); }
  };
  const clear = () => {
    cancelBackupRead(); setRestorePreview(null); setStatus(""); setError("");
    try {
      clearAppStorage(); resetAI();
      window.dispatchEvent(new Event("app-preferences-change")); resetLocale();
      setPreferences(defaultPreferences); setPreferencesError(false); setReady(true); setConfirmClear(false);
      // Clearing also resets the interface language to Chinese.
      setStatus("已清空");
    } catch { setError(t("清空失败", "Could not clear data")); }
  };
  const recovery = () => {
    setStatus("");
    try { downloadRawStorage(); }
    catch { setError(t("存储无法读取", "Storage is unavailable")); }
  };
  return <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-12"><div className="mx-auto max-w-4xl space-y-6"><h1 className="text-3xl font-bold">{t("设置", "Settings")}</h1>{status && <p role="status" className="text-sm text-emerald-600">{status}</p>}{error && !restorePreview && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button type="button" className="mt-2 underline" onClick={recovery}>{t("原始备份", "Recovery data")}</button></div>}
    <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold">{t("外观", "Appearance")}</h2>
      {preferencesError && <div role="alert" className="mb-4 flex flex-wrap gap-3 text-sm text-red-600"><span>{t("设置读取失败", "Cannot read preferences")}</span><button type="button" onClick={loadPreferences}>{t("重试", "Retry")}</button><button type="button" onClick={recovery}>{t("原始备份", "Recovery data")}</button></div>}
      <fieldset disabled={!ready} className="flex flex-wrap gap-4"><legend className="sr-only">{t("主题", "Theme")}</legend>{(["light", "dark", "system"] as const).map(theme => <label key={theme} className="flex items-center gap-2 rounded-xl border px-4 py-3"><input type="radio" name="theme" value={theme} checked={preferences.theme === theme} onChange={() => change({ ...preferences, theme })} />{{ light: t("浅色", "Light"), dark: t("深色", "Dark"), system: t("跟随系统", "System") }[theme]}</label>)}</fieldset><label className="mt-6 flex items-center gap-3 text-sm"><input type="checkbox" disabled={!ready} checked={preferences.reduceMotion} onChange={event => change({ ...preferences, reduceMotion: event.target.checked })} />{t("减少动画", "Reduce motion")}</label></section>
    <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold">{t("数据备份", "Backup")}</h2><div className="flex flex-wrap gap-3"><button type="button" onClick={download} className="rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white">{t("下载备份", "Download backup")}</button><button type="button" onClick={() => fileInput.current?.click()} className="rounded-xl border px-5 py-3 text-sm">{t("恢复备份", "Restore backup")}</button><input aria-label={t("选择备份文件", "Choose backup file")} ref={fileInput} type="file" accept=".json,application/json" hidden onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void previewRestore(file); }} /></div>
      {reading && <div role="status" className="mt-4 flex gap-3 text-sm"><span>{t("读取中", "Reading")}</span><button type="button" onClick={cancelBackupRead}>{t("取消", "Cancel")}</button></div>}
    </section>
    <section className="rounded-2xl border border-red-200 bg-white p-6"><button type="button" onClick={() => { closeRestore(); setStatus(""); setError(""); setConfirmClear(true); }} className="rounded-xl bg-red-600 px-5 py-3 text-sm text-white">{t("清空数据", "Clear data")}</button></section>
    </div>
    {restorePreview && <BackupRestoreDialog backup={restorePreview.backup} filename={restorePreview.filename} error={error} onRestore={applyRestore} onClose={closeRestore} />}
    {confirmClear && <Modal title={t("清空数据", "Clear data")} close={() => setConfirmClear(false)} closeLabel={t("关闭", "Close")}><p className="mb-5 text-sm">{t("将删除全部简历、历史和设置，无法撤销", "All resumes, history, and settings will be deleted permanently.")}</p><div className="flex justify-end gap-3"><button type="button" onClick={() => setConfirmClear(false)} className="rounded-xl border px-5 py-2">{t("取消", "Cancel")}</button><button type="button" className="rounded-xl bg-red-600 px-5 py-2 text-white" onClick={clear}>{t("确认清空", "Clear data")}</button></div>{error && <p role="alert" className="mt-4 text-red-600">{error}</p>}</Modal>}
  </main>;
}
