"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAppLocale, type AppLocale } from "@/app/hooks/useAppLocale";
import {
  FileText,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  LogOut,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COPY = {
  "zh-CN": {
    main: "主菜单",
    tools: "高级工具",
    resumes: "我的简历",
    templates: "简历模板",
    ai: "AI 服务商",
    settings: "通用设置",
    logout: "退出登录",
    lang: "EN",
    menu: "打开菜单",
    close: "关闭菜单",
    switchLanguage: "切换语言",
  },
  "en-US": {
    main: "Main",
    tools: "Tools",
    resumes: "Resumes",
    templates: "Templates",
    ai: "AI Providers",
    settings: "Settings",
    logout: "Sign out",
    lang: "中文",
    menu: "Open menu",
    close: "Close menu",
    switchLanguage: "Switch language",
  },
} satisfies Record<AppLocale, Record<string, string>>;

// 侧边栏导航链接组件
const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
  onNavigate,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
}) => (
  <Link
    href={href}
    onClick={onNavigate}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
      active
        ? "bg-zinc-100 text-zinc-900 shadow-sm"
        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
    )}
  >
    <Icon
      size={18}
      className={cn(
        "transition-colors",
        active ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900",
      )}
    />
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { locale, toggleLocale } = useAppLocale();
  const copy = COPY[locale];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const closeMobileSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {isSidebarOpen && (
        <button
          aria-label={copy.close}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* 左侧导航侧边栏 */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 lg:relative h-full bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out z-50",
          isSidebarOpen
            ? "w-[260px]"
            : "w-0 -translate-x-full lg:w-[260px] lg:translate-x-0",
        )}
      >
        {/* Logo 区 */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-zinc-100 shrink-0">
          <Link
            href="/"
            className="w-9 h-9 overflow-hidden rounded-full shadow-lg shadow-zinc-200 hover:scale-105 transition-transform"
          >
            <Image
              src="/qingjiao_resume/images/qinfjiao_resume.png"
              alt="青椒简历 Logo"
              width={36}
              height={36}
              className="object-cover"
            />
          </Link>
          <span className="font-bold text-lg tracking-tight text-zinc-900">
            青椒简历
          </span>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
          <div className="mb-4">
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              {copy.main}
            </p>
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label={copy.resumes}
              active={pathname === "/dashboard"}
              onNavigate={closeMobileSidebar}
            />
            <NavItem
              href="/dashboard/templates"
              icon={FileText}
              label={copy.templates}
              active={pathname === "/dashboard/templates"}
              onNavigate={closeMobileSidebar}
            />
          </div>

          <div>
            <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
              {copy.tools}
            </p>
            <NavItem
              href="/dashboard/ai"
              icon={BrainCircuit}
              label={copy.ai}
              active={pathname === "/dashboard/ai"}
              onNavigate={closeMobileSidebar}
            />
            <NavItem
              href="/dashboard/settings"
              icon={Settings}
              label={copy.settings}
              active={pathname === "/dashboard/settings"}
              onNavigate={closeMobileSidebar}
            />
          </div>
        </nav>

        {/* 底部退出区 */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
            <LogOut
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
            <span className="font-medium text-sm">{copy.logout}</span>
          </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 内容顶栏 (可选，用于放置切换按钮) */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-zinc-50/50 absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label={copy.menu}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:shadow-sm transition-all pointer-events-auto lg:hidden"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={toggleLocale}
            aria-label={copy.switchLanguage}
            className="h-10 px-4 rounded-xl bg-white border border-zinc-200 text-xs font-black text-zinc-500 hover:text-zinc-900 hover:shadow-sm transition-all pointer-events-auto"
          >
            {copy.lang}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
