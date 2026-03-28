"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  DownloadCloud,
  Code,
  User,
  GripVertical,
  Eye,
  Trash2,
  Type,
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
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";

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
    pixelCrop.height,
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
  // --- 深度自定义字段 ---
  birthday?: string; // 出生日期
  experience?: string; // 工作年限
  hometown?: string; // 籍贯
  politics?: string; // 政治面貌
  github?: string; // Github
  blog?: string; // 个人博客
  // -------------------
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
  skillStyle?: "dot" | "tag";
  skillTagRadius?: number;
  skillTagColor?: string;
  skillTagUseTheme?: boolean;
  // --- 版块独立样式 ---
  sectionStyles?: {
    [key: string]: {
      fontSize?: number;
      spacing?: number;
    };
  };
}

interface ModuleItem {
  id: string;
  title: string;
  visible: boolean;
  type?: "standard" | "custom";
  content?: string;
}

interface ResumeMetadata {
  id: string;
  title: string;
  lastModified: string;
  theme: string;
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
    primary:
      "bg-zinc-900 text-white hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400",
    secondary:
      "bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 disabled:opacity-50",
    ghost:
      "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50",
    outline:
      "border border-zinc-300 bg-transparent hover:bg-zinc-50 disabled:opacity-50",
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
      "rounded-xl border border-zinc-300 p-3 bg-white shadow-sm",
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
      className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-400"
      {...props}
    />
  </div>
);

// --- 主页面组件 ---

export default function ResumeEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resumeId = searchParams.get("id") || "default-1";

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
    skillStyle: "dot",
    skillTagRadius: 6,
    skillTagColor: "#71717a",
    skillTagUseTheme: true,
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
      { id: "e1", school: "五邑大学", major: "通信工程", date: "2022 - 2026" },
    ],
    workExperiences: [
      {
        id: "w1",
        company: "青椒实验室",
        role: "高级前端开发",
        date: "2020 - 至今",
        desc: "1. 负责核心编辑器的架构设计与性能优化。\n2. 实现实时协同预览引擎。",
      },
    ],
    projects: [
      {
        id: "p1",
        name: "青椒简历编辑器",
        role: "核心开发",
        date: "2023.01 - 至今",
        desc: "基于 Next.js 15 和 Tailwind CSS 4 开发的现代化简历编辑器。",
      },
    ],
    skills: [
      "Javascript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Node.js",
    ],
  });

  const presetColors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#18181b"];

  const onCropComplete = useCallback(
    (_croppedArea: Area, _croppedAreaPixels: Area) => {
      setCroppedAreaPixels(_croppedAreaPixels);
    },
    [],
  );

  const handleApplyCrop = async () => {
    if (tempAvatar && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempAvatar, croppedAreaPixels);
        if (croppedImage) {
          setResumeData((prev) => ({
            ...prev,
            avatar: croppedImage,
            avatarAspect: aspect,
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

  const updateListItem = (
    type: "edu" | "work" | "project",
    id: string,
    field: string,
    value: string,
  ) => {
    setResumeData((prev) => {
      if (type === "edu") {
        return {
          ...prev,
          education: prev.education.map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          ),
        };
      }
      if (type === "work") {
        return {
          ...prev,
          workExperiences: prev.workExperiences.map((item) =>
            item.id === id ? { ...item, [field]: value } : item,
          ),
        };
      }
      return {
        ...prev,
        projects: prev.projects.map((item) =>
          item.id === id ? { ...item, [field]: value } : item,
        ),
      };
    });
  };

  const addItem = (type: "edu" | "work" | "project") => {
    const id = Date.now().toString();
    if (type === "edu") {
      setResumeData((prev) => ({
        ...prev,
        education: [...prev.education, { id, school: "", major: "", date: "" }],
      }));
    } else if (type === "work") {
      setResumeData((prev) => ({
        ...prev,
        workExperiences: [
          ...prev.workExperiences,
          { id, company: "", role: "", date: "", desc: "" },
        ],
      }));
    } else {
      setResumeData((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          { id, name: "", role: "", date: "", desc: "" },
        ],
      }));
    }
  };

  // 删除列表项（教育、工作、项目）
  const deleteItem = (type: "edu" | "work" | "project", id: string) => {
    if (type === "edu") {
      setResumeData((prev) => ({
        ...prev,
        education: prev.education.filter((i) => i.id !== id),
      }));
    } else if (type === "work") {
      setResumeData((prev) => ({
        ...prev,
        workExperiences: prev.workExperiences.filter((i) => i.id !== id),
      }));
    } else {
      setResumeData((prev) => ({
        ...prev,
        projects: prev.projects.filter((i) => i.id !== id),
      }));
    }
  };

  // 更新技能列表
  const updateSkills = (value: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: value.split(",").map((s) => s.trim()),
    }));
  };

  // 自动适配缩放比例，使预览区刚好填满容器宽度
  const autoFit = () => {
    if (previewContainerRef.current) {
      const containerWidth = previewContainerRef.current.clientWidth - 64;
      const scale = Math.min(1, containerWidth / 820);
      setZoomScale(Number(scale.toFixed(2)));
    }
  };

  React.useEffect(() => {
    // 1. 初始化加载本地存储
    try {
      const dataKey = `resume_data_${resumeId}`;
      const savedFullData = localStorage.getItem(dataKey);
      
      if (savedFullData) {
        const config = JSON.parse(savedFullData);
        if (config.resumeData) setResumeData(config.resumeData);
        if (config.modules) setModules(config.modules);
        if (config.themeColor) setThemeColor(config.themeColor);
        if (config.typography) setTypography(config.typography);
      } else {
        // 兼容旧版本数据或加载默认值
        const savedData = localStorage.getItem("resume_v2_data");
        if (savedData && resumeId === "default-1") {
           setResumeData(JSON.parse(savedData));
           const savedModules = localStorage.getItem("resume_v2_modules");
           const savedTheme = localStorage.getItem("resume_v2_theme");
           const savedTypo = localStorage.getItem("resume_v2_typography");
           if (savedModules) setModules(JSON.parse(savedModules));
           if (savedTheme) setThemeColor(savedTheme);
           if (savedTypo) setTypography(JSON.parse(savedTypo));
        }
      }

      // 处理头像
      const legacyAvatar = localStorage.getItem("resume_avatar");
      if (legacyAvatar && resumeId === "default-1") {
        setResumeData((prev) => ({ ...prev, avatar: legacyAvatar }));
      }
    } catch (e) {
      console.error("加载本地数据失败:", e);
    }

    autoFit();
    window.addEventListener("resize", autoFit);

    // 2. 分页观察逻辑
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height = entry.target.scrollHeight;
        const EFFECTIVE_H = 1160 - 128; // 常量对齐
        setNumPages(Math.max(1, Math.ceil(height / EFFECTIVE_H)));
      }
    });

    if (resumeContentRef.current) {
      observer.observe(resumeContentRef.current);
    }

    return () => {
      window.removeEventListener("resize", autoFit);
      observer.disconnect();
    };
  }, [resumeId]);

  const [isSaving, setIsSaving] = useState(false); // 是否正在保存
  const [isExporting, setIsExporting] = useState(false); // 是否正在导出 PDF
  const [exportProgress, setExportProgress] = useState<string | null>(null); // 导出进度提示
  const [isPanning, setIsPanning] = useState(false); // 预览区是否正在按下鼠标拖拽平移
  // 移动端底部 Tab 激活状态：管理、编辑、预览
  const [activeMobileTab, setActiveMobileTab] = useState<"manage" | "edit" | "preview">("edit");
  const scrollStart = React.useRef({ scrollLeft: 0, scrollTop: 0, x: 0, y: 0 }); // 记录拖拽起始位置
  const importInputRef = React.useRef<HTMLInputElement>(null); // JSON 导入隐藏 Input Ref

  // 1. PDF 导出逻辑：深度集成 jsPDF 与 html-to-image
  const exportToPdf = async () => {
    setIsExporting(true);
    setExportProgress("正在准备文档...");
    try {
      // 这里的尺寸为 A4 标准: 210mm x 297mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pages = document.querySelectorAll(".group\\/page");

      if (pages.length === 0) {
        throw new Error("未找到预览页面");
      }

      for (let i = 0; i < pages.length; i++) {
        setExportProgress(`正在渲染第 ${i + 1} / ${pages.length} 页...`);
        
        // 使用 toJpeg 将 DOM 转换为高清晰度图片
        const imgData = await toJpeg(pages[i] as HTMLElement, {
          quality: 0.95,
          pixelRatio: 3, // 3倍像素比足以支持 Retina 级别的清晰打印
          backgroundColor: "#ffffff",
          cacheBust: true, // 避免缓存干扰
        });

        if (i > 0) pdf.addPage();
        
        // 将图片完美贴合到 PDF 的 A4 页面上
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297, undefined, "FAST");
      }

      setExportProgress("正在打包下载...");
      pdf.save(`青椒简历-${resumeData.name || "未命名"}.pdf`);
    } catch (err) {
      console.error("PDF 失败:", err);
      alert("PDF 生成失败，请检查浏览器是否兼容。");
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  // 2. JSON 配置导出与导入
  const exportToJson = () => {
    const config = { resumeData, modules, themeColor, typography };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `resume-${resumeData.name || "config"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target?.result as string);
        if (config.resumeData) setResumeData(config.resumeData);
        if (config.modules) setModules(config.modules);
        if (config.themeColor) setThemeColor(config.themeColor);
        if (config.typography) setTypography(config.typography);
      } catch {
        alert("导入失败：JSON 格式不正确");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // 3. 自动保存逻辑：优化防抖机制
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);

      // 1. 保存详细数据
      const config = { resumeData, modules, themeColor, typography };
      localStorage.setItem(`resume_data_${resumeId}`, JSON.stringify(config));

      // 2. 同步更新 Dashboard 列表元数据
      const savedList = localStorage.getItem("resume_list");
      if (savedList) {
        try {
          const list = JSON.parse(savedList);
          const index = list.findIndex((item: ResumeMetadata) => item.id === resumeId);
          if (index !== -1) {
            list[index] = {
              ...list[index],
              title: resumeData.name ? `${resumeData.name}的简历` : list[index].title,
              theme: themeColor,
              lastModified: new Date().toLocaleDateString(),
            };
            localStorage.setItem("resume_list", JSON.stringify(list));
          }
        } catch (e) {
          console.error("同步列表失败:", e);
        }
      }

      setTimeout(() => setIsSaving(false), 800);
    }, 2000);

    return () => clearTimeout(timer);
  }, [resumeData, modules, themeColor, typography, resumeId]);

  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-50 font-sans text-zinc-900"
      /* 注入全局 CSS 变量以控制动态样式 */
      style={
        {
          "--theme-color": themeColor,
          "--theme-color-5": `${themeColor}0d`, // 5% opacity in hex
          "--theme-color-20": `${themeColor}33`, // 20% opacity in hex
          "--font-family": typography.fontFamily,
          "--line-height": typography.lineHeight,
        } as React.CSSProperties
      }
    >
      {/* Head */}
      <header className="h-[60px] flex items-center justify-between px-6 bg-white border-b border-zinc-200 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push("/dashboard")}
            className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center hover:bg-zinc-800 transition-colors"
          >
            <Maximize2 size={18} className="text-white" />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-none mb-0.5">青椒简历</span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Editor Mode</span>
          </div>
          <Badge
            className={cn(
              "ml-2 flex items-center gap-2 transition-all duration-300",
              isExporting
                ? "bg-blue-50 text-blue-600"
                : isSaving
                  ? "bg-amber-50 text-amber-600"
                  : "bg-emerald-50 text-emerald-600",
            )}
          >
            {isExporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <DownloadCloud size={12} />
              </motion.div>
            ) : (
              <motion.div
                animate={
                  isSaving
                    ? { scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }
                    : { opacity: [0.4, 1, 0.4] }
                }
                transition={{
                  duration: isSaving ? 0.8 : 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isSaving ? "bg-amber-500" : "bg-emerald-500",
                )}
              />
            )}
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              {isExporting ? exportProgress : isSaving ? "保存中" : "已保存"}
            </span>
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-600 hidden sm:inline-block">QingJiao Resume</span>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            title="源视图暂未开启"
          >
            <Sun size={18} />
          </Button>
          <div className="flex items-center gap-2 border-l border-zinc-200 pl-4 ml-1">
             <Button variant="outline" size="sm" className="gap-2 text-xs font-bold hidden md:flex" onClick={() => importInputRef.current?.click()}>
               <Rocket size={14} /> 导入配置
               <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImportJson} />
             </Button>
             <Button variant="outline" size="sm" className="gap-2 text-xs font-bold hidden sm:flex" onClick={exportToJson}>
               <Code size={14} /> 备份 JSON
             </Button>
             <Button size="sm" className="gap-2 text-xs font-bold shadow-lg shadow-emerald-900/10" onClick={exportToPdf} disabled={isExporting}>
               <DownloadCloud size={14} /> 
               <span className="hidden sm:inline">{isExporting ? "正在生成 PDF..." : "下载 PDF"}</span>
               <span className="sm:hidden">{isExporting ? "..." : "下载"}</span>
             </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Column 1: Module Manager - Mobile Toggle */}
        <aside className={cn(
          "w-full lg:w-[280px] bg-white border-r border-zinc-100 p-4 overflow-y-auto flex-col gap-6 scrollbar-hide absolute inset-0 z-40 lg:relative lg:flex lg:translate-x-0 transition-transform duration-300",
          activeMobileTab === "manage" ? "translate-x-0 flex" : "-translate-x-full lg:translate-x-0"
        )}>
          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Settings2 size={14} /> 模块管理（拖动排序）
            </h3>
            <div className="space-y-2 mb-2">
              <Card
                onClick={() => setActiveTab("basic")}
                className={cn(
                  "flex items-center gap-2 cursor-pointer transition-all",
                  activeTab === "basic" &&
                    "border-zinc-900 ring-1 ring-zinc-900/5",
                )}
              >
                <div className="w-4 h-4 rounded-sm border border-zinc-200 flex items-center justify-center bg-zinc-50 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                </div>
                <span className="text-sm text-zinc-600 flex-1 ml-1">
                  基本信息
                </span>
                <Badge className="bg-zinc-100 text-zinc-400 font-normal ml-auto">
                  固定
                </Badge>
              </Card>
            </div>

            <Reorder.Group
              axis="y"
              values={modules.filter((m) => m.id !== "basic")}
              onReorder={(newModules) =>
                setModules([modules[0], ...newModules])
              }
              className="space-y-2"
            >
              {modules
                .filter((m) => m.id !== "basic")
                .map((m) => (
                  <Reorder.Item
                    key={m.id}
                    value={m}
                    onClick={() => setActiveTab(m.id)}
                  >
                    <Card
                      className={cn(
                        "flex items-center gap-2 cursor-pointer transition-all",
                        activeTab === m.id &&
                          "border-zinc-900 ring-1 ring-zinc-900/5",
                        !m.visible && "opacity-50",
                      )}
                    >
                      <GripVertical
                        size={16}
                        className="text-zinc-400 cursor-grab active:cursor-grabbing"
                      />
                      <span className="text-sm text-zinc-600 flex-1">
                        {m.title}
                      </span>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                          onClick={() => toggleModuleVisibility(m.id)}
                          title={m.visible ? "隐藏" : "显示"}
                        >
                          {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                          onClick={() => removeModule(m.id)}
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Card>
                  </Reorder.Item>
                ))}
            </Reorder.Group>
            
            <Button
              variant="outline"
              className="w-full mt-4 border-dashed border-zinc-300 bg-white hover:bg-zinc-50 flex items-center gap-2"
              onClick={() => {
                const id = `custom-${Date.now()}`;
                setModules((prev) => [
                  ...prev,
                  { id, title: "自定义板块", visible: true, type: "custom", content: "" }
                ]);
                setActiveTab(id);
              }}
            >
              <Plus size={14} /> 添加自定义板块
            </Button>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Palette size={14} /> 主题色（可自定义切换）
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
                  title={c}
                />
              ))}
              <div className="relative group/pill">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
                  <Palette size={14} className="text-zinc-500" />
                  <span className="text-xs font-semibold text-zinc-700">自定义</span>
                  <div
                    className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
                    style={{ backgroundColor: themeColor }}
                  />
                </div>
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                  title="自定义主题色"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Type size={14} /> 版式调节
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  className="text-xs font-medium text-zinc-500"
                  htmlFor="font-fam"
                >
                  字体
                </label>
                <select
                  id="font-fam"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-medium"
                  value={typography.fontFamily}
                  onChange={(e) =>
                    setTypography((prev) => ({
                      ...prev,
                      fontFamily: e.target.value,
                    }))
                  }
                >
                  <option value="Inter, sans-serif">Inter (通用)</option>
                  <option value="'Roboto', sans-serif">Roboto (机械)</option>
                  <option value="'Outfit', sans-serif">
                    Outfit (现代精美)
                  </option>
                  <option value="'Songti SC', serif">宋体 (正式)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                {/* <div className="flex justify-between">
                  <label
                    className="text-xs font-medium text-zinc-500"
                    htmlFor="line-h"
                  >
                    行距
                  </label>
                  <span className="text-xs text-zinc-400">
                    {typography.lineHeight}
                  </span>
                </div> */}
                <div className="flex justify-between items-center">
                  <label
                    className="text-xs font-medium text-zinc-500"
                    htmlFor="line-h"
                  >
                    行距
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      setTypography((prev) => ({
                        ...prev,
                        lineHeight: parseFloat(Math.max(1, prev.lineHeight - 0.05).toFixed(2)),
                      }))
                    }
                  >
                    <Minus size={14} />
                  </Button>
                  <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                    {typography.lineHeight.toFixed(2)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      setTypography((prev) => ({
                        ...prev,
                        lineHeight: parseFloat(Math.min(2.5, prev.lineHeight + 0.05).toFixed(2)),
                      }))
                    }
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-500">
                  主字号 (px)
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      setTypography((prev) => ({
                        ...prev,
                        fontSize: Math.max(10, prev.fontSize - 0.5),
                      }))
                    }
                  >
                    <Minus size={14} />
                  </Button>
                  <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                    {typography.fontSize.toFixed(1)}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-10 h-10 p-0"
                    onClick={() =>
                      setTypography((prev) => ({
                        ...prev,
                        fontSize: Math.min(24, prev.fontSize + 0.5),
                      }))
                    }
                  >
                    <Plus size={14} />
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Column 2: Editor Pane - Mobile Toggle */}
        <aside className={cn(
          "w-full lg:w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto scrollbar-hide absolute inset-0 z-30 lg:relative lg:block lg:translate-x-0 transition-transform duration-300",
          activeMobileTab === "edit" ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <AnimatePresence mode="wait">
            {activeTab === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">基本信息</h2>
                </header>

                <section className="space-y-6">
                  <div className="flex items-start gap-6">
                    <div className="relative group">
                      <div
                        className="w-24 bg-white border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300 relative"
                        style={{
                          height: `${96 / (resumeData.avatarAspect || 1)}px`,
                          borderRadius: `${resumeData.avatarBorderRadius}px`,
                        }}
                      >
                        {resumeData.avatar ? (
                          <NextImage
                            src={resumeData.avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <User size={32} className="text-zinc-300" />
                        )}
                      </div>
                      <label
                        className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                        title="上传头像"
                      >
                        <Palette size={14} />
                        <input
                          type="file"
                          className="hidden"
                          aria-label="头像上传"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () =>
                                setTempAvatar(reader.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                    <div className="flex-1 space-y-4">
                      <Input
                        placeholder="姓名"
                        value={resumeData.name}
                        onChange={(e) =>
                          updateBasicData("name", e.target.value)
                        }
                        title="姓名"
                      />
                      <Input
                        placeholder="职位/称号"
                        value={resumeData.title}
                        onChange={(e) =>
                          updateBasicData("title", e.target.value)
                        }
                        title="职位标题"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                      <span>头像圆角 (px)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() => {
                          const val = Math.max(0, (resumeData.avatarBorderRadius || 12) - 2);
                          setResumeData((prev) => ({ ...prev, avatarBorderRadius: val }));
                          localStorage.setItem("resume_avatar_radius", val.toString());
                        }}
                      >
                        <Minus size={14} />
                      </Button>
                      <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                        {resumeData.avatarBorderRadius || 12}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() => {
                          const val = Math.min(64, (resumeData.avatarBorderRadius || 12) + 2);
                          setResumeData((prev) => ({ ...prev, avatarBorderRadius: val }));
                          localStorage.setItem("resume_avatar_radius", val.toString());
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Input
                      label="主要电话"
                      placeholder="例如：138-0000-0000"
                      value={resumeData.phone}
                      onChange={(e) => updateBasicData("phone", e.target.value)}
                    />
                    <Input
                      label="电子邮件"
                      placeholder="例如：example@qingjiao.com"
                      value={resumeData.email}
                      onChange={(e) => updateBasicData("email", e.target.value)}
                    />
                    <Input
                      label="所在地"
                      placeholder="例如：广东·江门"
                      value={resumeData.city}
                      onChange={(e) => updateBasicData("city", e.target.value)}
                    />
                  </div>

                  <div className="pt-6 border-t border-zinc-200 space-y-4">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">更多个人详情</h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <Input
                        label="出生日期"
                        placeholder="例如：1998.05"
                        value={resumeData.birthday}
                        onChange={(e) => updateBasicData("birthday", e.target.value)}
                      />
                      <Input
                        label="工作经验"
                        placeholder="例如：3年经验"
                        value={resumeData.experience}
                        onChange={(e) => updateBasicData("experience", e.target.value)}
                      />
                      <Input
                        label="籍贯"
                        placeholder="例如：广东江门"
                        value={resumeData.hometown}
                        onChange={(e) => updateBasicData("hometown", e.target.value)}
                      />
                      <Input
                        label="政治面貌"
                        placeholder="例如：中共党员"
                        value={resumeData.politics}
                        onChange={(e) => updateBasicData("politics", e.target.value)}
                      />
                    </div>
                    <div className="space-y-3">
                      <Input
                        label="GitHub"
                        placeholder="github.com/yourid"
                        value={resumeData.github}
                        onChange={(e) => updateBasicData("github", e.target.value)}
                      />
                      <Input
                        label="个人博客"
                        placeholder="blog.com"
                        value={resumeData.blog}
                        onChange={(e) => updateBasicData("blog", e.target.value)}
                      />
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === "edu" && (
              <motion.div
                key="edu"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <GraduationCap size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">教育背景</h2>
                </header>
                {resumeData.education.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("edu", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title="移除"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label="学校名称"
                      placeholder="例如：五邑大学"
                      value={item.school}
                      onChange={(e) =>
                        updateListItem("edu", item.id, "school", e.target.value)
                      }
                    />
                    <Input
                      label="专业科目"
                      placeholder="例如：通信工程"
                      value={item.major}
                      onChange={(e) =>
                        updateListItem("edu", item.id, "major", e.target.value)
                      }
                    />
                    <Input
                      label="入学起止日期"
                      placeholder="例如：2022 - 2026"
                      value={item.date}
                      onChange={(e) =>
                        updateListItem("edu", item.id, "date", e.target.value)
                      }
                    />
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => addItem("edu")}
                >
                  + 新增教育
                </Button>
              </motion.div>
            )}

            {activeTab === "work" && (
              <motion.div
                key="work"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <Briefcase size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">工作经历</h2>
                </header>
                {resumeData.workExperiences.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("work", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title="移除"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label="公司平台"
                      placeholder="例如：青椒实验室"
                      value={item.company}
                      onChange={(e) =>
                        updateListItem(
                          "work",
                          item.id,
                          "company",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      label="主要角色"
                      placeholder="例如：高级前端开发"
                      value={item.role}
                      onChange={(e) =>
                        updateListItem("work", item.id, "role", e.target.value)
                      }
                    />
                    <Input
                      label="在职期间"
                      placeholder="例如：2020 - 至今"
                      value={item.date}
                      onChange={(e) =>
                        updateListItem("work", item.id, "date", e.target.value)
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">
                        关键成果描述
                      </label>
                      <textarea
                        placeholder="请详细描述您的关键成果..."
                        className="w-full h-32 p-3 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                        value={item.desc}
                        onChange={(e) =>
                          updateListItem("work", item.id, "desc", e.target.value)
                        }
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => addItem("work")}
                >
                  + 新增经历
                </Button>
              </motion.div>
            )}

            {activeTab === "project" && (
              <motion.div
                key="project"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600">
                    <Rocket size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">项目经验</h2>
                </header>
                {resumeData.projects.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("project", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title="移除项目"
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label="项目主题"
                      placeholder="例如：青椒简历编辑器"
                      value={item.name}
                      onChange={(e) =>
                        updateListItem(
                          "project",
                          item.id,
                          "name",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      label="职责分工"
                      placeholder="例如：核心开发"
                      value={item.role}
                      onChange={(e) =>
                        updateListItem(
                          "project",
                          item.id,
                          "role",
                          e.target.value,
                        )
                      }
                    />
                    <Input
                      label="时间段"
                      placeholder="例如：2023.01 - 至今"
                      value={item.date}
                      onChange={(e) =>
                        updateListItem(
                          "project",
                          item.id,
                          "date",
                          e.target.value,
                        )
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-500">
                        项目核心亮点
                      </label>
                      <textarea
                        placeholder="请描述该项目的核心技术亮点..."
                        className="w-full h-32 p-3 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white"
                        value={item.desc}
                        onChange={(e) =>
                          updateListItem(
                            "project",
                            item.id,
                            "desc",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => addItem("project")}
                >
                  + 新增项目
                </Button>
              </motion.div>
            )}

            {activeTab === "skill" && (
              <motion.div
                key="skill"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-300 flex items-center justify-center text-zinc-600">
                    <Type size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">专业技能</h2>
                </header>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-zinc-500">
                    技能清单 (逗号分隔)
                  </label>
                  <textarea
                    className="w-full h-48 p-4 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white leading-relaxed font-mono transition-colors"
                    value={resumeData.skills.join(", ")}
                    onChange={(e) => updateSkills(e.target.value)}
                    title="列表键入"
                  />
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    样式调节
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "dot", label: "标准圆点" },
                      { id: "tag", label: "标签模式" },
                    ].map((style) => (
                      <button
                        key={style.id}
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillStyle: style.id as "dot" | "tag",
                          }))
                        }
                        className={cn(
                          "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                          (typography.skillStyle || "dot") === style.id
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300",
                        )}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {typography.skillStyle === "tag" && (
                  <div className="space-y-4 pt-4 border-t border-zinc-100 animate-in slide-in-from-top-2">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase tracking-widest">
                      <span>标签圆角 (px)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillTagRadius: Math.max(0, (prev.skillTagRadius || 6) - 2),
                          }))
                        }
                      >
                        <Minus size={14} />
                      </Button>
                      <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                        {typography.skillTagRadius || 6}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillTagRadius: Math.min(32, (prev.skillTagRadius || 6) + 2),
                          }))
                        }
                      >
                        <Plus size={14} />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-zinc-500">
                        跟随主题色
                      </span>
                      <button
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillTagUseTheme: !prev.skillTagUseTheme,
                          }))
                        }
                        className={cn(
                          "w-10 h-6 rounded-full transition-colors relative",
                          typography.skillTagUseTheme
                            ? "bg-zinc-900"
                            : "bg-zinc-200",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            typography.skillTagUseTheme ? "left-5" : "left-1",
                          )}
                        />
                      </button>
                    </div>

                    {!typography.skillTagUseTheme && (
                      <div className="relative group/pill animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm transition-all cursor-pointer">
                          <Palette size={14} className="text-zinc-500" />
                          <span className="text-xs font-semibold text-zinc-700">
                            自定义
                          </span>
                          <div
                            className="w-4 h-4 rounded-full border border-black/10 shadow-inner"
                            style={{
                              backgroundColor:
                                typography.skillTagColor || "#71717a",
                            }}
                          />
                        </div>
                        <input
                          type="color"
                          value={typography.skillTagColor || "#71717a"}
                          onChange={(e) =>
                            setTypography((prev) => ({
                              ...prev,
                              skillTagColor: e.target.value,
                            }))
                          }
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          title="自定义标签颜色"
                        />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* 自定义板块编辑器 */}
            {modules.find((m) => m.id === activeTab && m.type === "custom") && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-300 flex items-center justify-center text-zinc-600">
                    <Settings2 size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">自定义内容</h2>
                </header>
                
                <div className="space-y-4">
                  <Input
                    label="板块标题"
                    value={modules.find((m) => m.id === activeTab)?.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setModules((prev) =>
                        prev.map((mod) =>
                          mod.id === activeTab ? { ...mod, title: newTitle } : mod,
                        ),
                      );
                    }}
                  />
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-500">板块内容 (支持换行)</label>
                    <textarea
                      className="w-full h-96 p-4 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white leading-relaxed font-mono"
                      placeholder="在这里输入内容..."
                      value={modules.find((m) => m.id === activeTab)?.content || ""}
                      onChange={(e) => {
                        const newContent = e.target.value;
                        setModules((prev) =>
                          prev.map((mod) =>
                            mod.id === activeTab ? { ...mod, content: newContent } : mod,
                          ),
                        );
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* 第 3 列：预览区 - 在移动端根据 Tab 状态切换可见性 */}
        <section
          className={cn(
            "flex-1 bg-zinc-100 flex flex-col relative overflow-hidden group absolute inset-0 z-20 lg:relative lg:flex lg:translate-x-0 transition-transform duration-300",
            activeMobileTab === "preview" ? "translate-x-0" : "translate-x-full lg:translate-x-0",
          )}
        >
          {/* 右侧悬浮预览工具栏：缩放控制、自适应 */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-200 shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomScale((prev) => Math.min(1.5, prev + 0.1))}
              className="w-10 h-10 hover:bg-zinc-100 rounded-xl"
              title="放大"
            >
              <Plus size={18} />
            </Button>
            <div className="h-10 flex items-center justify-center text-[10px] font-bold text-zinc-500 border-y border-zinc-100">
              {Math.round(zoomScale * 100)}%
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setZoomScale((prev) => Math.max(0.4, prev - 0.1))}
              className="w-10 h-10 hover:bg-zinc-100 rounded-xl"
              title="缩小"
            >
              <Minus size={18} />
            </Button>
            <div className="w-full h-px bg-zinc-100 my-1" />
            <Button
              variant="ghost"
              size="icon"
              onClick={autoFit}
              className="w-10 h-10 hover:bg-zinc-100 rounded-xl text-zinc-500"
              title="自适应宽度"
            >
              <Maximize2 size={18} />
            </Button>
          </div>

          <div
            ref={previewContainerRef}
            className={cn(
              "flex-1 overflow-auto p-12 pb-32 scrollbar-hide bg-zinc-200/50 select-none transition-colors",
              isPanning ? "cursor-grabbing bg-zinc-300/30" : "cursor-grab",
            )}
            onMouseDown={(e) => {
              if (previewContainerRef.current) {
                setIsPanning(true);
                scrollStart.current = {
                  scrollLeft: previewContainerRef.current.scrollLeft,
                  scrollTop: previewContainerRef.current.scrollTop,
                  x: e.clientX,
                  y: e.clientY,
                };
              }
            }}
            onMouseMove={(e) => {
              if (isPanning && previewContainerRef.current) {
                e.preventDefault();
                const x = e.clientX - scrollStart.current.x;
                const y = e.clientY - scrollStart.current.y;
                previewContainerRef.current.scrollLeft =
                  scrollStart.current.scrollLeft - x;
                previewContainerRef.current.scrollTop =
                  scrollStart.current.scrollTop - y;
              }
            }}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
          >
            {/* 居中固定容器：确保内容在缩放小时居中，在放大于溢出时从左侧开始显示 */}
            <div className="min-w-full min-h-full flex justify-center">
              {/* 动态计算宽高的缩放容器，确保滚动条准确 */}
              <div
                className="relative"
                style={{
                  width: `${820 * zoomScale}px`,
                  minHeight: `${(1160 * numPages + (numPages - 1) * 40) * zoomScale}px`,
                  transition: "width 0.2s ease-out, min-height 0.2s ease-out",
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoomScale})`,
                    transformOrigin: "top left",
                    width: "820px",
                  }}
                  className="flex flex-col gap-10"
                >
                  {Array.from({ length: numPages }).map((_, pageIdx) => {
                    const PAGE_H = 1160;
                    const PADDING = 64;
                    const EFFECTIVE_H = PAGE_H - PADDING * 2;

                    return (
                      <motion.div
                        key={pageIdx}
                        className="w-[820px] h-[1160px] bg-white shadow-2xl relative overflow-hidden shrink-0 group/page"
                      >
                        <div
                          className="absolute left-[64px] right-[64px] overflow-hidden pointer-events-none"
                          style={{
                            top: `${PADDING}px`,
                            bottom: `${PADDING}px`,
                          }}
                        >
                          <div
                            className="w-full"
                            style={{
                              transform: `translateY(-${pageIdx * EFFECTIVE_H}px)`,
                              fontFamily: "var(--font-family)",
                              lineHeight: "var(--line-height)",
                              fontSize: `${typography.fontSize}px`,
                            }}
                            ref={pageIdx === 0 ? resumeContentRef : null}
                          >
                            <div
                              className={cn(
                                "flex items-center gap-10 mb-12 transition-none",
                                pageIdx > 0 && "invisible",
                              )}
                            >
                              <div
                                className="w-28 bg-zinc-50 flex items-center justify-center overflow-hidden relative shadow-inner ring-1 ring-zinc-100"
                                style={{
                                  height: `${112 / (resumeData.avatarAspect || 1)}px`,
                                  borderRadius: `${resumeData.avatarBorderRadius}px`,
                                }}
                              >
                                {resumeData.avatar ? (
                                  <NextImage
                                    src={resumeData.avatar}
                                    alt="Avatar"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <User
                                    size={48}
                                    className="text-zinc-200"
                                    style={{ height: "48px" }}
                                  />
                                )}
                              </div>
                              <div className="space-y-2 flex-1 text-zinc-900">
                                <h1 className="text-4xl font-black tracking-tight text-[var(--theme-color)] transition-none">
                                  {resumeData.name || "您的姓名"}
                                </h1>
                                <p className="text-lg text-zinc-500 font-semibold tracking-wide">
                                  {resumeData.title || "求职目标"}
                                </p>
                                <div className="text-[0.84em] text-zinc-400 flex flex-wrap gap-x-5 gap-y-1.5 mt-3.5 font-medium leading-tight">
                                  <span className="text-zinc-600">{resumeData.phone}</span>
                                  <span className="text-zinc-600 underline underline-offset-4 decoration-zinc-100">{resumeData.email}</span>
                                  <span className="text-zinc-600">{resumeData.city}</span>
                                  {resumeData.birthday && <span>| {resumeData.birthday}</span>}
                                  {resumeData.experience && <span>| {resumeData.experience}</span>}
                                  {resumeData.hometown && <span>| {resumeData.hometown}</span>}
                                  {resumeData.politics && <span>| {resumeData.politics}</span>}
                                </div>
                                {(resumeData.github || resumeData.blog) && (
                                  <div className="flex gap-4 mt-2 text-[0.75em] text-zinc-300 font-mono italic">
                                    {resumeData.github && <span>GitHub: {resumeData.github}</span>}
                                    {resumeData.blog && <span>Blog: {resumeData.blog}</span>}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-12">
                              {modules
                                .filter((m) => m.visible && m.id !== "basic")
                                .map((m) => (
                                  <section key={m.id}>
                                    <div className="flex items-center gap-3 mb-6 border-b-2 border-zinc-900/10 pb-2.5">
                                      <div className="w-2 h-6 rounded-sm bg-[var(--theme-color)]" />
                                      <h3 className="text-xl font-bold tracking-tight text-zinc-800 uppercase">
                                        {m.title}
                                      </h3>
                                    </div>
                                    <div className="pl-1 space-y-6">
                                      {m.type === "custom" && (
                                        <div className="text-zinc-600 whitespace-pre-wrap leading-relaxed text-[0.95em]">
                                          {m.content?.toString() || "暂无内容"}
                                        </div>
                                      )}
                                      {m.id === "edu" &&
                                        resumeData.education.map((item) => (
                                          <div
                                            key={item.id}
                                            className="flex justify-between items-baseline"
                                          >
                                            <div className="space-y-0.5">
                                              <div className="font-bold text-zinc-800 text-[1.1em]">
                                                {item.school || "教育中心"}
                                              </div>
                                              <div className="text-zinc-500 font-medium">
                                                {item.major}
                                              </div>
                                            </div>
                                            <div className="text-[0.8em] font-bold text-zinc-400 tabular-nums">
                                              {item.date}
                                            </div>
                                          </div>
                                        ))}
                                      {m.id === "work" &&
                                        resumeData.workExperiences.map(
                                          (item) => (
                                            <div
                                              key={item.id}
                                              className="space-y-2.5"
                                            >
                                              <div className="flex justify-between font-bold items-center">
                                                <span className="text-zinc-800 text-[1.1em]">
                                                  {item.company}
                                                </span>
                                                <span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">
                                                  {item.date}
                                                </span>
                                              </div>
                                              <div className="text-[0.95em] text-[var(--theme-color)] font-bold">
                                                {item.role}
                                              </div>
                                              <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">
                                                {item.desc}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      {m.id === "project" &&
                                        resumeData.projects.map((item) => (
                                          <div
                                            key={item.id}
                                            className="space-y-2.5"
                                          >
                                            <div className="flex justify-between font-bold items-center">
                                              <span className="text-zinc-800 text-[1.1em]">
                                                {item.name}
                                              </span>
                                              <span className="text-[0.8em] font-bold text-zinc-400 tabular-nums">
                                                {item.date}
                                              </span>
                                            </div>
                                            <div className="text-[0.95em] text-zinc-600 font-bold">
                                              {item.role}
                                            </div>
                                            <div className="text-zinc-500 whitespace-pre-wrap leading-relaxed opacity-90">
                                              {item.desc}
                                            </div>
                                          </div>
                                        ))}
                                      {m.id === "skill" && (
                                        <div
                                          className={cn(
                                            "flex flex-wrap leading-relaxed",
                                            typography.skillStyle === "tag"
                                              ? "gap-2"
                                              : "gap-x-6 gap-y-3",
                                          )}
                                        >
                                          {resumeData.skills
                                            .filter((s) => s)
                                            .map((s, idx) => (
                                              <span
                                                key={idx}
                                                className={cn(
                                                  "flex items-center font-medium transition-all",
                                                  typography.skillStyle ===
                                                    "tag"
                                                    ? ""
                                                    : "gap-2 text-zinc-600",
                                                )}
                                                style={
                                                  typography.skillStyle ===
                                                  "tag"
                                                    ? {
                                                        borderRadius: `${typography.skillTagRadius}px`,
                                                        backgroundColor: typography.skillTagUseTheme
                                                          ? "var(--theme-color-5)"
                                                          : `${typography.skillTagColor}10`,
                                                        border: `1px solid ${
                                                          typography.skillTagUseTheme
                                                            ? "var(--theme-color-20)"
                                                            : `${typography.skillTagColor}33`
                                                        }`,
                                                        color: typography.skillTagUseTheme
                                                          ? "var(--theme-color)"
                                                          : typography.skillTagColor,
                                                        padding: "4px 12px",
                                                        fontSize: "0.9em",
                                                      }
                                                    : {}
                                                }
                                              >
                                                {typography.skillStyle !==
                                                  "tag" && (
                                                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] opacity-40 shrink-0" />
                                                )}
                                                {s}
                                              </span>
                                            ))}
                                        </div>
                                      )}
                                    </div>
                                  </section>
                                ))}
                            </div>
                          </div>
                        </div>

                        <div className="absolute bottom-6 right-8 text-[10px] text-zinc-300 font-mono tracking-widest uppercase pointer-events-none">
                          Page {pageIdx + 1} / {numPages}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 移动端底部切换导航栏 */}
        <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-14 bg-zinc-900/90 backdrop-blur-md rounded-2xl flex items-center px-2 gap-1 border border-white/10 shadow-2xl z-[100]">
          <button
            onClick={() => setActiveMobileTab("manage")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-10 rounded-xl transition-all",
              activeMobileTab === "manage" ? "text-white bg-white/10" : "text-zinc-500",
            )}
          >
            <Settings2 size={16} />
            <span className="text-[10px] font-bold">管理</span>
          </button>
          <button
            onClick={() => setActiveMobileTab("edit")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-10 rounded-xl transition-all",
              activeMobileTab === "edit" ? "text-white bg-white/10" : "text-zinc-500",
            )}
          >
            <User size={16} />
            <span className="text-[10px] font-bold">编辑</span>
          </button>
          <button
            onClick={() => setActiveMobileTab("preview")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-20 h-10 rounded-xl transition-all",
              activeMobileTab === "preview" ? "text-white bg-white/10" : "text-zinc-500",
            )}
          >
            <Eye size={16} />
            <span className="text-[10px] font-bold">预览</span>
          </button>
        </div>
      </main>

      {/* Avatar Crop Modal */}
      <AnimatePresence>
        {tempAvatar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <div className="bg-white w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-600">
                    <Palette size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">
                      裁剪设定
                    </h3>
                    <p className="text-sm text-zinc-500">
                      选择合适的比例并调整位置
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTempAvatar(null)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 rounded-full text-zinc-400 transition-colors"
                  title="关闭"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="h-[400px] relative bg-zinc-900">
                <Cropper
                  image={tempAvatar || ""}
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
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    比例预设
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "1:1 正方形", value: 1 },
                      { label: "3:4 证件照", value: 3 / 4 },
                      { label: "4:3 宽屏", value: 4 / 3 },
                    ].map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setAspect(r.value)}
                        className={cn(
                          "py-2 px-3 rounded-lg border text-sm font-medium transition-all",
                          aspect === r.value
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-lg"
                            : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300",
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
                    <input
                      type="range"
                      value={zoom}
                      min={1}
                      max={3}
                      step={0.1}
                      aria-labelledby="Zoom"
                      className="flex-1 h-1.5 bg-zinc-100 rounded-lg appearance-none accent-zinc-900 cursor-pointer"
                      onChange={(e) => setZoom(Number(e.target.value))}
                      title="调节大小"
                    />
                    <Plus size={16} className="text-zinc-400" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-12"
                    onClick={() => setTempAvatar(null)}
                  >
                    返回编辑
                  </Button>
                  <Button
                    variant="primary"
                    className="flex-2 h-12 gap-2 shadow-lg shadow-zinc-900/10"
                    onClick={handleApplyCrop}
                  >
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
