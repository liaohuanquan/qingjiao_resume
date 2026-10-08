"use client";

import { useEffect, useRef, useState } from "react";
import { resetLocale, useAppLocale } from "../../hooks/useAppLocale";
import { Modal } from "../../components/Modal";
import { clearAppStorage, downloadFile, downloadRawStorage, exportBackup, restoreBackup } from "../../lib/resume-storage";
import { defaultPreferences, readPreferences, savePreferences, type Preferences } from "../../lib/preferences";
import { resetAI } from "../../lib/ai-client";

export default function SettingsPage() {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const restoreReader = useRef<FileReader | null>(null);
  useEffect(() => () => { restoreReader.current?.abort(); }, []);
  useEffect(() => {
    try { setPreferences(readPreferences()); setReady(true); }
    catch { setError(locale === "en-US" ? "Unable to read preferences. Download recovery data." : "设置读取失败，可下载原始数据"); }
  }, [locale]);
  const change = (value: Preferences) => {
    if (!ready) return;
    try { savePreferences(value); setPreferences(value); setError(""); setStatus(t("已保存", "Saved")); }
    catch { setStatus(""); setError(t("保存失败", "Save failed")); }
  };
  const download = () => {
    try { downloadFile(exportBackup(), "qingjiao-resumes.json"); setError(""); setStatus(""); }
    catch { setError(t("备份失败，请下载原始数据", "Backup failed. Download recovery data.")); }
  };
  const restore = (file: File) => {
    restoreReader.current?.abort();
    const reader = new FileReader();
    restoreReader.current = reader;
    reader.onerror = () => setError(t("文件读取失败", "Cannot read file"));
    reader.onload = () => {
      try { const count = restoreBackup(JSON.parse(String(reader.result))); setError(""); setStatus(t(`已导入 ${count} 份简历`, `Imported ${count} resumes`)); }
      catch { setStatus(""); setError(t("恢复失败，请检查文件和存储空间", "Restore failed. Check the file and storage capacity.")); }
    };
    reader.readAsText(file);
  };
  return <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-12"><div className="mx-auto max-w-4xl space-y-6"><h1 className="text-3xl font-bold">{t("设置", "Settings")}</h1>{status && <p role="status" className="text-sm text-emerald-600">{status}</p>}{error && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700"><p>{error}</p><button className="mt-2 underline" onClick={() => { try { downloadRawStorage(); } catch { setError(t("存储无法读取", "Storage is unavailable")); } }}>{t("原始备份", "Recovery data")}</button></div>}
    <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold">{t("外观", "Appearance")}</h2><fieldset disabled={!ready} className="flex flex-wrap gap-4"><legend className="sr-only">{t("主题", "Theme")}</legend>{(["light", "dark", "system"] as const).map(theme => <label key={theme} className="flex items-center gap-2 rounded-xl border px-4 py-3"><input type="radio" name="theme" value={theme} checked={preferences.theme === theme} onChange={() => change({ ...preferences, theme })} />{{ light: t("浅色", "Light"), dark: t("深色", "Dark"), system: t("跟随系统", "System") }[theme]}</label>)}</fieldset><label className="mt-6 flex items-center gap-3 text-sm"><input type="checkbox" disabled={!ready} checked={preferences.reduceMotion} onChange={event => change({ ...preferences, reduceMotion: event.target.checked })} />{t("减少动画", "Reduce motion")}</label></section>
    <section className="rounded-2xl border border-zinc-200 bg-white p-6"><h2 className="mb-5 text-lg font-bold">{t("数据备份", "Backup")}</h2><div className="flex flex-wrap gap-3"><button onClick={download} className="rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white">{t("下载备份", "Download backup")}</button><button onClick={() => fileInput.current?.click()} className="rounded-xl border px-5 py-3 text-sm">{t("恢复备份", "Restore backup")}</button><input aria-label={t("选择备份文件", "Choose backup file")} ref={fileInput} type="file" accept=".json,application/json" hidden onChange={event => { const file = event.target.files?.[0]; event.target.value = ""; if (file) restore(file); }} /></div></section>
    <section className="rounded-2xl border border-red-200 bg-white p-6"><button onClick={() => setConfirmClear(true)} className="rounded-xl bg-red-600 px-5 py-3 text-sm text-white">{t("清空数据", "Clear data")}</button></section>
    </div>{confirmClear && <Modal title={t("清空数据", "Clear data")} close={() => setConfirmClear(false)} closeLabel={t("关闭", "Close")}><p className="mb-5 text-sm">{t("将删除全部简历、历史和设置，无法撤销", "All resumes, history, and settings will be deleted permanently.")}</p><div className="flex justify-end gap-3"><button onClick={() => setConfirmClear(false)} className="rounded-xl border px-5 py-2">{t("取消", "Cancel")}</button><button className="rounded-xl bg-red-600 px-5 py-2 text-white" onClick={() => { try { restoreReader.current?.abort(); clearAppStorage(); resetAI(); window.dispatchEvent(new Event("app-preferences-change")); resetLocale(); setPreferences(defaultPreferences); setReady(true); setConfirmClear(false); setStatus(t("已清空", "Cleared")); setError(""); } catch { setError(t("清空失败", "Could not clear data")); } }}>{t("确认清空", "Clear data")}</button></div>{error && <p role="alert" className="text-red-600">{error}</p>}</Modal>}
  </main>;
}
