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
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Maximize2,
  EyeOff,
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
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50",
    ghost: "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100",
    outline: "border border-zinc-200 bg-transparent hover:bg-zinc-50",
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
        "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
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
      { id: "e1", school: "青椒科技大学", major: "计算机科学与技术", date: "2016.09 - 2020.06" }
    ],
    workExperiences: [
      { id: "w1", company: "魔方简历实验室", role: "前端开发组长", date: "2020.07 - 至今", desc: "1. 负责核心编辑器的架构设计与性能优化。\n2. 引入可视化拖拽引擎，提升用户编辑效率 50%。\n3. 落地团队组件库，统一视觉风格。" }
    ]
  });

  const colors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#18181b"];

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

  const updateEducation = (id: string, field: keyof EducationItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const updateWork = (id: string, field: keyof WorkItem, value: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperiences: prev.workExperiences.map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const addItem = (type: "edu" | "work") => {
    if (type === "edu") {
      const newItem: EducationItem = { id: Date.now().toString(), school: "", major: "", date: "" };
      setResumeData(prev => ({ ...prev, education: [...prev.education, newItem] }));
    } else {
      const newItem: WorkItem = { id: Date.now().toString(), company: "", role: "", date: "", desc: "" };
      setResumeData(prev => ({ ...prev, workExperiences: [...prev.workExperiences, newItem] }));
    }
  };

  const deleteItem = (type: "edu" | "work", id: string) => {
    if (type === "edu") {
      setResumeData(prev => ({ ...prev, education: prev.education.filter(i => i.id !== id) }));
    } else {
      setResumeData(prev => ({ ...prev, workExperiences: prev.workExperiences.filter(i => i.id !== id) }));
    }
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
      style={{ "--theme-color": themeColor } as React.CSSProperties}
    >
      {/* 1. Header */}
      <header className="h-[60px] flex items-center justify-between px-6 bg-white border-b border-zinc-200 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Maximize2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">青椒简历</span>
          <Badge className="bg-emerald-50 text-emerald-600 ml-2">
            保存已配置
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600">QingJiao</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Toggle Theme"
          >
            <Sun size={18} />
          </Button>
          <Button className="gap-2">
            <Download size={16} />
            导出
          </Button>
        </div>
      </header>

      {/* 2. Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Column 1: Config & Module Management (280px) */}
        <aside className="w-[280px] bg-white border-r border-zinc-100 p-4 overflow-y-auto flex flex-col gap-6">
          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900">模块排序</h3>
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
              onReorder={(newModules) => {
                const basic = modules.find((m) => m.id === "basic")!;
                setModules([basic, ...newModules]);
              }}
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
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => toggleModuleVisibility(m.id)}>
                        {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => removeModule(m.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900">主题色选择</h3>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setThemeColor(c)}
                  style={{ "--bg-color": c } as React.CSSProperties}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform active:scale-95 bg-[var(--bg-color)]",
                    themeColor === c && "ring-2 ring-zinc-900 ring-offset-2",
                  )}
                  aria-label={`选择颜色 ${c}`}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">排版设置</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">字体选择</label>
                <select className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none">
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Outfit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-medium text-zinc-500">行高</label>
                  <span className="text-xs text-zinc-400">1.5</span>
                </div>
                <input type="range" className="w-full accent-zinc-900" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button size="sm" variant="outline" className="text-xs">小</Button>
                <Button size="sm" variant="secondary" className="text-xs">中</Button>
                <Button size="sm" variant="outline" className="text-xs">大</Button>
              </div>
            </div>
          </section>
        </aside>

        {/* Column 2: Form Editor (380px) */}
        <aside className="w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">基本信息</h2>
                </header>

                <div className="flex items-start gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300 relative">
                      {resumeData.avatar ? (
                        <Image src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                      ) : (
                        <User size={32} className="text-zinc-300" />
                      )}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer">
                      <Palette size={14} />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => {
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
                      }} />
                    </label>
                  </div>
                  <div className="flex-1 space-y-4">
                    <Input placeholder="姓名" value={resumeData.name} onChange={(e) => updateBasicData("name", e.target.value)} />
                    <Input placeholder="求职意向" value={resumeData.title} onChange={(e) => updateBasicData("title", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-4">
                  <Input label="电话" value={resumeData.phone} onChange={(e) => updateBasicData("phone", e.target.value)} />
                  <Input label="邮箱" value={resumeData.email} onChange={(e) => updateBasicData("email", e.target.value)} />
                  <Input label="城市" value={resumeData.city} onChange={(e) => updateBasicData("city", e.target.value)} />
                </div>
              </motion.div>
            )}

            {activeTab === "edu" && (
              <motion.div key="edu" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <Maximize2 size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">教育背景</h2>
                </header>
                {resumeData.education.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("edu", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"><Trash2 size={12} /></button>
                    <Input placeholder="学校" value={item.school} onChange={e => updateEducation(item.id, "school", e.target.value)} />
                    <Input placeholder="专业" value={item.major} onChange={e => updateEducation(item.id, "major", e.target.value)} />
                    <Input placeholder="时间" value={item.date} onChange={e => updateEducation(item.id, "date", e.target.value)} />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("edu")}>+ 添加教育</Button>
              </motion.div>
            )}

            {activeTab === "work" && (
              <motion.div key="work" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <Layout size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">工作经历</h2>
                </header>
                {resumeData.workExperiences.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("work", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"><Trash2 size={12} /></button>
                    <Input placeholder="公司" value={item.company} onChange={e => updateWork(item.id, "company", e.target.value)} />
                    <Input placeholder="职位" value={item.role} onChange={e => updateWork(item.id, "role", e.target.value)} />
                    <Input placeholder="时间" value={item.date} onChange={e => updateWork(item.id, "date", e.target.value)} />
                    <textarea 
                      placeholder="描述" 
                      className="w-full h-24 p-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400"
                      value={item.desc}
                      onChange={e => updateWork(item.id, "desc", e.target.value)}
                    />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("work")}>+ 添加经历</Button>
              </motion.div>
            )}

            {!["basic", "edu", "work"].includes(activeTab) && (
              <motion.div key="other" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full text-zinc-400 opacity-20">
                <Layout size={40} className="mb-4" />
                <p>建设中...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Column 3: Preview Canvas */}
        <section className="flex-1 bg-zinc-100 flex flex-col relative overflow-hidden group">
          {/* Zoom Overlay */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 shadow-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full">-</button>
            <span className="min-w-[40px] text-center">{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(prev => Math.min(1.5, prev + 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full">+</button>
            <div className="w-px h-3 bg-zinc-200 mx-1" />
            <button onClick={autoFit} className="px-2 py-1 hover:bg-zinc-100 rounded-md">适应</button>
          </div>

          <div ref={previewContainerRef} className="flex-1 overflow-auto p-8 flex justify-center items-start scrollbar-hide">
            <motion.div
              layout
              style={{ scale: zoomScale, transformOrigin: "top center" }}
              className="w-[800px] aspect-[1/1.414] bg-white shadow-2xl transition-transform flex flex-col p-12 shrink-0 mb-20 relative"
            >
              {/* Header Info */}
              <div className="flex items-center gap-8 mb-10">
                <div className="w-24 h-24 rounded-lg bg-zinc-50 flex items-center justify-center overflow-hidden relative">
                  {resumeData.avatar ? (
                    <Image src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                  ) : (
                    <User size={40} className="text-zinc-300" />
                  )}
                </div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-[var(--theme-color)]">{resumeData.name || "姓名"}</h1>
                  <p className="text-zinc-500 font-medium">{resumeData.title || "职位"}</p>
                  <div className="text-xs text-zinc-400 space-x-2">
                    <span>{resumeData.phone}</span>
                    {resumeData.email && <span>| {resumeData.email}</span>}
                    {resumeData.city && <span>| {resumeData.city}</span>}
                  </div>
                </div>
              </div>

              {/* Dynamic Content Sections */}
              <div className="space-y-8">
                {modules.filter(m => m.visible && m.id !== "basic").map(m => (
                  <section key={m.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-6 rounded-full bg-[var(--theme-color)]" />
                      <h3 className="text-lg font-bold">{m.title}</h3>
                    </div>
                    <div className="pl-4 space-y-4">
                      {m.id === "edu" && resumeData.education.map(item => (
                        <div key={item.id} className="flex justify-between items-start">
                          <div>
                            <div className="font-bold">{item.school || "学校名称"}</div>
                            <div className="text-sm text-zinc-600">{item.major || "专业内容"}</div>
                          </div>
                          <div className="text-xs text-zinc-400">{item.date}</div>
                        </div>
                      ))}
                      {m.id === "work" && resumeData.workExperiences.map(item => (
                        <div key={item.id} className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>{item.company || "公司名称"}</span>
                            <span className="text-xs font-normal text-zinc-400">{item.date}</span>
                          </div>
                          <div className="text-sm text-zinc-600 italic font-medium">{item.role || "担任职位"}</div>
                          <div className="text-sm text-zinc-500 whitespace-pre-wrap mt-1">{item.desc || "工作描述..."}</div>
                        </div>
                      ))}
                      {(!["edu", "work"].includes(m.id)) && (
                        <div className="text-sm text-zinc-300 italic">待填写...</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fixed Toolbar */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40">
            <div className="flex flex-col gap-4 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-xl border border-zinc-200">
              <Button size="icon" variant="ghost" className="rounded-full"><FileText size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full"><Type size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full"><Layout size={20} /></Button>
              <div className="w-6 h-px bg-zinc-200 mx-auto" />
              <Button size="icon" variant="ghost" className="rounded-full"><DownloadCloud size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full"><Code size={20} /></Button>
              <Button size="icon" variant="ghost" className="rounded-full"><HelpCircle size={20} /></Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
