"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  FileEdit,
  ShieldCheck,
  Copy,
  LayoutDashboard,
  Search,
} from "lucide-react";

// --- 类型定义 ---
interface ResumeMetadata {
  id: string;
  title: string;
  lastModified: string;
  theme: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeMetadata[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("resume_list");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    const defaultResume: ResumeMetadata = {
      id: "default-1",
      title: "我的第一份简历",
      lastModified: new Date().toLocaleDateString(),
      theme: "#10b981",
    };
    return [defaultResume];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. 初始化后的副作用
  useEffect(() => {
    // 首次加载后确保同步到本地存储（针对首次访问的情况）
    if (localStorage.getItem("resume_list") === null) {
      localStorage.setItem("resume_list", JSON.stringify(resumes));
    }
    setIsLoaded(true);
  }, []);

  // 2. 持久化存储
  const saveToStorage = (list: ResumeMetadata[]) => {
    setResumes(list);
    localStorage.setItem("resume_list", JSON.stringify(list));
  };

  // 3. 功能函数：新建简历
  const handleCreate = () => {
    const newId = crypto.randomUUID();
    const newResume: ResumeMetadata = {
      id: newId,
      title: "未命名简历",
      lastModified: new Date().toLocaleDateString(),
      theme: "#10b981",
    };
    const newList = [newResume, ...resumes];
    saveToStorage(newList);
    router.push(`/editor?id=${newId}`);
  };

  // 4. 功能函数：删除简历
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("确定要删除这份简历吗？此操作不可撤销。")) {
      const newList = resumes.filter((r) => r.id !== id);
      saveToStorage(newList);
      // 同时清理该简历的具体内容数据
      localStorage.removeItem(`resume_data_${id}`);
    }
  };

  // 5. 功能函数：克隆简历
  const handleDuplicate = (e: React.MouseEvent, resume: ResumeMetadata) => {
    e.preventDefault();
    e.stopPropagation();
    const newId = crypto.randomUUID();
    const newResume: ResumeMetadata = {
      ...resume,
      id: newId,
      title: `${resume.title} (副本)`,
      lastModified: new Date().toLocaleDateString(),
    };
    
    // 获取原文档数据并复制一份
    const originalData = localStorage.getItem(`resume_data_${resume.id}`);
    if (originalData) {
      localStorage.setItem(`resume_data_${newId}`, originalData);
    }
    
    const newList = [newResume, ...resumes];
    saveToStorage(newList);
  };

  // 过滤后的简历列表
  const filteredResumes = resumes.filter((r) =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-medium text-zinc-400">正在准备您的仪表盘...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-full flex flex-col p-8 lg:p-12 bg-zinc-50/50">
      {/* 1. 顶部提示横幅 */}
      <div className="group flex items-center justify-between p-4 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all duration-300 mb-10 overflow-hidden relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-900 leading-tight">
              数据本地安全存储
            </p>
            <p className="text-xs text-emerald-600/80">
              您的简历数据完全存储在本地浏览器中，确保隐私与安全。
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:block h-8 w-px bg-emerald-200" />
          <p className="hidden md:block text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            {resumes.length} 份简历文档
          </p>
        </div>
      </div>

      {/* 2. 页面标题与操作栏 */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-zinc-200/50">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-600">
            <LayoutDashboard size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 mb-1">
            简历中心
          </h1>
          <p className="text-zinc-500 text-sm font-medium">
            在这里管理您的求职文档，点击卡片即可开始编辑。
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          <div className="relative group">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input 
              type="text" 
              placeholder="搜索简历标题..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium text-zinc-700 w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all"
            />
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-zinc-900 border border-zinc-900 rounded-xl text-sm font-bold text-white hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} strokeWidth={3} /> 新建简历
          </button>
        </div>
      </header>

      {/* 3. 简历卡片网格区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {/* A. 新建简历占位卡 */}
        <button
          onClick={handleCreate}
          className="group relative flex flex-col items-center justify-center h-[340px] bg-white border-2 border-dashed border-zinc-200 rounded-3xl hover:border-emerald-400 hover:bg-emerald-50/10 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 ease-out"
        >
          <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-full flex items-center justify-center text-zinc-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm group-hover:shadow-lg group-hover:rotate-90">
            <Plus size={24} strokeWidth={3} />
          </div>
          <div className="mt-5 text-center px-6">
            <p className="text-base font-bold text-zinc-900 mb-1">新建简历</p>
            <p className="text-xs text-zinc-500 leading-relaxed font-medium">
              创建一个全新的简历配置<br />开始您的职业新篇章
            </p>
          </div>
        </button>

        {/* B. 已存在简历卡列表 */}
        {filteredResumes.map((resume) => (
          <div
            key={resume.id}
            className="group relative bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-200 transition-all duration-500 hover:-translate-y-2 flex flex-col h-[340px]"
          >
            {/* 缩略图区 - A4 比例预览容器 */}
            <Link 
              href={`/editor?id=${resume.id}`}
              className="flex-1 bg-zinc-50 flex items-center justify-center p-8 border-b border-zinc-100 relative overflow-hidden cursor-pointer"
            >
              <div className="w-full aspect-[21/29.7] max-h-full bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-sm transform group-hover:scale-[1.08] transition-transform duration-700 ease-out p-4 space-y-3">
                {/* 模拟纸张视觉 */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full opacity-20" style={{ backgroundColor: resume.theme }} />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 w-full bg-zinc-100 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-zinc-50 rounded-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-zinc-100/80 rounded-full" />
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full" />
                  <div className="h-1.5 w-5/6 bg-zinc-50 rounded-full" />
                </div>
                <div className="pt-2 space-y-2">
                  <div className="h-1 w-full bg-zinc-100/50 rounded-full" />
                  <div className="h-1 w-4/5 bg-zinc-50 rounded-full" />
                </div>
              </div>
              
              {/* 悬浮的操作层 */}
              <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex items-center gap-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="px-5 py-2.5 bg-white rounded-full text-zinc-900 font-bold text-sm shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
                    <FileEdit size={16} /> 编辑简历
                  </div>
                </div>
              </div>
            </Link>

            {/* 信息与操作区 */}
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-bold text-zinc-900 text-base mb-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {resume.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: resume.theme }}
                    />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {resume.lastModified} 更新
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={(e) => handleDuplicate(e, resume)}
                    className="p-2 bg-zinc-50 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
                    title="复制简历"
                  >
                    <Copy size={16} />
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, resume.id)}
                    className="p-2 bg-zinc-50 rounded-xl text-zinc-500 hover:bg-red-50 hover:text-red-500 transition-all"
                    title="删除简历"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* 空搜索状态 */}
        {filteredResumes.length === 0 && searchQuery && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400 mb-4">
              <Search size={32} />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">未找到相关简历</h3>
            <p className="text-zinc-500 text-sm mt-1">换个关键词试试，或者新建一份简历吧。</p>
          </div>
        )}
      </div>
    </div>
  );
}
