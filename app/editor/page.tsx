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

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "rounded-xl border border-zinc-200 p-3 bg-white shadow-sm",
      className,
    )}
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

  const updateData = (field: keyof ResumeData, value: string) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    const savedAvatar = localStorage.getItem("resume_avatar");
    if (savedAvatar) {
      updateData("avatar", savedAvatar);
    }
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-zinc-50 font-sans text-zinc-900">
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
            <h3 className="text-sm font-semibold mb-3 text-zinc-900">
              模块排序
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
                <span className="text-sm text-zinc-600 flex-1 ml-1">基本信息</span>
                <div className="flex gap-1">
                  <Badge className="bg-zinc-100 text-zinc-400 font-normal">
                    固定
                  </Badge>
                </div>
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
                          aria-label={m.visible ? "隐藏模块" : "显示模块"}
                        >
                          {m.visible ? (
                            <Eye size={14} />
                          ) : (
                            <EyeOff size={14} />
                          )}
                        </button>
                        <button
                          className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                          onClick={() => removeModule(m.id)}
                          title="删除"
                          aria-label="删除模块"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Card>
                  </Reorder.Item>
                ))}
            </Reorder.Group>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900">
              主题色选择
            </h3>
            <div className="flex gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setThemeColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-transform active:scale-95",
                    themeColor === c && "ring-2 ring-zinc-900 ring-offset-2",
                  )}
                  style={{ backgroundColor: c }}
                  title={`Select color ${c}`}
                  aria-label={`选择颜色 ${c}`}
                />
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-900">排版设置</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="font-select"
                  className="text-xs font-medium text-zinc-500"
                >
                  字体选择
                </label>
                <select
                  id="font-select"
                  className="w-full h-9 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none"
                >
                  <option>Inter</option>
                  <option>Roboto</option>
                  <option>Outfit</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label
                    htmlFor="line-height-slider"
                    className="text-xs font-medium text-zinc-500"
                  >
                    行高
                  </label>
                  <span className="text-xs text-zinc-400">1.5</span>
                </div>
                <input
                  id="line-height-slider"
                  type="range"
                  className="w-full accent-zinc-900"
                  aria-label="Line Height"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-zinc-500">
                  基础字号
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    小
                  </Button>
                  <Button size="sm" variant="secondary" className="text-xs">
                    中
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    大
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* Column 2: Form Editor (380px) */}
        <aside className="w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === "basic" ? (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <header className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-white rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 shadow-sm">
                    <User size={20} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">基本信息</h2>
                </header>

                <div className="space-y-8">
                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                      布局选择
                    </h4>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="bg-white"
                        aria-label="Align Left"
                      >
                        <AlignLeft size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Align Center"
                      >
                        <AlignCenter size={18} />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Align Justify"
                      >
                        <AlignJustify size={18} />
                      </Button>
                    </div>
                  </section>

                  <section>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                      个人资料
                    </h4>
                    <div className="flex items-start gap-6">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-zinc-300">
                          {resumeData.avatar ? (
                            <img
                              src={resumeData.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={32} className="text-zinc-300" />
                          )}
                        </div>
                        <label
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer"
                          aria-label="Upload Avatar"
                        >
                          <Palette size={14} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const base64 = reader.result as string;
                                  updateData("avatar", base64);
                                  localStorage.setItem("resume_avatar", base64);
                                };
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
                          onChange={(e) => updateData("name", e.target.value)}
                          aria-label="姓名"
                        />
                        <Input
                          placeholder="求职意向"
                          value={resumeData.title}
                          onChange={(e) => updateData("title", e.target.value)}
                          aria-label="求职意向"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="space-y-4">
                    {[
                      {
                        icon: <GripVertical size={16} />,
                        field: "phone",
                        placeholder: "电话",
                      },
                      {
                        icon: <GripVertical size={16} />,
                        field: "email",
                        placeholder: "电子邮箱",
                      },
                      {
                        icon: <GripVertical size={16} />,
                        field: "city",
                        placeholder: "所在城市",
                      },
                    ].map((item) => (
                      <div key={item.field} className="flex items-center gap-3">
                        <span className="text-zinc-300 mt-1">{item.icon}</span>
                        <Input
                          placeholder={item.placeholder}
                          value={
                            resumeData[item.field as keyof ResumeData] || ""
                          }
                          onChange={(e) =>
                            updateData(
                              item.field as keyof ResumeData,
                              e.target.value,
                            )
                          }
                          aria-label={item.placeholder}
                        />
                        <div className="flex mt-1">
                          <button
                            className="p-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                            aria-label="Toggle Visibility"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="p-1 text-zinc-300 hover:text-red-500 transition-colors"
                            aria-label="Delete Field"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-zinc-300 text-zinc-500 h-9"
                    >
                      + 添加信息
                    </Button>
                  </section>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="other"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-zinc-400"
              >
                <Layout size={40} className="mb-4 opacity-20" />
                <p>编辑区域开发中...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        {/* Column 3: Preview Canvas (flex-1) */}
        <section className="flex-1 bg-zinc-100 flex items-center justify-center p-8 overflow-auto relative">
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[800px] aspect-[1/1.414] bg-white shadow-2xl ring-1 ring-zinc-900/5 origin-top scale-[0.9] lg:scale-100 transition-transform flex flex-col p-12"
          >
            {/* Live Content for Preview */}
            <div className="flex items-center gap-8 mb-10">
              <div className="w-24 h-24 rounded-lg bg-zinc-50 flex items-center justify-center overflow-hidden">
                {resumeData.avatar ? (
                  <img src={resumeData.avatar} alt="Resume Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-zinc-300" />
                )}
              </div>
              <div className="space-y-2">
                <h1
                  className="text-3xl font-bold tracking-tight"
                  style={{ color: themeColor }}
                >
                  {resumeData.name || "您的姓名"}
                </h1>
                <p className="text-zinc-500 font-medium">
                  {resumeData.title || "您的职称"}
                </p>
                <div className="flex gap-4 text-xs text-zinc-400">
                  {resumeData.phone && <span>{resumeData.phone}</span>}
                  {resumeData.phone && resumeData.email && <span>|</span>}
                  {resumeData.email && <span>{resumeData.email}</span>}
                  {resumeData.email && resumeData.city && <span>|</span>}
                  {resumeData.city && <span>{resumeData.city}</span>}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {modules
                .filter((m) => m.visible && m.id !== "basic")
                .map((m) => (
                  <section key={m.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-1 h-5 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      />
                      <h3 className="text-lg font-bold">{m.title}</h3>
                    </div>
                    <div className="text-sm border-l border-zinc-100 ml-0.5 pl-4 py-1 text-zinc-400 italic">
                      暂无内容，请在左侧编辑...
                    </div>
                  </section>
                ))}
            </div>
          </motion.div>

          {/* Floating Toolbar */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="flex flex-col gap-4 bg-white p-2 rounded-full shadow-lg border border-zinc-200">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Templates"
              >
                <FileText size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Typography"
              >
                <Type size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Layout"
              >
                <Layout size={20} />
              </Button>
              <div className="w-6 h-px bg-zinc-100 mx-auto" />
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Download PDF"
              >
                <DownloadCloud size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Export Code"
              >
                <Code size={20} />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full hover:bg-zinc-100"
                aria-label="Get Help"
              >
                <HelpCircle size={20} />
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
