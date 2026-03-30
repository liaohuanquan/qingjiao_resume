"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  BrainCircuit, 
  Save, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  Puzzle,
  ExternalLink
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
  type: "openai" | "deepseek" | "claude" | "gemini" | "custom";
}

const DEFAULT_PROVIDERS: AIProvider[] = [
  {
    id: "openai-1",
    name: "OpenAI",
    baseUrl: "https://api.openai.com/v1",
    apiKey: "",
    model: "gpt-4o",
    isActive: true,
    type: "openai",
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
    id: "gemini-1",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    apiKey: "",
    model: "gemini-1.5-pro",
    isActive: false,
    type: "gemini",
  }
];

export default function AIPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  // 1. 初始化加载
  useEffect(() => {
    const saved = localStorage.getItem("ai_providers");
    if (saved) {
      try {
        setProviders(JSON.parse(saved));
      } catch {
        setProviders(DEFAULT_PROVIDERS);
      }
    } else {
      setProviders(DEFAULT_PROVIDERS);
    }
    setIsLoaded(true);
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
  const updateProvider = (id: string, field: keyof AIProvider, value: any) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        // 如果激活当前，则取消激活其他
        if (field === "isActive" && value === true) {
          return { ...p, isActive: true };
        }
        return { ...p, [field]: value };
      }
      if (field === "isActive" && value === true) {
        return { ...p, isActive: false };
      }
      return p;
    }));
  };

  // 4. 添加自定义渠道
  const addCustomProvider = () => {
    const newProvider: AIProvider = {
      id: crypto.randomUUID(),
      name: "自定义渠道",
      baseUrl: "",
      apiKey: "",
      model: "",
      isActive: false,
      type: "custom",
    };
    setProviders([...providers, newProvider]);
  };

  // 5. 删除渠道
  const deleteProvider = (id: string) => {
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
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest mb-1">
              <BrainCircuit size={16} /> Advanced AI Suite
            </div>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900">AI 服务商管理</h1>
            <p className="text-zinc-500 font-medium">配置您的专属大模型 API，解锁 AI 优化与一键改写功能。</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={addCustomProvider}
              className="px-5 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 transition-all flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} /> 添加自定义
            </button>
            <button 
              onClick={handleSave}
              className={cn(
                "px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg",
                saveStatus === "success" ? "bg-emerald-500" : "bg-zinc-900 hover:bg-zinc-800"
              )}
            >
              {saveStatus === "saving" ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : saveStatus === "success" ? (
                <CheckCircle2 size={18} />
              ) : (
                <Save size={18} />
              )}
              {saveStatus === "success" ? "保存成功" : "保存配置"}
            </button>
          </div>
        </header>

        {/* Info Banner */}
        <div className="mb-10 p-6 bg-zinc-900 rounded-[2rem] text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                <Puzzle size={24} className="text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">本地隐私保护</h3>
                <p className="text-zinc-400 text-sm max-w-lg leading-relaxed font-medium">您的 API Key 将直接存储在当前浏览器的本地存储中，不会上传到青椒简历的服务器。这意味着所有 AI 交互逻辑均在您的浏览器中直连 AI 服务商，确保数据主权。</p>
              </div>
            </div>
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 self-start md:self-center"
            >
              获取 API Key <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Providers List */}
        <div className="space-y-6">
          {providers.map((p) => (
            <motion.div 
              layout
              key={p.id}
              className={cn(
                "bg-white border-2 rounded-[2.5rem] p-8 transition-all duration-500",
                p.isActive ? "border-emerald-500 shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/10" : "border-zinc-200 shadow-sm"
              )}
            >
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Left: Identity & State */}
                <div className="w-full lg:w-48 shrink-0 flex flex-col gap-5">
                   <div className="flex items-center justify-between lg:justify-start lg:flex-col lg:items-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl",
                        p.type === "openai" ? "bg-zinc-900 text-white" : 
                        p.type === "deepseek" ? "bg-blue-600 text-white" :
                        p.type === "gemini" ? "bg-blue-500 text-white" : "bg-emerald-100 text-emerald-600"
                      )}>
                        {p.name.charAt(0)}
                      </div>
                      <div className="lg:hidden">
                        <h4 className="font-bold text-zinc-900">{p.name}</h4>
                        <p className="text-xs text-zinc-400 font-mono italic">{p.type.toUpperCase()}</p>
                      </div>
                    </div>
                    
                    <div className="hidden lg:block mt-1">
                      <h4 className="font-bold text-zinc-900">{p.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">{p.type}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => updateProvider(p.id, "isActive", true)}
                      className={cn(
                        "w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 border",
                        p.isActive 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                          : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                      )}
                    >
                      {p.isActive ? <CheckCircle2 size={14} /> : <div className="w-3.5 h-3.5 border border-zinc-300 rounded-full" />}
                      {p.isActive ? "已激活" : "点击激活"}
                    </button>
                    {p.type === "custom" && (
                       <button
                        onClick={() => deleteProvider(p.id)}
                        className="w-full py-2.5 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                      >
                       <Trash2 size={14} /> 移除配置
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Form Controls */}
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
                      <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">模型 (Model Name)</label>
                      <input 
                        type="text"
                        value={p.model}
                        onChange={(e) => updateProvider(p.id, "model", e.target.value)}
                        placeholder="例如: gpt-4o"
                        className="w-full h-11 px-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono placeholder:font-sans"
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
                      className="w-full h-11 px-4 bg-zinc-50 border border-zinc-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-mono placeholder:font-sans"
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
                        onClick={() => setShowKey(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showKey[p.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Empty State */}
          {providers.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center bg-white border border-dashed border-zinc-200 rounded-[3rem]">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-4">
                <AlertCircle size={32} />
              </div>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">暂无配置</p>
            </div>
          )}
        </div>

        <footer className="mt-20 text-center text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-10 opacity-60">
          QingJiao AI Suite • Local Secure Keyring
        </footer>
      </div>
    </div>
  );
}
