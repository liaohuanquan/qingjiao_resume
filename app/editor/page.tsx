"use client";

import React, { useState } from "react";
import {
  Download,
  User,
  GripVertical,
  Eye,
  Trash2,
  Layout,
  Type,
  FileText,
  DownloadCloud,
  Code,
  HelpCircle,
  Sun,
  Palette,
  Maximize2,
  EyeOff,
  Briefcase,
  GraduationCap,
  Rocket,
  Settings2,
  Plus,
  Minus,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  avatar?: string;
  education: EducationItem[];
  workExperiences: WorkItem[];
  projects: ProjectItem[];
  skills: string[];
}

interface EducationItem {
  id: string;
  school: string;
  major: string;
  date: string;
}

interface WorkItem {
  id: string;
  company: string;
  role: string;
  date: string;
  desc: string;
}

interface ProjectItem {
  id: string;
  name: string;
  role: string;
  date: string;
  link?: string;
  desc: string;
}

interface TypographyConfig {
  fontFamily: string;
  lineHeight: number;
  fontSize: number; // in pixels
}

interface ModuleItem {
  id: string;
  title: string;
  visible: boolean;
}

// --- Simplified UI Components ---

const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <span
    className={cn("px-2 py-0.5 text-xs font-semibold rounded-full", className)}
  >
    {children}
  </span>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
}

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) => {
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400",
    secondary: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 disabled:opacity-50",
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50",
    outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50 disabled:opacity-50",
  };
  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10 flex items-center justify-center p-0",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

const Card = ({ children, className, ...props }: CardProps) => (
  <div
    className={cn(
      "rounded-xl border border-zinc-200 p-3 bg-white shadow-sm",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const Input = ({ label, id, ...props }: InputProps) => (
  <div className="space-y-1.5 w-full">
    {label && (
      <label htmlFor={id} className="text-xs font-medium text-zinc-500">
        {label}
      </label>
    )}
    <input
      id={id}
      className="w-full h-9 px-3 rounded-lg border border-zinc-100 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400"
      {...props}
    />
  </div>
);

// --- Main Page Component ---

export default function ResumeEditor() {
  const [activeTab, setActiveTab] = useState("basic");
  const [themeColor, setThemeColor] = useState("#10b981");
  const [zoomScale, setZoomScale] = useState(0.8);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);

  // Typography Settings
  const [typography, setTypography] = useState<TypographyConfig>({
    fontFamily: "Inter, sans-serif",
    lineHeight: 1.6,
    fontSize: 14.5, // Changed to pixel value
  });

  const [modules, setModules] = useState<ModuleItem[]>([
    { id: "basic", title: "基本信息", visible: true },
    { id: "edu", title: "教育背景", visible: true },
    { id: "work", title: "工作经历", visible: true },
    { id: "project", title: "项目经验", visible: true },
    { id: "skill", title: "专业技能", visible: true },
  ]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    name: "QingJiao",
    title: "高级前端开发工程师",
    phone: "138-0000-0000",
    email: "email@example.com",
    city: "深圳",
    education: [
      { id: "e1", school: "中国科学技术大学", major: "软件工程", date: "2016 - 2020" }
    ],
    workExperiences: [
      { id: "w1", company: "青椒实验室", role: "高级前端开发", date: "2020 - 至今", desc: "1. 负责核心编辑器的架构设计与性能优化。\n2. 实现实时协同预览引擎。" }
    ],
    projects: [
      { id: "p1", name: "青椒简历编辑器", role: "核心开发", date: "2023.01 - 至今", desc: "基于 Next.js 15 和 Tailwind CSS 4 开发的现代化简历编辑器。" }
    ],
    skills: ["Javascript", "TypeScript", "React", "Next.js", "Tailwind CSS", "Node.js"]
  });

  const presetColors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#18181b"];

  const toggleModuleVisibility = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)),
    );
  };

  const removeModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  const updateBasicData = (field: keyof ResumeData, value: string) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  // Generic List item updaters
  const updateListItem = (type: "edu" | "work" | "project", id: string, field: string, value: string) => {
    setResumeData(prev => {
      if (type === "edu") {
        return {
          ...prev,
          education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
        };
      }
      if (type === "work") {
        return {
          ...prev,
          workExperiences: prev.workExperiences.map(item => item.id === id ? { ...item, [field]: value } : item)
        };
      }
      return {
        ...prev,
        projects: prev.projects.map(item => item.id === id ? { ...item, [field]: value } : item)
      };
    });
  };

  const addItem = (type: "edu" | "work" | "project") => {
    const id = Date.now().toString();
    if (type === "edu") {
      setResumeData(prev => ({ ...prev, education: [...prev.education, { id, school: "", major: "", date: "" }] }));
    } else if (type === "work") {
      setResumeData(prev => ({ ...prev, workExperiences: [...prev.workExperiences, { id, company: "", role: "", date: "", desc: "" }] }));
    } else {
      setResumeData(prev => ({ ...prev, projects: [...prev.projects, { id, name: "", role: "", date: "", desc: "" }] }));
    }
  };

  const deleteItem = (type: "edu" | "work" | "project", id: string) => {
    setResumeData(prev => {
      if (type === "edu") {
        return { ...prev, education: prev.education.filter(i => i.id !== id) };
      }
      if (type === "work") {
        return { ...prev, workExperiences: prev.workExperiences.filter(i => i.id !== id) };
      }
      return { ...prev, projects: prev.projects.filter(i => i.id !== id) };
    });
  };

  const updateSkills = (value: string) => {
    setResumeData(prev => ({ ...prev, skills: value.split(",").map(s => s.trim()) }));
  };

  const autoFit = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 64; 
      const scale = Math.min(1, containerWidth / 820); 
      setZoomScale(Number(scale.toFixed(2)));
    }
  };

  React.useEffect(() => {
    const savedAvatar = localStorage.getItem("resume_avatar");
    if (savedAvatar) {
      setResumeData(prev => ({ ...prev, avatar: savedAvatar }));
    }
    autoFit();
    window.addEventListener("resize", autoFit);
    return () => window.removeEventListener("resize", autoFit);
  }, []);

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-50 font-sans text-zinc-900"
      style={{ 
        "--theme-color": themeColor,
        "--font-family": typography.fontFamily,
        "--line-height": typography.lineHeight,
      } as React.CSSProperties}
    >
      {/* 1. Header */}
      <header className="h-[60px] flex items-center justify-between px-6 bg-white border-b border-zinc-200 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Maximize2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">青椒简历</span>
          <Badge className="bg-emerald-50 text-emerald-600 ml-2">保存自动进行</Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600">QingJiao</span>
          <Button variant="ghost" size="icon" className="rounded-full" title="切换显示模式">
            <Sun size={18} />
          </Button>
          <Button className="gap-2">
            <Download size={16} /> 导出
          </Button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Column 1: Config & Module Management (280px) */}
        <aside className="w-[280px] bg-white border-r border-zinc-100 p-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Settings2 size={14} /> 模块管理
            </h3>
            <div className="space-y-2 mb-2">
              <Card
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-all",
                  activeTab === "basic" && "border-zinc-900 ring-1 ring-zinc-900/5",
                )}
              >
                <div className="w-4 h-4 rounded-sm border border-zinc-200 flex items-center justify-center bg-zinc-50 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                </div>
                <span className="text-sm text-zinc-600 flex-1 ml-1">基本信息</span>
                <Badge className="bg-zinc-100 text-zinc-400 font-normal ml-auto">固定</Badge>
              </Card>
            </div>

            <Reorder.Group
              axis="y"
              values={modules.filter((m) => m.id !== "basic")}
              onReorder={(newModules) => setModules([modules.find(m => m.id === "basic")!, ...newModules])}
              className="space-y-2"
            >
              {modules.filter((m) => m.id !== "basic").map((m) => (
                <Reorder.Item key={m.id} value={m} onClick={() => setActiveTab(m.id)}>
                  <Card className={cn(
                    "flex items-center gap-2 cursor-pointer transition-all",
                    activeTab === m.id && "border-zinc-900 ring-1 ring-zinc-900/5",
                    !m.visible && "opacity-50",
                  )}>
                    <GripVertical size={16} className="text-zinc-400 cursor-grab active:cursor-grabbing" />
                    <span className="text-sm text-zinc-600 flex-1">{m.title}</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => toggleModuleVisibility(m.id)} title={m.visible ? "隐藏" : "显示"}>
                        {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => removeModule(m.id)} title="删除模块">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Palette size={14} /> 主题与颜色
            </h3>
            <div className="flex flex-wrap gap-3 px-1 items-center">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setThemeColor(c)}
                  style={{ "--bg-color": c } as React.CSSProperties}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all active:scale-90 bg-[var(--bg-color)] shadow-sm",
                    themeColor === c && "ring-2 ring-zinc-900 ring-offset-2",
                  )}
                  title={`预设颜色 ${c}`}
                  aria-label={`选择颜色 ${c}`}
                />
              ))}
              <div className="relative group/color">
                <input 
                  type="color" 
                  className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer p-1.5 bg-zinc-50 hover:bg-zinc-100 transition-colors"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  title="自定义颜色"
                  aria-label="自定义主题色"
                />
              </div>
              <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-tight">{themeColor}</span>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Type size={14} /> 高级排版
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500" htmlFor="font-family">字体选择</label>
                <select 
                  id="font-family"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  value={typography.fontFamily}
                  onChange={(e) => setTypography(prev => ({ ...prev, fontFamily: e.target.value }))}
                  title="字体设定"
                >
                  <option value="Inter, sans-serif">Inter (通用)</option>
                  <option value="'Roboto', sans-serif">Roboto (机械)</option>
                  <option value="'Outfit', sans-serif">Outfit (现代)</option>
                  <option value="'Songti SC', serif">宋体 (传统)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-zinc-500" htmlFor="line-height">行间距</label>
                  <span className="text-xs text-zinc-400">{typography.lineHeight}</span>
                </div>
                <input 
                  id="line-height"
                  type="range" 
                  min="1.0" 
                  max="2.5" 
                  step="0.05"
                  className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none accent-zinc-900 cursor-pointer"
                  value={typography.lineHeight}
                  onChange={(e) => setTypography(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))}
                  title="行高调节"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">正文字号 (px)</label>
                <div className="flex items-center gap-3">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-10 h-10 p-0"
                    onClick={() => setTypography(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 0.5) }))}
                    title="减小字号"
                  >
                    <Minus size={14} />
                  </Button>
                  <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                    {typography.fontSize.toFixed(1)}px
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-10 h-10 p-0"
                    onClick={() => setTypography(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 0.5) }))}
                    title="增大字号"
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Column 2: Form Editor (380px) */}
        <aside className="w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">基本信息</h2>
                </header>

                <section className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300 relative">
                        {resumeData.avatar ? (
                          <Image src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                        ) : (
                          <User size={32} className="text-zinc-300" />
                        )}
                      </div>
                      <label 
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                        title="点击更换图片"
                      >
                        <Palette size={14} />
                        <input 
                          type="file" 
                          className="hidden" 
                          aria-label="上传头像" 
                          accept="image/*" 
                          title="上传文件"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64 = reader.result as string;
                                setResumeData(prev => ({ ...prev, avatar: base64 }));
                                localStorage.setItem("resume_avatar", base64);
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <Input placeholder="姓名" value={resumeData.name} onChange={(e) => updateBasicData("name", e.target.value)} title="您的姓名" />
                      <Input placeholder="职位/称号" value={resumeData.title} onChange={(e) => updateBasicData("title", e.target.value)} title="职位标题" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input label="联系方式" value={resumeData.phone} onChange={(e) => updateBasicData("phone", e.target.value)} placeholder="000-0000-0000" />
                    <Input label="邮箱" value={resumeData.email} onChange={(e) => updateBasicData("email", e.target.value)} placeholder="name@domain.com" />
                    <Input label="地点" value={resumeData.city} onChange={(e) => updateBasicData("city", e.target.value)} placeholder="City, Country" />
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "edu" && (
              <motion.div key="edu" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <GraduationCap size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">教育背景</h2>
                </header>
                {resumeData.education.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("edu", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100" title="删除记录"><Trash2 size={12} /></button>
                    <Input placeholder="学校" value={item.school} onChange={e => updateListItem("edu", item.id, "school", e.target.value)} title="校名" />
                    <Input placeholder="专业" value={item.major} onChange={e => updateListItem("edu", item.id, "major", e.target.value)} title="学系" />
                    <Input placeholder="时间范围" value={item.date} onChange={e => updateListItem("edu", item.id, "date", e.target.value)} title="日期范围" />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("edu")}>+ 新增教育</Button>
              </motion.div>
            )}

            {activeTab === "work" && (
              <motion.div key="work" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <Briefcase size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">工作经历</h2>
                </header>
                {resumeData.workExperiences.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("work", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100" title="移除"><Trash2 size={12} /></button>
                    <Input placeholder="公司" value={item.company} onChange={e => updateListItem("work", item.id, "company", e.target.value)} title="工作单位" />
                    <Input placeholder="角色" value={item.role} onChange={e => updateListItem("work", item.id, "role", e.target.value)} title="主要职责" />
                    <Input placeholder="时间段" value={item.date} onChange={e => updateListItem("work", item.id, "date", e.target.value)} title="期间" />
                    <textarea 
                      placeholder="工作详情描述..." 
                      className="w-full h-32 p-3 text-sm border border-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white scrollbar-hide"
                      value={item.desc}
                      onChange={e => updateListItem("work", item.id, "desc", e.target.value)}
                      title="简介"
                    />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("work")}>+ 新增经历</Button>
              </motion.div>
            )}

            {activeTab === "project" && (
              <motion.div key="project" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <Rocket size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">项目经验</h2>
                </header>
                {resumeData.projects.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("project", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100" title="删除"><Trash2 size={12} /></button>
                    <Input placeholder="项目" value={item.name} onChange={e => updateListItem("project", item.id, "name", e.target.value)} title="名称" />
                    <Input placeholder="承担角色" value={item.role} onChange={e => updateListItem("project", item.id, "role", e.target.value)} title="具体职能" />
                    <Input placeholder="实现日期" value={item.date} onChange={e => updateListItem("project", item.id, "date", e.target.value)} title="开发时间" />
                    <textarea 
                      placeholder="项目重点细节..." 
                      className="w-full h-32 p-3 text-sm border border-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white scrollbar-hide"
                      value={item.desc}
                      onChange={e => updateListItem("project", item.id, "desc", e.target.value)}
                      title="项目说明"
                    />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("project")}>+ 新增项目</Button>
              </motion.div>
            )}

            {activeTab === "skill" && (
              <motion.div key="skill" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <Type size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">专业技能</h2>
                </header>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-500">输入技能清单（用逗号隔开）</label>
                  <textarea 
                    className="w-full h-48 p-4 text-sm border border-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white leading-relaxed font-mono"
                    value={resumeData.skills.join(", ")}
                    onChange={(e) => updateSkills(e.target.value)}
                    placeholder="Java, Python, Vue..."
                    title="技能录入"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Column 3: Preview Canvas */}
        <section className="flex-1 bg-zinc-100 flex flex-col relative overflow-hidden group">
          {/* Zoom Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 shadow-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full" title="缩小">-</button>
            <span className="min-w-[40px] text-center text-zinc-600">{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(prev => Math.min(1.5, prev + 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full" title="放大">+</button>
            <div className="w-px h-3 bg-zinc-200 mx-1" />
            <button onClick={autoFit} className="px-3 py-1 hover:bg-zinc-100 rounded-md text-zinc-500">自适应</button>
          </div>

          <div 
            ref={previewContainerRef} 
            className="flex-1 overflow-auto p-12 flex justify-center items-start scrollbar-hide scroll-smooth"
          >
            <motion.div
              style={{ 
                scale: zoomScale, 
                transformOrigin: "top center",
                fontFamily: "var(--font-family)",
                lineHeight: "var(--line-height)",
                fontSize: `${typography.fontSize}px`,
              }}
              className={cn(
                "w-[820px] shadow-2xl flex flex-col p-16 shrink-0 mb-32 relative bg-white min-h-[1160px]"
              )}
            >
              {/* Profile Header */}
              <div className="flex items-center gap-10 mb-12">
                <div className="w-28 h-28 rounded-xl bg-zinc-50 flex items-center justify-center overflow-hidden relative shadow-inner ring-1 ring-zinc-100">
                  {resumeData.avatar ? (
                    <Image src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <User size={48} className="text-zinc-200" />
                  )}
                </div>
                <div className="space-y-2 flex-1 text-zinc-900">
                  <h1 className="text-4xl font-black tracking-tight text-[var(--theme-color)] transition-none">{resumeData.name || "姓名"}</h1>
                  <p className="text-lg text-zinc-500 font-semibold tracking-wide">{resumeData.title || "求职目标"}</p>
                  <div className="text-[0.85em] text-zinc-400 flex flex-wrap gap-x-6 gap-y-2 mt-3 opacity-80">
                    <span className="flex items-center gap-2 font-medium">{resumeData.phone}</span>
                    <span className="flex items-center gap-2">| {resumeData.email}</span>
                    <span className="flex items-center gap-2">| {resumeData.city}</span>
                  </div>
                </div>
              </div>

              {/* Main Sections */}
              <div className="space-y-12">
                {modules.filter(m => m.visible && m.id !== "basic").map(m => (
                  <section key={m.id}>
                    <div className="flex items-center gap-3 mb-6 border-b-2 border-zinc-900/10 pb-2.5">
                      <div className="w-2 h-6 rounded-sm bg-[var(--theme-color)]" />
                      <h3 className="text-xl font-bold tracking-tight text-zinc-800 uppercase">{m.title}</h3>
                    </div>
                    
                    <div className="pl-1 space-y-6">
                      {m.id === "edu" && resumeData.education.map(item => (
                        <div key={item.id} className="flex justify-between items-baseline">
                          <div className="space-y-0.5">
                            <div className="font-bold text-zinc-800 flex items-center gap-2 text-[1.1em]">
                                {item.school || "教育中心"}
                            </div>
                            <div className="text-zinc-500 font-medium">{item.major || "主修课程"}</div>
                          </div>
                          <div className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</div>
                        </div>
                      ))}

                      {m.id === "work" && resumeData.workExperiences.map(item => (
                        <div key={item.id} className="space-y-2.5">
                          <div className="flex justify-between font-bold items-center">
                            <span className="text-zinc-800 text-[1.1em]">
                                {item.company || "公司平台"}
                            </span>
                            <span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</span>
                          </div>
                          <div className="text-[0.95em] text-[var(--theme-color)] font-bold">{item.role || "担任职位"}</div>
                          <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">
                            {item.desc || "详细业务描述..."}
                          </div>
                        </div>
                      ))}

                      {m.id === "project" && resumeData.projects.map(item => (
                        <div key={item.id} className="space-y-2.5">
                          <div className="flex justify-between font-bold items-center">
                            <span className="text-zinc-800 text-[1.1em]">
                                {item.name || "项目实战"}
                            </span>
                            <span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</span>
                          </div>
                          <div className="text-[0.95em] text-zinc-600 font-bold">{item.role || "主要贡献者"}</div>
                          <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">
                            {item.desc || "核心亮点阐述..."}
                          </div>
                        </div>
                      ))}

                      {m.id === "skill" && (
                        <div className="flex flex-wrap gap-x-6 gap-y-3 leading-relaxed">
                           {resumeData.skills.filter(s => s).map((s, idx) => (
                             <span key={idx} className="flex items-center gap-2 text-zinc-600 font-medium">
                               <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] opacity-40 shrink-0" />
                               {s}
                             </span>
                           ))}
                        </div>
                      )}

                      {(!["edu", "work", "project", "skill"].includes(m.id)) && (
                        <div className="text-sm text-zinc-200 italic py-2">待填充...</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar Tools */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 scale-90 lg:scale-100">
            <div className="flex flex-col gap-5 bg-white/95 backdrop-blur-md p-2.5 rounded-full shadow-2xl border border-zinc-100">
              <Button size="icon" variant="ghost" className="rounded-full" title="样式库"><FileText size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full" title="字体排布"><Type size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full" title="布局大纲"><Layout size={20} /></Button>
              <div className="w-6 h-px bg-zinc-100 mx-auto" />
              <Button size="icon" variant="primary" className="rounded-full shadow-lg" title="下载成品"><DownloadCloud size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full" title="源代码"><Code size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full" title="说明书"><HelpCircle size={20} /></Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
