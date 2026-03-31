"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Search,
  Filter,
  Sparkles,
  Crown,
  Layout,
  CheckCircle2,
  ExternalLink,
  Zap,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TEMPLATES = [
  {
    id: "classic",
    name: "极简经典",
    description: "最为稳重的职场选择，适合金融、医疗及传统行业。",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop",
    tag: "最受欢迎",
    isFree: true,
    category: "Classic",
    color: "bg-zinc-900",
  },
  {
    id: "modern",
    name: "现代几何",
    description: "动感的布局设计，深得互联网大厂及设计师的青睐。",
    image:
      "https://images.unsplash.com/photo-1626197031507-c17099753214?q=80&w=2070&auto=format&fit=crop",
    tag: "热门",
    isFree: true,
    category: "Modern",
    color: "bg-blue-600",
  },
  {
    id: "creative",
    name: "极客风范",
    description: "代码高亮风格与终端交互感，为开发者量身打造。",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
    tag: "New",
    isFree: false,
    category: "Creative",
    color: "bg-emerald-600",
  },
  {
    id: "elegant",
    name: "优雅极简",
    description: "大面积留白与精致衬线体，展现从容的职业态度。",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop",
    tag: "Pro",
    isFree: false,
    category: "Elegant",
    color: "bg-amber-600",
  },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = TEMPLATES.filter(
    (t) =>
      (activeTab === "All" || t.category === activeTab) &&
      (t.name.includes(searchQuery) || t.description.includes(searchQuery)),
  );

  return (
    <div className="flex-1 min-h-full p-8 lg:p-12 bg-zinc-50/50 flex flex-col items-center overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              <Sparkles size={14} /> Resume Gallery
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              简历模板仓库
            </h1>
            <p className="text-zinc-500 font-medium text-lg">
              从 10+ 款精心设计的专业模板中，挑选最契合您职业气质的一款。
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors"
              />
              <input
                type="text"
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[320px] h-12 pl-12 pr-4 bg-white border border-zinc-200 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Categories Tab */}
        <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Classic", "Modern", "Creative", "Elegant"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                  : "bg-white text-zinc-500 hover:bg-zinc-50 border border-zinc-200",
              )}
            >
              {tab === "All" ? "全部风格" : tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-emerald-600 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <Zap size={14} className="fill-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              已解锁专家模式
            </span>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {filteredTemplates.map((template, idx) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={template.id}
              className="group bg-white rounded-[2.5rem] border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-500 flex flex-col sm:flex-row h-full"
            >
              {/* Left: Preview Image */}
              <div className="w-full sm:w-[240px] h-[300px] sm:h-auto overflow-hidden relative shrink-0">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <button className="px-6 py-2.5 bg-white rounded-full text-xs font-bold text-zinc-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    快速预览
                  </button>
                </div>
                {!template.isFree && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-amber-400 text-amber-950 text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg shadow-amber-400/20 flex items-center gap-1.5 border border-amber-300">
                    <Crown size={12} /> Pro
                  </div>
                )}
                {template.id === "classic" && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={18} />
                  </div>
                )}
              </div>

              {/* Right: Content */}
              <div className="flex-1 p-8 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] mb-2",
                        template.color,
                        "text-white",
                      )}
                    >
                      {template.category}
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 group-hover:text-emerald-600 transition-colors">
                      {template.name}
                    </h3>
                  </div>
                  <button className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Heart size={20} />
                  </button>
                </div>

                <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium">
                  {template.description}
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <button className="flex-1 h-12 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-200 transition-all active:scale-95">
                    立即使用
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-dashed border-zinc-200 text-center animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 mb-4">
            <Layout size={16} className="text-emerald-400" />{" "}
            更新中：即将推出“学术风”模板
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            QingJiao Resume • The Future of Identity Design
          </p>
        </footer>
      </div>
    </div>
  );
}
