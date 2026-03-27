"use client";

import React from "react";
import Link from "next/link";
import {
  Plus,
  Settings,
  Trash2,
  FileEdit,
  ExternalLink,
  ShieldCheck,
  Code,
} from "lucide-react";

// 模拟数据：现有的简历列表
const resumes = [
  { id: "1", title: "QingJiao", lastModified: "2 天前", theme: "#10b981" },
  {
    id: "2",
    title: "前端开发工程师-廖欢全",
    lastModified: "1 周前",
    theme: "#3b82f6",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 min-h-full flex flex-col p-8 lg:p-12 animate-in fade-in zoom-in-95 duration-700 ease-out fill-mode-forwards">
      {/* 1. 顶部提示横幅 (Banner) */}
      <div className="group flex items-center justify-between p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all duration-300 mb-10 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900 leading-tight">
              数据已成功备份
            </p>
            <p className="text-xs text-emerald-600/80">
              所有的简历配置已同步至浏览器本地存储，随时随地开启编辑。
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 transition-all group-hover:-translate-x-1 duration-200">
          <Settings
            size={14}
            className="group-hover:rotate-45 transition-transform"
          />
          去查看
        </button>
      </div>

      {/* 2. 页面标题与操作栏 */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-zinc-200/50">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">
            我的简历
          </h1>
          <p className="text-zinc-500 text-sm">
            通过极简的 SaaS 控制面板管理您的所有简历文档。
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm">
            <Code size={16} /> 导入简历
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border border-zinc-900 rounded-xl text-sm font-bold text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 hover:-translate-y-0.5 active:translate-y-0">
            <Plus size={16} /> 新建简历
          </button>
        </div>
      </header>

      {/* 3. 简历卡片网格区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* A. 新建简历占位卡 */}
        <Link
          href="/editor"
          className="group relative flex flex-col items-center justify-center h-[320px] bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-[2rem] hover:border-zinc-400 hover:bg-white hover:shadow-2xl hover:shadow-zinc-200/50 transition-all duration-500 ease-out"
        >
          <div className="w-14 h-14 bg-white border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:rotate-90">
            <Plus size={24} />
          </div>
          <div className="mt-5 text-center px-6">
            <p className="text-base font-bold text-zinc-900 mb-1">新建简历</p>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              创建一个全新的简历配置以开始您的求职之旅
            </p>
          </div>
        </Link>

        {/* B. 已存在简历卡列表 */}
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="group relative bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-200 transition-all duration-500 hover:-translate-y-2 flex flex-col h-[320px]"
          >
            {/* 缩略图区 - A4 比例预览容器 */}
            <div className="flex-1 bg-zinc-50 flex items-center justify-center p-6 border-b border-zinc-100 relative overflow-hidden">
              <div className="w-full aspect-[21/29.7] max-h-full bg-white border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-sm transform group-hover:scale-[1.05] transition-transform duration-700 ease-out p-3 space-y-2">
                {/* 模拟纸张视觉 */}
                <div className="w-8 h-8 rounded-full bg-zinc-100/50 mb-4" />
                <div className="h-1.5 w-full bg-zinc-100 rounded-full" />
                <div className="h-1.5 w-3/4 bg-zinc-100 rounded-full" />
                <div className="h-1.5 w-1/2 bg-zinc-100 rounded-full pt-4" />
                <div className="h-1 w-full bg-zinc-50 rounded-full" />
                <div className="h-1 w-full bg-zinc-50 rounded-full" />
              </div>
              {/* 悬浮的操作层 */}
              <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/5 transition-colors duration-500 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="w-10 h-10 rounded-full bg-white shadow-xl flex items-center justify-center text-zinc-900 hover:scale-110 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>

            {/* 信息与操作区 */}
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-900 text-base mb-1 line-clamp-1">
                  {resume.title}
                </h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: resume.theme }}
                  />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                    {resume.lastModified}修改
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href="/editor"
                  className="p-2.5 bg-zinc-50 rounded-xl text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all duration-300"
                >
                  <FileEdit size={16} />
                </Link>
                <button className="p-2.5 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all duration-300">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
