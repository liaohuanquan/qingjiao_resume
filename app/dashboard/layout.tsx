"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  BrainCircuit,
  Settings,
  LogOut,
  Maximize2,
  Menu,
  type LucideIcon,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 侧边栏导航链接组件
const NavItem = ({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active?: boolean;
}) => (
  <Link
    href={href}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* 左侧导航侧边栏 */}
      <aside
        className={cn(
          "h-full bg-white border-r border-zinc-200 flex flex-col transition-all duration-300 ease-in-out z-50",
          isSidebarOpen ? "w-[260px]" : "w-[0px] lg:w-[80px] -translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo 区 */}
        <div className="h-20 flex items-center px-6 gap-3 border-b border-zinc-100 shrink-0">
          <div className="w-9 h-9 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
            <Maximize2 size={20} className="text-white" />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg tracking-tight text-zinc-900">
              青椒简历
            </span>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
          <div className="mb-4">
            {isSidebarOpen && (
              <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                主菜单
              </p>
            )}
            <NavItem
              href="/dashboard"
              icon={LayoutDashboard}
              label={isSidebarOpen ? "我的简历" : ""}
              active={pathname === "/dashboard"}
            />
            <NavItem
              href="/dashboard/templates"
              icon={FileText}
              label={isSidebarOpen ? "简历模板" : ""}
              active={pathname === "/dashboard/templates"}
            />
          </div>

          <div>
             {isSidebarOpen && (
              <p className="px-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                高级工具
              </p>
            )}
            <NavItem
              href="/dashboard/ai"
              icon={BrainCircuit}
              label={isSidebarOpen ? "AI 服务商" : ""}
              active={pathname === "/dashboard/ai"}
            />
            <NavItem
              href="/dashboard/settings"
              icon={Settings}
              label={isSidebarOpen ? "通用设置" : ""}
              active={pathname === "/dashboard/settings"}
            />
          </div>
        </nav>

        {/* 底部退出区 */}
        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group">
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            {isSidebarOpen && <span className="font-medium text-sm">退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* 内容顶栏 (可选，用于放置切换按钮) */}
        <header className="h-16 flex items-center px-8 bg-zinc-50/50 absolute top-0 left-0 right-0 z-10 pointer-events-none">
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:shadow-sm transition-all pointer-events-auto"
          >
            <Menu size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-hide pt-16">
          {children}
        </main>
      </div>
    </div>
  );
}
