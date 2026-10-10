"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Copy, Pencil, Trash2 } from "lucide-react";
import { useAppLocale } from "../hooks/useAppLocale";
import type { ResumeMetadata } from "../lib/resume";
import { blankResume } from "../lib/resume-schema";
import { createResume, deleteResume, downloadRawStorage, duplicateResume, listResumesWithLegacy, renameResume } from "../lib/resume-storage";
import { Modal } from "../components/Modal";
import { SavedResumePreview } from "../components/SavedResumePreview";

export default function DashboardPage() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const [resumes, setResumes] = useState<ResumeMetadata[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<ResumeMetadata | null>(null);
  const [title, setTitle] = useState("");
  const load = useCallback(() => {
    try {
      setResumes(listResumesWithLegacy(locale)); setError(null);
    } catch { setError(locale === "en-US" ? "Unable to read saved data. Download recovery data." : "数据读取失败，可下载原始数据"); }
    setLoaded(true);
  }, [locale]);
  useEffect(() => {
    load();
    const onStorage = (event: StorageEvent) => { if (event.key === null || event.key === "resume_list") load(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [load]);
  const act = (action: () => void) => {
    try { action(); load(); }
    catch { setError(t("操作失败，原有内容未被主动清空", "Operation failed. Existing content was not cleared.")); }
  };
  const create = () => act(() => {
    const metadata = createResume(t("未命名简历", "Untitled resume"), blankResume(locale));
    router.push(`/editor?id=${metadata.id}`);
  });
  const duplicate = (event: MouseEvent, resume: ResumeMetadata) => {
    event.preventDefault();
    act(() => { duplicateResume(resume.id, `${resume.title} (${t("副本", "Copy")})`); });
  };
  const filtered = resumes
    .filter(resume => resume.title.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => (Date.parse(b.lastModified) || 0) - (Date.parse(a.lastModified) || 0));
  return <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-12">
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-bold">{t("简历", "Resumes")}</h1><button onClick={create} disabled={!loaded || Boolean(error)} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"><Plus size={18} />{t("新建简历", "New resume")}</button></header>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 space-x-4"><span>{error}</span><button onClick={load}>{t("重试", "Retry")}</button><button onClick={() => { try { downloadRawStorage(); } catch { setError(t("存储无法读取", "Storage is unavailable.")); } }}>{t("原始备份", "Recovery data")}</button></div>}
      <label className="relative block max-w-sm"><span className="sr-only">{t("搜索简历", "Search resumes")}</span><Search className="absolute left-3 top-3 text-zinc-400" size={18} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={t("搜索简历", "Search resumes")} className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm" /></label>
      {!loaded ? <p role="status">{t("加载中", "Loading")}</p> : <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filtered.map(resume => <article key={resume.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <Link href={`/editor?id=${resume.id}`} className="block"><SavedResumePreview resume={resume} /><h2 className="truncate text-lg font-bold">{resume.title || t("未命名简历", "Untitled resume")}</h2><p className="mt-2 text-xs text-zinc-500">{t("更新", "Updated")} {Number.isNaN(Date.parse(resume.lastModified)) ? resume.lastModified : new Date(resume.lastModified).toLocaleDateString(locale)}</p></Link>
        <div className="mt-5 flex justify-end gap-2"><button aria-label={t("重命名", "Rename")} onClick={() => { setRenaming(resume); setTitle(resume.title); }} className="rounded-lg p-2 hover:bg-zinc-100"><Pencil size={17} /></button><button aria-label={t("复制简历", "Duplicate resume")} onClick={event => duplicate(event, resume)} className="rounded-lg p-2 hover:bg-zinc-100"><Copy size={17} /></button><button aria-label={t("删除简历", "Delete resume")} onClick={() => setDeleteId(resume.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div>
      </article>)}</div>}
      {loaded && !error && !filtered.length && <p className="text-sm text-zinc-500">{query ? t("未找到简历", "No matching resumes") : t("暂无简历", "No resumes")}</p>}
    </div>
    {renaming && <Modal title={t("重命名", "Rename")} close={() => setRenaming(null)} closeLabel={t("关闭", "Close")}><form onSubmit={event => { event.preventDefault(); act(() => { renameResume(renaming.id, title.trim() || t("未命名简历", "Untitled resume")); setRenaming(null); }); }} className="space-y-4"><label className="block text-sm">{t("简历名称", "Resume name")}<input value={title} onChange={event => setTitle(event.target.value)} className="mt-2 w-full rounded-xl border p-3" /></label><button type="submit" className="rounded-xl bg-zinc-900 px-5 py-2 text-white">{t("保存", "Save")}</button>{error && <p role="alert" className="text-red-600">{error}</p>}</form></Modal>}
    {deleteId && <Modal title={t("删除简历", "Delete resume")} close={() => setDeleteId(null)} closeLabel={t("关闭", "Close")}><p className="mb-5 text-sm">{t("将删除内容和版本历史，无法撤销", "Content and version history will be deleted permanently.")}</p><div className="flex justify-end gap-3"><button onClick={() => setDeleteId(null)} className="rounded-xl border px-5 py-2">{t("取消", "Cancel")}</button><button onClick={() => act(() => { deleteResume(deleteId); setDeleteId(null); })} className="rounded-xl bg-red-600 px-5 py-2 text-white">{t("删除", "Delete")}</button></div>{error && <p role="alert" className="text-red-600">{error}</p>}</Modal>}
  </main>;
}
