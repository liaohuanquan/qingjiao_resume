"use client";

import Link from "next/link";
import { ArrowUpRight, FileText, Layout } from "lucide-react";
import { useAppLocale } from "./hooks/useAppLocale";

export default function Home() {
  const { locale, toggleLocale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const entries = [
    { href: "/dashboard", label: t("我的简历", "My resumes"), Icon: FileText },
    { href: "/dashboard/templates", label: t("简历模板", "Templates"), Icon: Layout },
  ];
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 text-zinc-900">
      <header className="flex h-20 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-6 lg:px-12">
        <span className="text-xl font-bold">青椒简历</span>
        <button aria-label={t("切换语言", "Switch language")} onClick={toggleLocale} className="rounded-xl border border-zinc-200 px-4 py-2 text-sm">{locale === "en-US" ? "中文" : "English"}</button>
      </header>
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-12">
        <section className="space-y-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{t("简历编辑", "Resume editor")}</h1>
          <div className="grid gap-4 sm:grid-cols-2">
            {entries.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className="group flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-500">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon aria-hidden="true" size={24} /></div>
                <span className="flex-1 text-lg font-bold">{label}</span>
                <ArrowUpRight aria-hidden="true" size={20} className="text-zinc-400 group-hover:text-emerald-600" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
