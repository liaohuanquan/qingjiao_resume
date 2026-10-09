"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Layout, Settings, Sparkles, Menu, X } from "lucide-react";
import { useAppLocale } from "../hooks/useAppLocale";
import { useModalFocus } from "../hooks/useModalFocus";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { locale, toggleLocale } = useAppLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (media.matches) setOpen(false); };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);
  useModalFocus(open, () => setOpen(false), "[data-navigation]");
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const entries = [{ path: "/dashboard", label: t("简历", "Resumes"), Icon: FileText }, { path: "/dashboard/templates", label: t("模板", "Templates"), Icon: Layout }, { path: "/dashboard/ai", label: t("AI 设置", "AI settings"), Icon: Sparkles }, { path: "/dashboard/settings", label: t("设置", "Settings"), Icon: Settings }];
  return <div className="flex h-screen w-full overflow-hidden bg-zinc-50 text-zinc-900">
    {open && <button aria-label={t("关闭菜单", "Close menu")} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/40 lg:hidden" />}
    <aside data-navigation role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label={t("功能菜单", "Navigation")} className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:relative lg:translate-x-0 lg:visible ${open ? "translate-x-0 visible" : "-translate-x-full invisible"}`}>
      <div className="flex h-20 items-center justify-between border-b border-zinc-100 px-6"><Link href="/" className="text-xl font-bold">青椒简历</Link><button aria-label={t("关闭菜单", "Close menu")} onClick={() => setOpen(false)} className="p-2 lg:hidden"><X size={18} /></button></div>
      <nav aria-label={t("功能菜单", "Navigation")} className="space-y-2 p-4">{entries.map(({ path, label, Icon }) => { const active = pathname.replace(/\/$/, "") === path; return <Link key={path} href={path} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${active ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}><Icon size={18} />{label}</Link>; })}</nav>
      <button onClick={toggleLocale} aria-label={t("切换语言", "Switch language")} className="mx-4 mb-5 mt-auto rounded-xl border border-zinc-200 px-4 py-3 text-sm">{locale === "en-US" ? "中文" : "English"}</button>
    </aside>
    <div className="flex min-w-0 flex-1 flex-col"><header className="flex h-14 shrink-0 items-center border-b bg-white px-4 lg:hidden"><button aria-label={t("打开菜单", "Open menu")} aria-expanded={open} onClick={() => setOpen(true)} className="mr-3 p-2"><Menu size={20} /></button><span className="font-bold">青椒简历</span></header>{children}</div>
  </div>;
}
