"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppLocale } from "../../hooks/useAppLocale";
import { ResumeDocument } from "../../components/ResumeDocument";
import { Modal } from "../../components/Modal";
import { blankResume, sampleResume, templateIds } from "../../lib/resume-schema";
import { createResume } from "../../lib/resume-storage";
import { PAPER_WIDTH } from "../../lib/resume-layout";
import type { ResumeTemplateId } from "../../lib/resume";

export default function TemplatesPage() {
  const router = useRouter();
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const names: Record<ResumeTemplateId, string> = { classic: t("经典单栏", "Classic"), split: t("左右分栏", "Split"), tech: t("技术模板", "Technical") };
  const sample = useMemo(() => sampleResume(locale), [locale]);
  const [preview, setPreview] = useState<ResumeTemplateId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const useTemplate = (templateId: ResumeTemplateId) => {
    try {
      const config = { ...blankResume(locale), templateId };
      const resume = createResume(t("未命名简历", "Untitled resume"), config);
      router.push(`/editor?id=${resume.id}`);
    } catch { setError(t("新建失败，请检查本机存储", "Could not create a resume. Check local storage.")); }
  };
  return <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-12"><div className="mx-auto max-w-6xl"><h1 className="mb-8 text-3xl font-bold">{t("模板", "Templates")}</h1>{error && <p role="alert" className="mb-5 text-red-600">{error}</p>}<div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{templateIds.map(id => <article key={id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"><button onClick={() => setPreview(id)} aria-label={`${t("预览", "Preview")} ${names[id]}`} className="template-thumbnail block h-72 w-full overflow-hidden bg-zinc-100 p-4"><div aria-hidden="true" className="pointer-events-none" style={{ width: PAPER_WIDTH, transform: "scale(.3)", transformOrigin: "top left" }}><ResumeDocument config={{ ...sample, templateId: id }} /></div></button><div className="space-y-4 p-6"><h2 className="text-lg font-bold">{names[id]}</h2><div className="flex gap-3"><button className="rounded-xl border px-4 py-2 text-sm" onClick={() => setPreview(id)}>{t("预览", "Preview")}</button><button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white" onClick={() => useTemplate(id)}>{t("使用模板", "Use template")}</button></div></div></article>)}</div></div>
    {preview && <Modal title={names[preview]} close={() => setPreview(null)} closeLabel={t("关闭", "Close")}><div className="overflow-auto bg-zinc-100 p-3"><div style={{ width: PAPER_WIDTH, zoom: 0.75 }}><ResumeDocument config={{ ...sample, templateId: preview }} /></div></div><button className="mt-5 rounded-xl bg-zinc-900 px-4 py-2 text-white" onClick={() => useTemplate(preview)}>{t("使用模板", "Use template")}</button>{error && <p role="alert" className="text-red-600">{error}</p>}</Modal>}
  </main>;
}
