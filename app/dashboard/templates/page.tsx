"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Heart,
  Search,
  Sparkles,
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
    id: "split",
    name: "左右分栏",
    description: "更高信息密度，适合管理、运营及综合型岗位。",
    image:
      "https://images.unsplash.com/photo-1626197031507-c17099753214?q=80&w=2070&auto=format&fit=crop",
    tag: "热门",
    isFree: true,
    category: "Split",
    color: "bg-zinc-700",
  },
  {
    id: "tech",
    name: "技术岗版",
    description: "强化技能、项目和工程成果，为开发者量身打造。",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop",
    tag: "New",
    isFree: true,
    category: "Tech",
    color: "bg-emerald-600",
  },
];

type Locale = "zh-CN" | "en-US";

const COPY = {
  "zh-CN": {
    eyebrow: "Resume Gallery",
    title: "简历模板仓库",
    subtitle: "从 3 款精心设计的专业模板中，挑选最契合职业气质的一款。",
    searchPlaceholder: "搜索模板...",
    all: "全部风格",
    expertMode: "已解锁专家模式",
    current: "当前模板",
    use: "立即使用",
    preview: "快速预览",
    footerBadge: "更新中：即将推出“学术风”模板",
    footer: "QingJiao Resume • The Future of Identity Design",
    lang: "EN",
  },
  "en-US": {
    eyebrow: "Resume Gallery",
    title: "Resume Template Gallery",
    subtitle:
      "Choose from three polished resume templates for different career profiles.",
    searchPlaceholder: "Search templates...",
    all: "All",
    expertMode: "Expert mode unlocked",
    current: "Current",
    use: "Use template",
    preview: "Preview",
    footerBadge: "Academic template is coming soon",
    footer: "QingJiao Resume • The Future of Identity Design",
    lang: "中文",
  },
} satisfies Record<Locale, Record<string, string>>;

const TEMPLATE_COPY: Record<
  Locale,
  Record<string, { name: string; description: string }>
> = {
  "zh-CN": {
    classic: {
      name: "极简经典",
      description: "最为稳重的职场选择，适合金融、医疗及传统行业。",
    },
    split: {
      name: "左右分栏",
      description: "更高信息密度，适合管理、运营及综合型岗位。",
    },
    tech: {
      name: "技术岗版",
      description: "强化技能、项目和工程成果，为开发者量身打造。",
    },
  },
  "en-US": {
    classic: {
      name: "Minimal Classic",
      description:
        "A steady single-column resume for finance, healthcare, and traditional roles.",
    },
    split: {
      name: "Split Layout",
      description:
        "A denser layout for management, operations, and hybrid professional profiles.",
    },
    tech: {
      name: "Engineering Focus",
      description:
        "Highlights skills, projects, and engineering impact for developer roles.",
    },
  },
};

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === "undefined") return "zh-CN";
    return (localStorage.getItem("app_locale") as Locale) || "zh-CN";
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(() => {
    if (typeof window === "undefined") return "classic";
    return localStorage.getItem("selected_template_id") || "classic";
  });
  const copy = COPY[locale];

  const filteredTemplates = TEMPLATES.filter(
    (template) => {
      const templateCopy = TEMPLATE_COPY[locale][template.id];
      return (
        (activeTab === "All" || template.category === activeTab) &&
        (templateCopy.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
          templateCopy.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
      );
    },
  );

  const handleUseTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    localStorage.setItem("selected_template_id", templateId);
    router.push("/editor");
  };

  const toggleLocale = () => {
    const nextLocale = locale === "zh-CN" ? "en-US" : "zh-CN";
    setLocale(nextLocale);
    localStorage.setItem("app_locale", nextLocale);
  };

  return (
    <div className="flex-1 min-h-full p-8 lg:p-12 bg-zinc-50/50 flex flex-col items-center overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-6xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              <Sparkles size={14} /> {copy.eyebrow}
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              {copy.title}
            </h1>
            <p className="text-zinc-500 font-medium text-lg">
              {copy.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLocale}
              className="h-12 px-4 bg-white border border-zinc-200 rounded-[1.25rem] text-xs font-black text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm"
            >
              {copy.lang}
            </button>
            <div className="relative group">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors"
              />
              <input
                type="text"
                placeholder={copy.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-[320px] h-12 pl-12 pr-4 bg-white border border-zinc-200 rounded-[1.25rem] text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Categories Tab */}
        <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
          {["All", "Classic", "Split", "Tech"].map((tab) => (
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
              {tab === "All" ? copy.all : tab}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-emerald-600 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
            <Zap size={14} className="fill-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {copy.expertMode}
            </span>
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-20">
          {filteredTemplates.map((template, idx) => {
            const templateCopy = TEMPLATE_COPY[locale][template.id];

            return (
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
                  alt={templateCopy.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <button className="px-6 py-2.5 bg-white rounded-full text-xs font-bold text-zinc-900 shadow-xl transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    {copy.preview}
                  </button>
                </div>
                {template.id === selectedTemplateId && (
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
                      {templateCopy.name}
                    </h3>
                  </div>
                  <button className="p-2.5 bg-zinc-50 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Heart size={20} />
                  </button>
                </div>

                <p className="text-zinc-500 text-sm leading-relaxed mb-8 font-medium">
                  {templateCopy.description}
                </p>

                <div className="mt-auto flex items-center gap-3">
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="flex-1 h-12 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-200 transition-all active:scale-95"
                  >
                    {template.id === selectedTemplateId ? copy.current : copy.use}
                  </button>
                  <button className="w-12 h-12 flex items-center justify-center bg-zinc-50 border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-2xl transition-all">
                    <ExternalLink size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="py-12 border-t border-dashed border-zinc-200 text-center animate-in fade-in duration-1000">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-xl shadow-zinc-200 mb-4">
            <Layout size={16} className="text-emerald-400" />{" "}
            {copy.footerBadge}
          </div>
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            {copy.footer}
          </p>
        </footer>
      </div>
    </div>
  );
}
