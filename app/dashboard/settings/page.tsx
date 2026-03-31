"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Shield, 
  Palette, 
  Mail, 
  Lock, 
  Bell, 
  Globe, 
  HardDrive, 
  Trash2, 
  Download, 
  Upload, 
  Info,
  ChevronRight,
  Monitor,
  Camera,
  CheckCircle2,
  Database
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Sections ---

const SECTIONS = [
  { id: "profile", label: "个人资料", icon: User },
  { id: "account", label: "账户安全", icon: Shield },
  { id: "appearance", label: "外观偏好", icon: Palette },
  { id: "data", label: "数据管理", icon: HardDrive },
  { id: "about", label: "关于应用", icon: Info }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  const handleSave = () => {
    setSaveStatus("saving");
    setTimeout(() => {
        setSaveStatus("success");
        setTimeout(() => setSaveStatus("idle"), 2000);
    }, 800);
  };

  return (
    <div className="flex-1 min-h-full p-8 lg:p-12 bg-zinc-50/50 flex flex-col items-center overflow-y-auto scrollbar-hide">
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-700">
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">
                <Database size={14} /> System Preference
              </div>
              <h1 className="text-4xl font-black tracking-tight text-zinc-900">通用设置</h1>
              <p className="text-zinc-500 font-medium text-lg">定制您的专属青椒体验，管理本地数据与账户偏好。</p>
           </div>

           <button
             onClick={handleSave}
             className={cn(
                "px-8 py-3 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-[1.02] active:scale-95",
                saveStatus === "success" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white shadow-zinc-200"
             )}
           >
              {saveStatus === "saving" ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : saveStatus === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {saveStatus === "success" ? "已保存" : "更新全部设置"}
           </button>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Navigation */}
          <aside className="w-full lg:w-64 shrink-0 space-y-2">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm tracking-tight",
                    isActive 
                      ? "bg-white text-zinc-900 shadow-xl shadow-zinc-200/50 border border-zinc-100" 
                      : "text-zinc-500 hover:bg-white hover:text-zinc-900 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={cn(isActive ? "text-emerald-500" : "text-zinc-400")} />
                    {s.label}
                  </div>
                  <ChevronRight size={14} className={cn("transition-transform", isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                </button>
              );
            })}
          </aside>

          {/* Right: Content Cards */}
          <main className="flex-1 space-y-8">
             <AnimatePresence mode="wait">
                {activeSection === "profile" && (
                   <motion.div
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     className="bg-white border border-zinc-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm"
                   >
                     <div className="flex flex-col md:flex-row gap-10">
                        <div className="relative group shrink-0 self-start">
                           <div className="w-24 h-24 rounded-[2rem] bg-zinc-100 overflow-hidden shadow-inner flex items-center justify-center border-4 border-white shadow-zinc-200">
                             <img src="/qingjiao_resume/images/qinfjiao_resume.png" alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                             <Camera size={18} />
                           </button>
                        </div>
                        
                        <div className="flex-1 space-y-6">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">显示名称</label>
                                <input type="text" placeholder="青椒本椒" className="w-full h-12 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-zinc-300 transition-all" />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">电子邮箱</label>
                                <input type="email" placeholder="example@qingjiao.io" className="w-full h-12 px-5 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-zinc-300 transition-all font-mono" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">个人简介 (Bio)</label>
                              <textarea placeholder="写点什么，让大家了解你..." className="w-full min-h-[120px] px-5 py-4 bg-zinc-50 border border-zinc-100 rounded-3xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-zinc-300 transition-all resize-none"></textarea>
                           </div>
                        </div>
                     </div>
                   </motion.div>
                )}

                {activeSection === "appearance" && (
                   <motion.div
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     className="space-y-6"
                   >
                     <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-sm">
                        <h4 className="text-xl font-black text-zinc-900 mb-8 flex items-center gap-3">
                           <Monitor size={24} className="text-emerald-500" /> 主题与显示
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {["Light", "Dark", "System"].map(theme => (
                              <button key={theme} className={cn(
                                "flex flex-col items-center justify-center p-6 border-2 rounded-3xl transition-all gap-4 group",
                                theme === "Light" ? "border-emerald-500 bg-emerald-50/20" : "border-zinc-100 hover:border-zinc-200"
                              )}>
                                 <div className={cn(
                                   "w-full h-24 rounded-2xl transition-all shadow-inner border border-zinc-100",
                                   theme === "Light" ? "bg-white" : theme === "Dark" ? "bg-zinc-900" : "bg-gradient-to-br from-white to-zinc-900"
                                 )}></div>
                                 <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-900 transition-colors">{theme} Mode</span>
                              </button>
                           ))}
                        </div>
                     </div>
                     
                     <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-sm flex items-center justify-between">
                        <div className="space-y-1">
                           <h4 className="text-lg font-bold text-zinc-900">界面动效力 (Animations)</h4>
                           <p className="text-zinc-500 text-xs font-medium">关闭动效可提升在性能较弱设备上的响应速度。</p>
                        </div>
                        <div className="w-14 h-8 bg-zinc-900 rounded-full relative p-1 cursor-pointer">
                           <div className="w-6 h-6 bg-white rounded-full absolute right-1"></div>
                        </div>
                     </div>
                   </motion.div>
                )}

                {activeSection === "data" && (
                   <motion.div
                     initial={{ opacity: 0, x: 10 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -10 }}
                     className="grid grid-cols-1 md:grid-cols-2 gap-6"
                   >
                      <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                         <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Download size={32} />
                         </div>
                         <h4 className="text-xl font-black text-zinc-900 mb-2">导出本地数据</h4>
                         <p className="text-zinc-500 text-sm font-medium mb-8">我们将所有简历与配置导出为 JSON 文件，用于离线备份。</p>
                         <button className="w-full py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-zinc-200">立即开始导出</button>
                      </div>

                      <div className="bg-white border border-zinc-100 rounded-[2.5rem] p-10 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:shadow-xl hover:shadow-zinc-200/50 transition-all">
                         <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <Upload size={32} />
                         </div>
                         <h4 className="text-xl font-black text-zinc-900 mb-2">恢复本地数据</h4>
                         <p className="text-zinc-500 text-sm font-medium mb-8">通过之前备份的 JSON 文件，一键恢复您所有的简历数据。</p>
                         <button className="w-full py-4 bg-zinc-50 text-zinc-900 border border-zinc-200 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all">选择 JSON 文件</button>
                      </div>

                      <div className="md:col-span-2 bg-red-50 border border-red-100 rounded-[2.5rem] p-10 flex flex-col md:flex-row md:items-center justify-between gap-8 group">
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-red-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                               <Trash2 size={24} />
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-lg font-bold text-red-600 leading-tight">彻底清空本地缓存</h4>
                               <p className="text-red-400 text-xs font-medium max-w-md leadin-relaxed">此操作将永久删除当前浏览器中存储的所有简历与 AI 配置。此过程不可撤销，请谨慎操作。</p>
                            </div>
                         </div>
                         <button className="px-8 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-red-200 hover:bg-red-700 transition-all shrink-0">重置全部数据</button>
                      </div>
                   </motion.div>
                )}
             </AnimatePresence>
          </main>
        </div>

        {/* Footer */}
        <footer className="mt-20 py-10 text-center border-t border-dashed border-zinc-200">
           <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-2">
             QingJiao System v1.5 • Powered by Chrome LocalStorage
           </p>
           <p className="text-zinc-300 text-[9px] font-black uppercase tracking-widest italic">
             Every line of choice marks a style of living.
           </p>
        </footer>
      </div>
    </div>
  );
}
