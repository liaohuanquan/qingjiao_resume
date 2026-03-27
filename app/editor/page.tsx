"use client";

import React, { useState, useCallback } from "react";
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
  X,
  Check,
} from "lucide-react";
// 重命名为 NextImage 以避免遮蔽全局 Image 构造函数
import NextImage from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Cropper, { Area } from "react-easy-crop";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 辅助函数 ---

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    // 使用 globalThis.Image 确保调用浏览器原生的 HTMLImageElement 构造函数
    const image = new globalThis.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg");
}

// --- 类型定义 ---

interface ResumeData {
  name: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  avatar?: string;
  avatarAspect?: number;
  avatarBorderRadius?: number; // 圆角百分比 0-50
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
  fontSize: number; 
}

interface ModuleItem {
  id: string;
  title: string;
  visible: boolean;
}

// --- 基础 UI 组件 ---

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

// --- 主页面组件 ---

export default function ResumeEditor() {
  const [activeTab, setActiveTab] = useState("basic");
  const [themeColor, setThemeColor] = useState("#10b981");
  const [zoomScale, setZoomScale] = useState(0.8);
  const [numPages, setNumPages] = useState(1);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);
  const resumeContentRef = React.useRef<HTMLDivElement>(null);

  // 头像裁剪状态
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1); // 默认 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // 排版设置
  const [typography, setTypography] = useState<TypographyConfig>({
    fontFamily: "Inter, sans-serif",
    lineHeight: 1.6,
    fontSize: 14.5,
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
    avatarAspect: 1,
    avatarBorderRadius: 12,
    education: [
      { id: "e1", school: "五邑大学", major: "软件工程", date: "2022 - 2026" }
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

  const onCropComplete = useCallback((_croppedArea: Area, _croppedAreaPixels: Area) => {
    setCroppedAreaPixels(_croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (tempAvatar && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempAvatar, croppedAreaPixels);
        if (croppedImage) {
          setResumeData(prev => ({ 
            ...prev, 
            avatar: croppedImage,
            avatarAspect: aspect 
          }));
          localStorage.setItem("resume_avatar", croppedImage);
          localStorage.setItem("resume_avatar_aspect", aspect.toString());
        }
      } catch (e) {
        console.error("Error cropping image:", e);
      }
    }
    setTempAvatar(null);
  };

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

  const updateListItem = (type: "edu" | "work" | "project", id: string, field: string, value: string) => {
    setResumeData(prev => {
      if (type === "edu") {
        return { ...prev, education: prev.education.map(item => item.id === id ? { ...item, [field]: value } : item) };
      }
      if (type === "work") {
        return { ...prev, workExperiences: prev.workExperiences.map(item => item.id === id ? { ...item, [field]: value } : item) };
      }
      return { ...prev, projects: prev.projects.map(item => item.id === id ? { ...item, [field]: value } : item) };
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
    if (type === "edu") {
      setResumeData(prev => ({ ...prev, education: prev.education.filter(i => i.id !== id) }));
    } else if (type === "work") {
      setResumeData(prev => ({ ...prev, workExperiences: prev.workExperiences.filter(i => i.id !== id) }));
    } else {
      setResumeData(prev => ({ ...prev, projects: prev.projects.filter(i => i.id !== id) }));
    }
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
    const savedAvatarAspect = localStorage.getItem("resume_avatar_aspect");
    const savedAvatarRadius = localStorage.getItem("resume_avatar_radius");
    if (savedAvatar) {
      setResumeData(prev => ({ 
        ...prev, 
        avatar: savedAvatar,
        avatarAspect: savedAvatarAspect ? parseFloat(savedAvatarAspect) : 1,
        avatarBorderRadius: savedAvatarRadius ? parseInt(savedAvatarRadius) : 12
      }));
    }
    autoFit();
    window.addEventListener("resize", autoFit);

    // 分页逻辑
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.scrollHeight;
        setNumPages(Math.max(1, Math.ceil(height / 1120))); // 略小于 1160 以留出边距
      }
    });
    if (resumeContentRef.current) {
      observer.observe(resumeContentRef.current);
    }

    return () => {
      window.removeEventListener("resize", autoFit);
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-50 font-sans text-zinc-900"
      /* 注入全局 CSS 变量以控制动态样式 */
      style={{ 
        "--theme-color": themeColor,
        "--font-family": typography.fontFamily,
        "--line-height": typography.lineHeight,
      } as React.CSSProperties}
    >
      {/* Head */}
      <header className="h-[60px] flex items-center justify-between px-6 bg-white border-b border-zinc-200 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Maximize2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">青椒简历</span>
          <Badge className="bg-emerald-50 text-emerald-600 ml-2">自动保存开启</Badge>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600">QingJiao</span>
          <Button variant="ghost" size="icon" className="rounded-full" title="显示源">
            <Sun size={18} />
          </Button>
          <Button className="gap-2">
            <Download size={16} /> 导出
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Column 1: Module Manager */}
        <aside className="w-[280px] bg-white border-r border-zinc-100 p-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide">
          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Settings2 size={14} /> 模块管理
            </h3>
            <div className="space-y-2 mb-2">
              <Card onClick={() => setActiveTab("basic")} className={cn("flex items-center gap-2 cursor-pointer transition-all", activeTab === "basic" && "border-zinc-900 ring-1 ring-zinc-900/5")}>
                <div className="w-4 h-4 rounded-sm border border-zinc-200 flex items-center justify-center bg-zinc-50 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                </div>
                <span className="text-sm text-zinc-600 flex-1 ml-1">基本信息</span>
                <Badge className="bg-zinc-100 text-zinc-400 font-normal ml-auto">固定</Badge>
              </Card>
            </div>

            <Reorder.Group axis="y" values={modules.filter((m) => m.id !== "basic")} onReorder={(newModules) => setModules([modules[0], ...newModules])} className="space-y-2">
              {modules.filter((m) => m.id !== "basic").map((m) => (
                <Reorder.Item key={m.id} value={m} onClick={() => setActiveTab(m.id)}>
                  <Card className={cn("flex items-center gap-2 cursor-pointer transition-all", activeTab === m.id && "border-zinc-900 ring-1 ring-zinc-900/5", !m.visible && "opacity-50")}>
                    <GripVertical size={16} className="text-zinc-400 cursor-grab active:cursor-grabbing" />
                    <span className="text-sm text-zinc-600 flex-1">{m.title}</span>
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => toggleModuleVisibility(m.id)} title={m.visible ? "隐藏" : "显示"}>{m.visible ? <Eye size={14} /> : <EyeOff size={14} />}</button>
                      <button className="p-1 hover:bg-zinc-100 rounded text-zinc-400" onClick={() => removeModule(m.id)} title="删除"><Trash2 size={14} /></button>
                    </div>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2"><Palette size={14} /> 主题色</h3>
            <div className="flex flex-wrap gap-3 px-1 items-center">
              {presetColors.map((c) => (
                <button key={c} onClick={() => setThemeColor(c)} style={{ "--bg-color": c } as React.CSSProperties} className={cn("w-6 h-6 rounded-full transition-all active:scale-90 bg-[var(--bg-color)] shadow-sm", themeColor === c && "ring-2 ring-zinc-900 ring-offset-2")} title={c} />
              ))}
              <input type="color" className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer p-1.5 bg-zinc-50" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} title="定制颜色" />
              <span className="text-[10px] text-zinc-400 font-mono tracking-tight uppercase">{themeColor}</span>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2"><Type size={14} /> 版式调节</h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500" htmlFor="font-fam">字体</label>
                <select id="font-fam" className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none" value={typography.fontFamily} onChange={(e) => setTypography(prev => ({ ...prev, fontFamily: e.target.value }))}>
                  <option value="Inter, sans-serif">Inter (通用)</option>
                  <option value="'Roboto', sans-serif">Roboto (机械)</option>
                  <option value="'Outfit', sans-serif">Outfit (现代精美)</option>
                  <option value="'Songti SC', serif">宋体 (正式)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between"><label className="text-xs font-medium text-zinc-500" htmlFor="line-h">行距</label><span className="text-xs text-zinc-400">{typography.lineHeight}</span></div>
                <input id="line-h" type="range" min="1.0" max="2.5" step="0.05" className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none accent-zinc-900 cursor-pointer" value={typography.lineHeight} onChange={(e) => setTypography(prev => ({ ...prev, lineHeight: parseFloat(e.target.value) }))} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">主字号 (px)</label>
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" className="w-10 h-10 p-0" onClick={() => setTypography(prev => ({ ...prev, fontSize: Math.max(10, prev.fontSize - 0.5) }))}><Minus size={14} /></Button>
                  <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">{typography.fontSize.toFixed(1)}</div>
                  <Button size="sm" variant="outline" className="w-10 h-10 p-0" onClick={() => setTypography(prev => ({ ...prev, fontSize: Math.min(24, prev.fontSize + 0.5) }))}><Plus size={14} /></Button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Column 2: Editor Pane */}
        <aside className="w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div key="basic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm"><User size={20} /></div>
                  <h2 className="text-xl font-bold tracking-tight">基本信息</h2>
                </header>

                <section className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div 
                        className="w-24 bg-white border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300 relative"
                        style={{ 
                          height: `${96 / (resumeData.avatarAspect || 1)}px`,
                          borderRadius: `${resumeData.avatarBorderRadius}px` 
                        }}
                      >
                        {resumeData.avatar ? (
                          <NextImage src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                        ) : (
                          <User size={32} className="text-zinc-300" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer" title="上传头像">
                        <Palette size={14} />
                        <input type="file" className="hidden" aria-label="头像上传" accept="image/*" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setTempAvatar(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }} />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <Input placeholder="姓名" value={resumeData.name} onChange={(e) => updateBasicData("name", e.target.value)} title="姓名" />
                      <Input placeholder="职位/称号" value={resumeData.title} onChange={(e) => updateBasicData("title", e.target.value)} title="职位标题" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                      <span>头像圆角</span>
                      <span>{resumeData.avatarBorderRadius}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="48" 
                      step="1" 
                      value={resumeData.avatarBorderRadius || 12}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setResumeData(prev => ({ ...prev, avatarBorderRadius: val }));
                        localStorage.setItem("resume_avatar_radius", val.toString());
                      }}
                      className="w-full h-1.5 bg-zinc-100 rounded-lg appearance-none accent-zinc-900 cursor-pointer"
                      title="头像圆角"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input label="主要电话" value={resumeData.phone} onChange={(e) => updateBasicData("phone", e.target.value)} />
                    <Input label="电子邮件" value={resumeData.email} onChange={(e) => updateBasicData("email", e.target.value)} />
                    <Input label="所在地" value={resumeData.city} onChange={(e) => updateBasicData("city", e.target.value)} />
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "edu" && (
              <motion.div key="edu" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600"><GraduationCap size={20} /></div><h2 className="text-xl font-bold tracking-tight">教育背景</h2></header>
                {resumeData.education.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("edu", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm" title="移除"><Trash2 size={12} /></button>
                    <Input placeholder="学校名称" value={item.school} onChange={e => updateListItem("edu", item.id, "school", e.target.value)} />
                    <Input placeholder="专业科目" value={item.major} onChange={e => updateListItem("edu", item.id, "major", e.target.value)} />
                    <Input placeholder="入学起止日期" value={item.date} onChange={e => updateListItem("edu", item.id, "date", e.target.value)} />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("edu")}>+ 新增教育</Button>
              </motion.div>
            )}

            {activeTab === "work" && (
              <motion.div key="work" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600"><Briefcase size={20} /></div><h2 className="text-xl font-bold tracking-tight">工作经历</h2></header>
                {resumeData.workExperiences.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("work", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm"><Trash2 size={12} /></button>
                    <Input placeholder="公司平台" value={item.company} onChange={e => updateListItem("work", item.id, "company", e.target.value)} />
                    <Input placeholder="主要角色" value={item.role} onChange={e => updateListItem("work", item.id, "role", e.target.value)} />
                    <Input placeholder="在职期间" value={item.date} onChange={e => updateListItem("work", item.id, "date", e.target.value)} />
                    <textarea placeholder="关键成果描述..." className="w-full h-32 p-3 text-sm border border-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white" value={item.desc} onChange={e => updateListItem("work", item.id, "desc", e.target.value)} title="内容说明" />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("work")}>+ 新增经历</Button>
              </motion.div>
            )}

            {activeTab === "project" && (
              <motion.div key="project" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600"><Rocket size={20} /></div><h2 className="text-xl font-bold tracking-tight">项目经验</h2></header>
                {resumeData.projects.map(item => (
                  <Card key={item.id} className="relative group p-4 border-dashed border-zinc-200 space-y-3">
                    <button onClick={() => deleteItem("project", item.id)} className="absolute -top-2 -right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100"><Trash2 size={12} /></button>
                    <Input placeholder="项目主题" value={item.name} onChange={e => updateListItem("project", item.id, "name", e.target.value)} />
                    <Input placeholder="职责分工" value={item.role} onChange={e => updateListItem("project", item.id, "role", e.target.value)} />
                    <Input placeholder="时间段" value={item.date} onChange={e => updateListItem("project", item.id, "date", e.target.value)} />
                    <textarea placeholder="项目核心亮点..." className="w-full h-32 p-3 text-sm border border-zinc-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white" value={item.desc} onChange={e => updateListItem("project", item.id, "desc", e.target.value)} title="技术细节" />
                  </Card>
                ))}
                <Button variant="outline" className="w-full border-dashed" onClick={() => addItem("project")}>+ 新增项目</Button>
              </motion.div>
            )}

            {activeTab === "skill" && (
              <motion.div key="skill" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                <header className="flex items-center gap-3 mb-8"><div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600"><Type size={20} /></div><h2 className="text-xl font-bold tracking-tight">专业技能</h2></header>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-500">技能清单 (逗号分隔)</label>
                  <textarea className="w-full h-48 p-4 text-sm border border-zinc-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white leading-relaxed font-mono" value={resumeData.skills.join(", ")} onChange={(e) => updateSkills(e.target.value)} title="列表键入" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Column 3: Preview Output */}
        <section className="flex-1 bg-zinc-100 flex flex-col relative overflow-hidden group">
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-200 shadow-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button onClick={() => setZoomScale(prev => Math.max(0.4, prev - 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full" title="缩小">-</button>
            <span className="min-w-[40px] text-center text-zinc-600">{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(prev => Math.min(1.5, prev + 0.1))} className="w-8 h-8 hover:bg-zinc-100 rounded-full" title="放大">+</button>
            <div className="w-px h-3 bg-zinc-200 mx-1" />
            <button onClick={autoFit} className="px-3 py-1 hover:bg-zinc-100 rounded-md text-zinc-500">自适应</button>
          </div>

          <div ref={previewContainerRef} className="flex-1 overflow-auto p-12 pb-32 flex flex-col items-center scrollbar-hide bg-zinc-200/50">
            {/* 页面容器 */}
            <div style={{ scale: zoomScale, transformOrigin: "top center" }} className="flex flex-col gap-10">
               {Array.from({ length: numPages }).map((_, pageIdx) => (
                 <motion.div 
                   key={pageIdx}
                   className="w-[820px] h-[1160px] bg-white shadow-2xl relative overflow-hidden shrink-0 group/page"
                 >
                   {/* 内容层：通过 translateY 实现跨页展示 */}
                   <div 
                     className="absolute top-0 left-0 w-full p-16"
                     style={{ 
                       transform: `translateY(-${pageIdx * 1160}px)`,
                       fontFamily: "var(--font-family)", 
                       lineHeight: "var(--line-height)", 
                       fontSize: `${typography.fontSize}px` 
                     }}
                   >
                     {/* 所有页面都渲染完整内容，但通过容器的 overflow-hidden 实现视窗切分 */}
                     {/* 仅第一页挂载 ref 以供 ResizeObserver 监听总高度 */}
                     <div ref={pageIdx === 0 ? resumeContentRef : null} className="space-y-12 pb-16">
                        {/* 个人基本信息 (仅在第一页展示) */}
                        {pageIdx === 0 && (
                          <div className="flex items-center gap-10 mb-12">
                            <div 
                              className="w-28 bg-zinc-50 flex items-center justify-center overflow-hidden relative shadow-inner ring-1 ring-zinc-100"
                              style={{ 
                                height: `${112 / (resumeData.avatarAspect || 1)}px`,
                                borderRadius: `${resumeData.avatarBorderRadius}px`
                              }}
                            >
                              {resumeData.avatar ? (
                                <NextImage src={resumeData.avatar} alt="Avatar" fill className="object-cover" unoptimized />
                              ) : (
                                <User size={48} className="text-zinc-200" style={{ height: '48px' }} />
                              )}
                            </div>
                            <div className="space-y-2 flex-1 text-zinc-900">
                              <h1 className="text-4xl font-black tracking-tight text-[var(--theme-color)] transition-none">{resumeData.name || "您的姓名"}</h1>
                              <p className="text-lg text-zinc-500 font-semibold tracking-wide">{resumeData.title || "求职目标"}</p>
                              <div className="text-[0.85em] text-zinc-400 flex flex-wrap gap-x-6 gap-y-2 mt-3 opacity-80 font-medium">
                                <span>{resumeData.phone}</span>
                                {resumeData.email && <span>| {resumeData.email}</span>}
                                {resumeData.city && <span>| {resumeData.city}</span>}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 模块列表 */}
                        <div className={cn("space-y-12", pageIdx > 0 && "pt-4")}>
                          {modules.filter(m => m.visible && m.id !== "basic").map(m => (
                            <section key={m.id}>
                              <div className="flex items-center gap-3 mb-6 border-b-2 border-zinc-900/10 pb-2.5">
                                <div className="w-2 h-6 rounded-sm bg-[var(--theme-color)]" />
                                <h3 className="text-xl font-bold tracking-tight text-zinc-800 uppercase">{m.title}</h3>
                              </div>
                              <div className="pl-1 space-y-6">
                                {m.id === "edu" && resumeData.education.map(item => (
                                  <div key={item.id} className="flex justify-between items-baseline">
                                    <div className="space-y-0.5"><div className="font-bold text-zinc-800 text-[1.1em]">{item.school || "教育中心"}</div><div className="text-zinc-500 font-medium">{item.major}</div></div>
                                    <div className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</div>
                                  </div>
                                ))}
                                {m.id === "work" && resumeData.workExperiences.map(item => (
                                  <div key={item.id} className="space-y-2.5">
                                    <div className="flex justify-between font-bold items-center"><span className="text-zinc-800 text-[1.1em]">{item.company}</span><span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</span></div>
                                    <div className="text-[0.95em] text-[var(--theme-color)] font-bold">{item.role}</div>
                                    <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">{item.desc}</div>
                                  </div>
                                ))}
                                {m.id === "project" && resumeData.projects.map(item => (
                                  <div key={item.id} className="space-y-2.5">
                                    <div className="flex justify-between font-bold items-center"><span className="text-zinc-800 text-[1.1em]">{item.name}</span><span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">{item.date}</span></div>
                                    <div className="text-[0.95em] text-zinc-600 font-bold">{item.role}</div>
                                    <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">{item.desc}</div>
                                  </div>
                                ))}
                                {m.id === "skill" && (
                                  <div className="flex flex-wrap gap-x-6 gap-y-3 leading-relaxed">
                                     {resumeData.skills.filter(s => s).map((s, idx) => (
                                       <span key={idx} className="flex items-center gap-2 text-zinc-600 font-medium"><div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] opacity-40 shrink-0" />{s}</span>
                                     ))}
                                  </div>
                                )}
                              </div>
                            </section>
                          ))}
                        </div>
                     </div>
                   </div>
                   
                   {/* Visual Page Footer with page number */}
                   <div className="absolute bottom-6 right-8 text-[10px] text-zinc-300 font-mono tracking-widest uppercase pointer-events-none">
                     Page {pageIdx + 1} / {numPages}
                   </div>
                 </motion.div>
               ))}
            </div>
          </div>
        </section>
      </main>

      {/* Avatar Crop Modal */}
      <AnimatePresence>
        {tempAvatar && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-600"><Palette size={24} /></div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">裁剪设定</h3>
                    <p className="text-sm text-zinc-500">选择合适的比例并调整位置</p>
                  </div>
                </div>
                <button onClick={() => setTempAvatar(null)} className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full text-zinc-400 transition-colors"><X size={20} /></button>
              </div>
              
              <div className="h-[400px] relative bg-zinc-900">
                <Cropper
                  image={tempAvatar}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="p-6 bg-white border-t border-zinc-100 flex flex-col gap-6">
                {/* 比例选择 */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">比例预设</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "1:1 正方形", value: 1 },
                      { label: "3:4 证件照", value: 3/4 },
                      { label: "4:3 宽屏", value: 4/3 },
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setAspect(r.value)}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                          aspect === r.value 
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-lg" 
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                   <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest">
                     <span>缩放控制</span>
                     <span>{Math.round(zoom * 100)}%</span>
                   </div>
                   <div className="flex items-center gap-4">
                    <Minus size={16} className="text-zinc-400" />
                    <input type="range" value={zoom} min={1} max={3} step={0.1} aria-labelledby="Zoom" className="flex-1 h-1.5 bg-zinc-100 rounded-lg appearance-none accent-zinc-900 cursor-pointer" onChange={(e) => setZoom(Number(e.target.value))} title="调节大小" />
                    <Plus size={16} className="text-zinc-400" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 h-12" onClick={() => setTempAvatar(null)}>返回编辑</Button>
                  <Button variant="primary" className="flex-2 h-12 gap-2 shadow-lg shadow-zinc-900/10" onClick={handleApplyCrop}>
                    <Check size={18} /> 确认并应用
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
