"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  ExternalLink,
  ChevronDown,
  Sparkles
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 ---
interface AIProvider {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  isActive: boolean;
  type: "openai" | "deepseek" | "claude" | "gemini" | "qwen" | "doubao" | "custom";
}

const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: "openai-1",
    name: "ChatGPT (OpenAI)",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o",
    isActive: true,
    type: "openai",
  },
  {
    id: "claude-1",
    name: "Claude (Anthropic)",
    baseUrl: "https://api.anthropic.com/v1",
    apiKey: "",
    model: "claude-3-5-sonnet-20240620",
    isActive: false,
    type: "claude",
  },
  {
    id: "gemini-1",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    apiKey: "",
    model: "gemini-1.5-pro",
    isActive: false,
    type: "gemini",
  },
  {
    id: "deepseek-1",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    apiKey: "",
    model: "deepseek-chat",
    isActive: false,
    type: "deepseek",
  },
  {
    id: "qwen-1",
    name: "通义千问 (Qwen)",
    baseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    apiKey: "",
    model: "qwen-max",
    isActive: false,
    type: "qwen",
  },
  {
    id: "doubao-1",
    name: "豆包 (Doubao)",
    baseUrl: "https://ark.cn-beijing.volces.com/api/v3",
    apiKey: "",
    model: "doubao-pro-32k",
    isActive: false,
    type: "doubao",
  }
];

const TYPE_CONFIG = {
  openai: { color: "bg-[#10a37f]", text: "text-white" },
  claude: { color: "bg-[#d97757]", text: "text-white" },
  gemini: { color: "bg-[#4285f4]", text: "text-white" },
  deepseek: { color: "bg-[#1d4ed8]", text: "text-white" },
  qwen: { color: "bg-[#5a239b]", text: "text-white" },
  doubao: { color: "bg-[#2563eb]", text: "text-white" },
  custom: { color: "bg-zinc-100", text: "text-zinc-600" },
};

export default function AIPage() {
  const [providers, setProviders] = useState<AIProvider[]>(DEFAULT_PROVIDERS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 1. 初始化加载
  useEffect(() => {
    const saved = localStorage.getItem("ai_providers");
    
    // 使用 requestAnimationFrame 确保所有初始化状态更新都在下一帧执行
    // 避免同步调用引发的 "cascading renders" 警告，并确保与 Hydration 流程解耦
    requestAnimationFrame(() => {
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const merged = [...parsed];
          DEFAULT_PROVIDERS.forEach(def => {
            if (!merged.find(p => p.type === def.type)) {
              merged.push(def);
            }
          });
          setProviders(merged);
        } catch {
          setProviders(DEFAULT_PROVIDERS);
        }
      }
      setIsLoaded(true);
    });
  }, []);

  // 2. 保存至本地
  const handleSave = () => {
    setSaveStatus("saving");
    localStorage.setItem("ai_providers", JSON.stringify(providers));
    setTimeout(() => {
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  // 3. 更新字段
  const updateProvider = (id: string, field: keyof AIProvider, value: string | boolean) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        if (field === "isActive" && value === true) {
          return { ...p, isActive: true } as AIProvider;
        }
        return { ...p, [field]: value } as AIProvider;
      }
      if (field === "isActive" && value === true) {
        return { ...p, isActive: false } as AIProvider;
      }
      return p;
    }));
  };

  // 4. 添加自定义渠道
  const addCustomProvider = () => {
    const newId = crypto.randomUUID();
    const newProvider: AIProvider = {
      id: newId,
      name: "自定义渠道",
      baseUrl: "",
      apiKey: "",
      model: "",
      isActive: false,
      type: "custom",
    };
    setProviders([...providers, newProvider]);
    setExpandedId(newId);
  };

  // 5. 删除渠道
  const deleteProvider = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (providers.length <= 1) {
      alert("请至少保留一个 AI 渠道。");
      return;
    }
    setProviders(prev => prev.filter(p => p.id !== id));
  };

  if (!isLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-full p-8 lg:p-12 bg-zinc-50/50 flex flex-col items-center overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-4xl">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
              <Sparkles size={14} /> Intelligence Configuration
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">AI 服务商管理</h1>
            <p className="text-zinc-500 font-medium">配置 API 密钥，让您的简历获得 AI 智能改写与纠错能力。</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={addCustomProvider}
              className="px-5 py-2.5 bg-white border border-zinc-200 rounded-2xl text-sm font-bold text-zinc-600 hover:shadow-xl hover:shadow-zinc-200/50 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> 添加渠道
            </button>
            <button 
              onClick={handleSave}
              className={cn(
                "px-6 py-2.5 rounded-2xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95",
                saveStatus === "success" ? "bg-emerald-500" : "bg-zinc-900 shadow-zinc-200"
              )}
            >
              {saveStatus === "saving" ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : saveStatus === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Save size={18} />
              )}
              {saveStatus === "success" ? "已保存" : "保存所有配置"}
            </button>
          </div>
        </header>

        {/* Info Banner */}
        <div className="mb-10 p-8 bg-zinc-900 rounded-[2.5rem] text-white overflow-hidden relative group shadow-xl shadow-zinc-200">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck size={28} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">本地隐私保护与直连</h3>
                <p className="text-zinc-400 text-sm max-w-lg leading-relaxed font-medium">您的 API Key 将直接存储在当前浏览器的本地存储中，不会上传到青椒简历的服务器。这意味着所有 AI 交互逻辑均在您的浏览器中直连 AI 服务商，确保数据主权。</p>
              </div>
            </div>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 self-start md:self-center border border-white/10"
            >
              获取 API Key <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Accordion Providers List */}
        <div className="space-y-4">
          <AnimatePresence>
            {providers.map((p) => {
              const isExpanded = expandedId === p.id;
              const config = TYPE_CONFIG[p.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.custom;

              return (
                <motion.div 
                  layout
                  key={p.id}
                  className={cn(
                    "bg-white border-2 rounded-[2rem] overflow-hidden transition-all duration-300",
                    p.isActive ? "border-emerald-500 shadow-xl shadow-emerald-500/5" : "border-zinc-100 hover:border-zinc-200 shadow-sm"
                  )}
                >
                  {/* Accordion Header */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="p-6 md:p-8 cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-transform group-hover:scale-110",
                        config.color,
                        config.text
                      )}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-3">
                          <h4 className="font-bold text-zinc-900">{p.name}</h4>
                          {p.isActive && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase italic">{p.model || "未配置模型"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateProvider(p.id, "isActive", true);
                        }}
                        className={cn(
                          "hidden md:flex px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all items-center gap-1.5 border",
                          p.isActive 
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                            : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300 hover:text-zinc-600"
                        )}
                      >
                        {p.isActive ? "已激活" : "点击激活"}
                      </button>
                      <div className={cn(
                        "w-8 h-8 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-400 transition-all",
                        isExpanded ? "bg-zinc-900 text-white border-zinc-900 rotate-180" : "bg-white"
                      )}>
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-8 pb-8 pt-2"
                    >
                      <div className="w-full h-px bg-zinc-100 mb-8" />
                      
                      <div className="flex flex-col lg:flex-row gap-10">
                        {/* Status Controls (Mobile/Left) */}
                        <div className="w-full lg:w-40 shrink-0 flex flex-col gap-3">
                           <button
                            onClick={() => updateProvider(p.id, "isActive", true)}
                            className={cn(
                              "w-full py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                              p.isActive 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100" 
                                : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                            )}
                          >
                           {p.isActive ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                           设置为当前使用
                          </button>
                          
                          {p.type === "custom" && (
                             <button
                              onClick={(e) => deleteProvider(e, p.id)}
                              className="w-full py-3 rounded-2xl text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                             <Trash2 size={14} /> 移除此配置
                            </button>
                          )}
                        </div>

                        {/* Config Inputs */}
                        <div className="flex-1 space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                            <div className="space-y-2">
                               <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">API 名称</label>
                              <input 
                                type="text"
                                value={p.name}
                                onChange={(e) => updateProvider(p.id, "name", e.target.value)}
                                placeholder="请输入名称..."
                                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">模型标识 (Model ID)</label>
                              <input 
                                type="text"
                                value={p.model}
                                onChange={(e) => updateProvider(p.id, "model", e.target.value)}
                                placeholder="例如: gpt-4o"
                                className="w-full h-11 px-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">Base URL (API 地址)</label>
                            <input 
                              type="text"
                              value={p.baseUrl}
                              onChange={(e) => updateProvider(p.id, "baseUrl", e.target.value)}
                              placeholder="https://..."
                              className="w-full h-11 px-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
                            />
                          </div>

                          <div className="space-y-2 relative">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">API Key</label>
                            <div className="relative group/key">
                              <input 
                                type={showKey[p.id] ? "text" : "password"}
                                value={p.apiKey}
                                onChange={(e) => updateProvider(p.id, "apiKey", e.target.value)}
                                placeholder="sk-..."
                                className="w-full h-11 pl-4 pr-12 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono"
                              />
                              <button 
                                onClick={(e) => { e.stopPropagation(); setShowKey(prev => ({ ...prev, [p.id]: !prev[p.id] })); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                              >
                                {showKey[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <footer className="mt-20 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-10 opacity-60">
          QingJiao Intelligence Module v2.0
        </footer>
      </div>
    </div>
  );
}
