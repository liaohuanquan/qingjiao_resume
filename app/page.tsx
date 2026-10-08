"use client";

import Link from "next/link";
import { FileText, Layout } from "lucide-react";
import { useAppLocale } from "./hooks/useAppLocale";

export default function Home() {
  const { locale, toggleLocale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  return <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900"><header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-6 lg:px-12"><span className="text-xl font-bold">青椒简历</span><button aria-label={t("切换语言", "Switch language")} onClick={toggleLocale} className="rounded-xl border px-4 py-2 text-sm">{locale === "en-US" ? "中文" : "English"}</button></header><div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-8 p-6"><h1 className="text-4xl font-bold">{t("简历编辑", "Resume editor")}</h1><div className="grid gap-5 sm:grid-cols-2"><Link href="/dashboard" className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:border-emerald-500"><FileText className="text-emerald-600" size={28} /><span className="text-lg font-bold">{t("我的简历", "My resumes")}</span></Link><Link href="/dashboard/templates" className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm hover:border-emerald-500"><Layout className="text-emerald-600" size={28} /><span className="text-lg font-bold">{t("简历模板", "Templates")}</span></Link></div></div></main>;
}
