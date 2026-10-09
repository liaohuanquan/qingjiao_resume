"use client";

import React, { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppLocale, type AppLocale } from "@/app/hooks/useAppLocale";
import {
  DownloadCloud,
  Code,
  User,
  GripVertical,
  Eye,
  Trash2,
  Type,
  Palette,
  EyeOff,
  Briefcase,
  GraduationCap,
  Rocket,
  Settings2,
  Layout,
  Plus,
  Minus,
  X,
  Check,
  Award,
  Target,
  Sparkles,
  History,
  RotateCcw,
  Undo2,
  Redo2,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// 重命名为 NextImage 以避免遮蔽全局 Image 构造函数
import NextImage from "next/image";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ContactItem, ResumeData, TypographyConfig, ModuleItem, ResumeConfig, ResumeSnapshot, ResumeTemplateId } from "@/app/lib/resume";
import { blankResume, parseResumeConfig, templateIds, visibleResumeText } from "@/app/lib/resume-schema";
import { previewTextImport } from "@/app/lib/resume-import";
import { removeResumeModule } from "@/app/lib/resume-edit";
import { downloadFile, downloadRawStorage, readHistory, saveSnapshot } from "@/app/lib/resume-storage";
import { ICON_MAP } from "@/app/lib/contact-icons";
import { resumeModuleColumn } from "@/app/lib/resume-layout";
import { TypographyPanel } from "@/app/components/TypographyPanel";
import { DescriptionEditor } from "@/app/components/DescriptionEditor";
import { EditorPreview } from "@/app/components/EditorPreview";
import { ResumePreview } from "@/app/components/ResumePreview";
import { AIReviewDialog } from "@/app/components/AIReviewDialog";
import { AvatarCropDialog } from "@/app/components/AvatarCropDialog";
import { useFileRead } from "@/app/hooks/useFileRead";
import { Modal } from "@/app/components/Modal";
import { useResumePersistence } from "@/app/hooks/useResumePersistence";
import { useModalFocus } from "@/app/hooks/useModalFocus";
import { useAIRequest } from "@/app/hooks/useAIRequest";
import { aiMessages } from "@/app/lib/ai-prompts";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- 类型定义 ---

type AiOptimizeMode = "polish" | "quantify" | "concise";
type AiAnalyzeMode = "jd_match" | "score";

type AiTarget =
  | { type: "work"; id: string }
  | { type: "project"; id: string }
  | { type: "skills" };

interface AiDraft {
  target: AiTarget;
  sourceText: string;
  result: string;
  context: string;
  sourceSignature: string;
  kind: "optimize" | "generate";
}

const AI_MODE_LABELS: Record<AiOptimizeMode, string> = {
  polish: "润色表达",
  quantify: "成果表达",
  concise: "压缩语气",
};

const EDITOR_COPY = {
  "zh-CN": {
    editorMode: "Editor Mode",
    saving: "保存中",
    saved: "已保存",
    importConfig: "导入简历",
    importTitle: "数据导入",
    importDesc: "支持 JSON 与文本简历",
    importJson: "导入 JSON",
    pasteResumeText: "粘贴简历文本",
    importTextPlaceholder:
      "可粘贴 Markdown、LinkedIn 风格文本或普通简历文本。\n\n示例：\n张三\n前端工程师\n电话：13800000000\n邮箱：demo@example.com\n\n教育背景\n某某大学\n计算机科学 本科\n2020 - 2024\n\n工作经历\n某某科技\n前端工程师\n2024 - 至今\n- 负责后台系统重构\n- 优化首屏加载性能\n\n专业技能\nReact, Next.js, TypeScript",
    applyTextImport: "解析文本",
    importEmptyError: "请先粘贴简历文本。",
    importFailed: "导入失败，请检查内容格式。",
    beforeImportLabel: "导入前",
    aiAnalysis: "AI 分析",
    backupJson: "备份简历",
    versionHistory: "版本历史",
    downloadPdf: "打印简历",
    downloadingPdf: "准备打印",
    download: "打印",
    switchLanguage: "切换语言",
    lang: "EN",
    templateTitle: "简历模板",
    templates: {
      classic: "经典单栏",
      split: "左右分栏",
      tech: "技术模板",
    },
    moduleManager: "模块管理",
    basicInfo: "基本信息",
    fixed: "固定",
    mobileManage: "管理",
    mobileEdit: "编辑",
    mobilePreview: "预览",
    exportTitle: "打印简历",
    exportDesc: "在打印窗口选择保存为 PDF",
    close: "关闭",
    pdfFilename: "建议文件名",
    checkResult: "检查结果",
    noWarnings: "就绪",
    warningEmptyName: "姓名为空，建议补充后再导出。",
    warningEmptyTitle: "求职意向为空，建议补充后再导出。",
    warningNoContact: "没有可见联系方式，建议至少保留电话或邮箱。",
    warningMultiplePages: (pages: number) =>
      `约 ${pages} 页，以打印预览为准`,
    defaultFilename: (name: string) => `青椒简历-${name || "未命名"}`,
    exportPreparing: "正在准备文档...",
    previewNotFound: "未找到预览页面",
    cancel: "取消",
    generating: "准备中",
    confirmExport: "开始打印",
    aiReportTitle: "AI 简历分析",
    aiReportDesc: "支持 JD 匹配优化与简历评分",
    aiAnalysisFailed: "AI 分析失败",
    jdLabel: "招聘 JD",
    jdPlaceholder: "粘贴招聘岗位描述，用于分析匹配度...",
    jdMatch: "JD 匹配",
    resumeScore: "简历评分",
    reportTitle: "分析报告",
    analyzing: "分析中...",
    reportEmpty: "点击 JD 匹配或简历评分后，分析结果会显示在这里。",
    historyTitle: "版本历史",
    historyDesc: "保留最近 10 个本地快照，可随时恢复。",
    saveCurrentVersion: "保存当前版本",
    restoreVersion: "恢复",
    noHistory: "暂无版本快照。",
    currentVersionLabel: "手动保存",
    beforeAiApplyLabel: "AI 应用前",
    versionSaved: "版本已保存",
  },
  "en-US": {
    editorMode: "Editor Mode",
    saving: "Saving",
    saved: "Saved",
    importConfig: "Import config",
    importTitle: "Data import",
    importDesc:
      "Supports JSON config files and Markdown / plain-text resume drafts.",
    importJson: "Import JSON",
    pasteResumeText: "Paste resume text",
    importTextPlaceholder:
      "Paste Markdown, LinkedIn-style text, or a plain resume draft.\n\nExample:\nAlex Chen\nFrontend Engineer\nPhone: 13800000000\nEmail: demo@example.com\n\nEducation\nExample University\nComputer Science, Bachelor\n2020 - 2024\n\nWork Experience\nExample Tech\nFrontend Engineer\n2024 - Present\n- Rebuilt the admin system\n- Improved first-screen performance\n\nSkills\nReact, Next.js, TypeScript",
    applyTextImport: "Parse and import",
    importEmptyError: "Paste resume text first.",
    importFailed: "Import failed. Check the content format.",
    beforeImportLabel: "Before import",
    aiAnalysis: "AI analysis",
    backupJson: "Backup JSON",
    versionHistory: "Version history",
    downloadPdf: "Print resume",
    downloadingPdf: "Preparing print",
    download: "Print",
    switchLanguage: "Switch language",
    lang: "中文",
    templateTitle: "Resume template",
    templates: {
      classic: "Classic",
      split: "Split",
      tech: "Technical",
    },
    moduleManager: "Module manager",
    basicInfo: "Basic info",
    fixed: "Fixed",
    mobileManage: "Manage",
    mobileEdit: "Edit",
    mobilePreview: "Preview",
    exportTitle: "Print resume",
    exportDesc: "Choose Save as PDF in the print dialog",
    close: "Close",
    pdfFilename: "Suggested filename",
    checkResult: "Check result",
    noWarnings: "Ready",
    warningEmptyName: "Name is empty. Add it before exporting.",
    warningEmptyTitle: "Target role is empty. Add it before exporting.",
    warningNoContact: "No visible contact method. Keep at least phone or email.",
    warningMultiplePages: (pages: number) =>
      `About ${pages} pages. Check the print preview.`,
    defaultFilename: (name: string) => `QingJiao-Resume-${name || "Untitled"}`,
    exportPreparing: "Preparing document...",
    previewNotFound: "Preview page not found",
    cancel: "Cancel",
    generating: "Preparing",
    confirmExport: "Print",
    aiReportTitle: "AI resume analysis",
    aiReportDesc: "Supports JD matching and resume scoring",
    aiAnalysisFailed: "AI analysis failed",
    jdLabel: "Job description",
    jdPlaceholder: "Paste a job description to analyze matching...",
    jdMatch: "JD match",
    resumeScore: "Resume score",
    reportTitle: "Analysis report",
    analyzing: "Analyzing...",
    reportEmpty: "Run JD matching or resume scoring to show results here.",
    historyTitle: "Version history",
    historyDesc: "Keeps the latest 10 local snapshots for restore.",
    saveCurrentVersion: "Save current version",
    restoreVersion: "Restore",
    noHistory: "No snapshots yet.",
    currentVersionLabel: "Manual save",
    beforeAiApplyLabel: "Before AI apply",
    versionSaved: "Version saved",
  },
} satisfies Record<AppLocale, {
  editorMode: string;
  saving: string;
  saved: string;
  importConfig: string;
  importTitle: string;
  importDesc: string;
  importJson: string;
  pasteResumeText: string;
  importTextPlaceholder: string;
  applyTextImport: string;
  importEmptyError: string;
  importFailed: string;
  beforeImportLabel: string;
  aiAnalysis: string;
  backupJson: string;
  versionHistory: string;
  downloadPdf: string;
  downloadingPdf: string;
  download: string;
  switchLanguage: string;
  lang: string;
  templateTitle: string;
  templates: Record<ResumeTemplateId, string>;
  moduleManager: string;
  basicInfo: string;
  fixed: string;
  mobileManage: string;
  mobileEdit: string;
  mobilePreview: string;
  exportTitle: string;
  exportDesc: string;
  close: string;
  pdfFilename: string;
  checkResult: string;
  noWarnings: string;
  warningEmptyName: string;
  warningEmptyTitle: string;
  warningNoContact: string;
  warningMultiplePages: (pages: number) => string;
  defaultFilename: (name: string) => string;
  exportPreparing: string;
  previewNotFound: string;
  cancel: string;
  generating: string;
  confirmExport: string;
  aiReportTitle: string;
  aiReportDesc: string;
  aiAnalysisFailed: string;
  jdLabel: string;
  jdPlaceholder: string;
  jdMatch: string;
  resumeScore: string;
  reportTitle: string;
  analyzing: string;
  reportEmpty: string;
  historyTitle: string;
  historyDesc: string;
  saveCurrentVersion: string;
  restoreVersion: string;
  noHistory: string;
  currentVersionLabel: string;
  beforeAiApplyLabel: string;
  versionSaved: string;
}>;

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
  const { locale } = useAppLocale();
  const iconLabel = React.isValidElement(children) && children.type === Minus ? (locale === "en-US" ? "Decrease" : "减小") : React.isValidElement(children) && children.type === Plus ? (locale === "en-US" ? "Increase" : "增大") : undefined;
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
      aria-label={iconLabel}
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

const Card = ({ children, className, onClick, ...props }: CardProps) => (
  <div
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={event => { if (onClick && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); event.currentTarget.click(); } }}
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

const Input = ({ label, id, ...props }: InputProps) => {
  const generatedId = React.useId();
  id = id || generatedId;
  return (
  <div className="space-y-1.5 w-full text-left">
    {label && (
      <label htmlFor={id} className="text-xs font-medium text-zinc-500 pl-1">
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
};

// --- 增强型基础字段组件 ---

const Switch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) => {
  const { locale } = useAppLocale();
  return (
  <div className="flex items-center gap-2">
    <button
      type="button" role="switch" aria-checked={checked} aria-label={label || (locale === "en-US" ? "Visibility" : "显示")}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-9 h-5 rounded-full relative transition-colors duration-200 outline-none flex items-center shrink-0",
        checked ? "bg-zinc-900" : "bg-zinc-200",
      )}
    >
      <div
        className={cn(
          "absolute w-3 h-3 bg-white rounded-full transition-all duration-200",
          checked ? "left-[20px]" : "left-[4px]",
        )}
      />
    </button>
    {label && (
      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter whitespace-nowrap">
        {label}
      </span>
    )}
  </div>
);
};

const ICON_LIST = Object.keys(ICON_MAP);

function IconPicker({
  currentIcon,
  onSelect,
}: {
  currentIcon: string;
  onSelect: (name: string) => void;
}) {
  const { locale } = useAppLocale();
  const local = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const [isOpen, setIsOpen] = useState(false);
  const IconComp = ICON_MAP[currentIcon] || User;
  useModalFocus(isOpen, () => setIsOpen(false), "[data-icon-picker]");

  return (
    <div className="relative">
      <button
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 transition-colors flex items-center justify-center text-zinc-500"
        title={local("选择图标", "Choose icon")}
      >
        <IconComp size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            onClick={() => setIsOpen(false)}
          />
          <div data-icon-picker role="dialog" aria-label={local("选择图标", "Choose icon")} className="absolute top-full left-0 mt-2 p-2 bg-white border border-zinc-200 rounded-xl shadow-2xl z-[70] grid grid-cols-6 gap-1 w-48">
            {ICON_LIST.map((iconName) => {
              const ItemIcon = ICON_MAP[iconName];
              return (
                <button
                  key={iconName}
                  aria-label={iconName}
                  onClick={() => {
                    onSelect(iconName);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "p-2 rounded-lg flex items-center justify-center transition-colors",
                    currentIcon === iconName
                      ? "bg-zinc-900 text-white"
                      : "hover:bg-zinc-100 text-zinc-500",
                  )}
                >
                  <ItemIcon size={14} />
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const SortableContactItem = React.memo(
  ({
    item,
    onUpdate,
    onUpdateIcon,
    onDelete,
    onToggleVisibility,
    onToggleShowLabel,
  }: {
    item: ContactItem;
    onUpdate: (val: string, label?: string) => void;
    onUpdateIcon?: (name: string) => void;
    onDelete: () => void;
    onToggleVisibility: () => void;
    onToggleShowLabel?: () => void;
  }) => {
    const { locale } = useAppLocale();
    const local = (zh: string, en: string) => locale === "en-US" ? en : zh;
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isDragging ? 50 : undefined,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group flex items-start gap-2 p-3 rounded-2xl select-none relative",
          !isDragging && "transition-all duration-300 hover:bg-zinc-50/50",
          isDragging
            ? "bg-white shadow-2xl ring-1 ring-zinc-200 opacity-95 scale-[1.02]"
            : "ring-transparent",
          item.isCustom &&
            !isDragging &&
            "bg-zinc-50/10 border border-dashed border-zinc-200",
        )}
      >
        <button
          {...attributes}
          {...listeners}
          aria-label={local("移动字段", "Move field")}
          className="cursor-grab active:cursor-grabbing p-1.5 text-zinc-300 hover:text-zinc-600 transition-colors shrink-0 mt-0.5"
        >
          <GripVertical size={16} />
        </button>

        <div className="flex-1 space-y-3 min-w-0">
          {/* 第一排：图标、标签与控制按钮 */}
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <IconPicker
                currentIcon={item.iconName || item.type}
                onSelect={(icon) => onUpdateIcon?.(icon)}
              />
              {item.isCustom ? (
                <input
                  className="flex-1 min-w-0 bg-transparent text-xs font-bold text-zinc-600 outline-none border-b border-zinc-100 focus:border-zinc-400 focus:text-zinc-900 transition-all font-mono py-0.5"
                  value={item.label}
                  onChange={(e) => onUpdate(item.value, e.target.value)}
                  aria-label={local("字段名", "Field name")}
                  placeholder={local("字段名", "Field name")}
                />
              ) : (
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-tight ml-1 truncate">
                  {item.label}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity shrink-0">
              {item.isCustom && (
                <Switch
                  checked={item.showLabel || false}
                  onChange={onToggleShowLabel || (() => {})}
                  label={local("显示标签", "Show label")}
                />
              )}
              <button
                onClick={onToggleVisibility}
                className={cn(
                  "p-1.5 rounded-lg transition-colors ml-2",
                  item.isVisible
                    ? "text-zinc-400 hover:bg-zinc-100"
                    : "text-zinc-200 opacity-40",
                )}
              >
                {item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                aria-label={local("删除字段", "Delete field")}
                onClick={onDelete}
                className="p-1.5 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* 第二排：全宽输入框 */}
          <div className="relative min-w-0">
            <input
              className="w-full bg-white border border-zinc-200 rounded-xl h-10 px-4 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all font-medium placeholder:text-zinc-300 min-w-0"
              aria-label={item.label}
              value={item.value}
              onChange={(e) => onUpdate(e.target.value)}
              placeholder={locale === "en-US" ? `Enter ${item.label}` : `请输入${item.label}`}
            />
          </div>
        </div>
      </div>
    );
  },
);

SortableContactItem.displayName = "SortableContactItem";

// --- 主页面组件 ---

function ResumeEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale, toggleLocale } = useAppLocale();
  const copy = EDITOR_COPY[locale];
  const resumeId = searchParams.get("id") || "default-1";

  const [activeTab, setActiveTab] = useState("basic");
  const persistence = useResumePersistence(resumeId, searchParams.has("id"), locale);
  const { config: resumeConfig, setConfig } = persistence;
  const { resumeData, modules, themeColor, typography, templateId } = resumeConfig;
  React.useEffect(() => {
    if (!modules.some(module => module.id === activeTab)) setActiveTab("basic");
  }, [modules, activeTab]);
  React.useEffect(() => {
    const handleUndo = (event: KeyboardEvent) => {
      if (!persistence.ready || !(event.metaKey || event.ctrlKey) || event.altKey) return;
      const target = event.target;
      // Keep native text undo and modal shortcuts in their own controls.
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      const key = event.key.toLowerCase();
      if (key === "z") { event.preventDefault(); if (event.shiftKey) persistence.redo(); else persistence.undo(); }
      else if (key === "y" && !event.shiftKey) { event.preventDefault(); persistence.redo(); }
    };
    window.addEventListener("keydown", handleUndo);
    return () => window.removeEventListener("keydown", handleUndo);
  }, [persistence.ready, persistence.undo, persistence.redo]);
  const updateConfig = useCallback(<K extends keyof ResumeConfig,>(key: K, value: React.SetStateAction<ResumeConfig[K]>) => {
    setConfig(previous => ({ ...previous, [key]: typeof value === "function" ? (value as (old: ResumeConfig[K]) => ResumeConfig[K])(previous[key]) : value }));
  }, [setConfig]);
  const setResumeData = (value: React.SetStateAction<ResumeData>) => updateConfig("resumeData", value);
  const setModules = (value: React.SetStateAction<ModuleItem[]>) => updateConfig("modules", value);
  const setThemeColor = (value: React.SetStateAction<string>) => updateConfig("themeColor", value);
  const setTemplateId = (value: React.SetStateAction<ResumeTemplateId>) => updateConfig("templateId", value);
  const setTypography = (value: React.SetStateAction<TypographyConfig>) => updateConfig("typography", value);
  const [numPages, setNumPages] = useState(1);
  const resumeContentRef = React.useRef<HTMLDivElement>(null);

  const [tempAvatar, setTempAvatar] = useState<{ id: string; image: string } | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const avatarRead = useFileRead();
  const handleAvatarUpload = async (file: File) => {
    setTempAvatar(null);
    setAvatarError("");
    const result = await avatarRead.read(file, "dataURL");
    if (!result?.current()) return;
    if (!result.ok) { setAvatarError(locale === "en-US" ? "Cannot read image" : "图片读取失败"); return; }
    setTempAvatar({ id: crypto.randomUUID(), image: result.text });
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setResumeData((prev) => {
        const oldIndex = prev.contacts.findIndex((i) => i.id === active.id);
        const newIndex = prev.contacts.findIndex((i) => i.id === over.id);
        if (oldIndex < 0 || newIndex < 0) return prev;
        return {
          ...prev,
          contacts: arrayMove(prev.contacts, oldIndex, newIndex),
        };
      });
    }
  };

  const presetColors = ["#10b981", "#3b82f6", "#ef4444", "#f59e0b", "#18181b"];

  const toggleModuleVisibility = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)),
    );
  };

  const removeModule = (id: string) => {
    setConfig(previous => removeResumeModule(previous, id));
  };

  const updateBasicData = (
    field: keyof ResumeData,
    value: string | boolean,
  ) => {
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
    const id = crypto.randomUUID();
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
      skills: value.split(/[,，\n]/).map((s) => s.trim()),
    }));
  };

  const isSaving = persistence.status === "saving" || persistence.status === "unsaved";
  const [isExporting, setIsExporting] = useState(false); // 是否正在准备打印
  const [exportProgress, setExportProgress] = useState<string | null>(null); // 打印准备状态
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFilename, setExportFilename] = useState("");
  const [exportWarnings, setExportWarnings] = useState<string[]>([]);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<{ config: ResumeConfig; unrecognized: string[]; source: string } | null>(null);
  const [printError, setPrintError] = useState<string | null>(null);
  const [isReloadConfirmOpen, setIsReloadConfirmOpen] = useState(false);
  const [reloadError, setReloadError] = useState<string | null>(null);
  // 移动端底部 Tab 激活状态：管理、编辑、预览
  const [activeMobileTab, setActiveMobileTab] = useState<
    "manage" | "edit" | "preview"
  >("edit");
  const openModule = (id: string) => {
    setActiveTab(id);
    setActiveMobileTab("edit");
  };
  React.useEffect(() => {
    const desktop = window.matchMedia("(min-width: 64rem)");
    const moveHiddenFocus = () => {
      if (desktop.matches) return;
      const focused = document.activeElement;
      const oldPanel = focused?.closest<HTMLElement>("[data-editor-panel]");
      if (!oldPanel || getComputedStyle(oldPanel).visibility !== "hidden") return;
      const panel = document.getElementById(`resume-editor-panel-${activeMobileTab}`);
      if (!panel) return;
      const next = Array.from(panel.querySelectorAll<HTMLElement>("input:not(:disabled), textarea:not(:disabled), select:not(:disabled), button:not(:disabled), a[href], [tabindex='0']"))
        .find(element => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
      (next || panel).focus({ preventScroll: true });
    };
    moveHiddenFocus();
    desktop.addEventListener("change", moveHiddenFocus);
    return () => desktop.removeEventListener("change", moveHiddenFocus);
  }, [activeMobileTab, persistence.ready]);
  const { read: readImportFile, cancel: cancelImportRead, pending: importPending } = useFileRead();
  const closeImportDialog = useCallback(() => {
    cancelImportRead();
    setImportPreview(null);
    setImportError(null);
    setIsImportDialogOpen(false);
  }, [cancelImportRead]);
  const printCleanupRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => { printCleanupRef.current?.(); }, []);
  const importInputRef = React.useRef<HTMLInputElement>(null); // JSON 导入隐藏 Input Ref
  const aiRequest = useAIRequest(locale);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiDraft, setAiDraft] = useState<AiDraft | null>(null);
  const [isAiAnalysisOpen, setIsAiAnalysisOpen] = useState(false);
  const [jdText, setJdText] = useState("");
  const [aiAnalysisResult, setAiAnalysisResult] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [versionSnapshots, setVersionSnapshots] = useState<ResumeSnapshot[]>(
    [],
  );
  const [versionNotice, setVersionNotice] = useState<string | null>(null);

  const buildResumeConfig = useCallback(() => resumeConfig, [resumeConfig]);
  const loadVersionSnapshots = useCallback(() => {
    try { setVersionSnapshots(readHistory(resumeId)); }
    catch { setVersionNotice(locale === "en-US" ? "History cannot be read. Download recovery data." : "历史读取失败，可下载原始数据"); }
  }, [resumeId, locale]);
  const saveVersionSnapshot = useCallback((label: string, config = buildResumeConfig()) => {
    try { setVersionSnapshots(saveSnapshot(resumeId, label, config)); setVersionNotice(copy.versionSaved); return true; }
    catch { setVersionNotice(locale === "en-US" ? "Snapshot could not be saved." : "快照保存失败"); return false; }
  }, [resumeId, buildResumeConfig, copy.versionSaved, locale]);
  const restoreVersionSnapshot = (snapshot: ResumeSnapshot) => {
    try {
      const restored = parseResumeConfig(snapshot.config);
      if (!saveVersionSnapshot(locale === "en-US" ? "Before restore" : "恢复前")) return;
      setConfig(restored);
      setVersionNotice(`${copy.restoreVersion}: ${snapshot.label}`);
      setIsHistoryOpen(false);
    } catch { setVersionNotice(locale === "en-US" ? "Invalid snapshot." : "快照格式错误"); }
  };
  React.useEffect(() => { if (persistence.ready) loadVersionSnapshots(); }, [persistence.ready, loadVersionSnapshots]);

  const buildResumeText = () => visibleResumeText(resumeConfig);

  const sourceSignature = (target: AiTarget, kind: "optimize" | "generate" = "optimize") => {
    if (target.type === "skills") return JSON.stringify(resumeData.skills);
    const item = target.type === "work" ? resumeData.workExperiences.find(item => item.id === target.id) : resumeData.projects.find(item => item.id === target.id);
    return kind === "generate" ? JSON.stringify({ item, skills: resumeData.skills }) : JSON.stringify(item ? { description: item.desc } : null);
  };
  const analyzeResumeWithAi = async (mode: AiAnalyzeMode) => {
    if (aiRequest.pending) return;
    const content = buildResumeText();
    if (!content.trim() || (mode === "jd_match" && !jdText.trim())) { setAiError(locale === "en-US" ? "Enter resume content and a job description." : "请填写简历内容或岗位描述"); return; }
    setIsAiAnalyzing(true); setAiError(null); setAiAnalysisResult("");
    try {
      const task = mode === "jd_match" ? "对照岗位描述列出匹配点、缺失信息，以及具体到简历条目的修改建议。评分仅为参考，不推测录用概率。" : "从完整性、事实依据、成果表达和关键词四个维度给出参考评分及具体修改建议，不评价无法看到的排版。";
      const result = await aiRequest.request(aiMessages(task, `${content}\n${mode === "jd_match" ? `岗位描述：\n${jdText}` : ""}`, locale));
      setAiAnalysisResult(result);
    } catch (error) { setAiError(error instanceof Error ? error.message : copy.aiAnalysisFailed); }
    finally { setIsAiAnalyzing(false); }
  };
  const optimizeWithAi = async ({ text, target, context, mode }: { text: string; target: AiTarget; context: string; mode: AiOptimizeMode }) => {
    if (aiRequest.pending) return;
    if (!text.trim()) { setAiError(locale === "en-US" ? "Enter text first." : "请先填写内容"); return; }
    const signature = sourceSignature(target);
    setAiError(null);
    try {
      const tasks: Record<AiOptimizeMode, string> = { polish: "润色表达，保留事实，只返回修改后的正文。", quantify: "强化已有成果的表达，不编造指标或数字；缺少数据时保留保守表述。只返回正文。", concise: "精简为简历短句，保留事实，只返回正文。" };
      const result = await aiRequest.request(aiMessages(tasks[mode], `${context}\n${text}`, locale));
      setAiDraft({ target, sourceText: text, result, context, sourceSignature: signature, kind: "optimize" });
    } catch (error) { setAiError(error instanceof Error ? error.message : copy.aiAnalysisFailed); }
  };
  const generateAiDraft = async ({ target, context, payload }: { target: Extract<AiTarget, { type: "work" | "project" }>; context: string; payload: Record<string, string | string[]> }) => {
    if (aiRequest.pending) return;
    const item = target.type === "work" ? resumeData.workExperiences.find(item => item.id === target.id) : resumeData.projects.find(item => item.id === target.id);
    const sourceText = item?.desc || "";
    if (!sourceText.trim()) { setAiError(locale === "en-US" ? "Describe your actual work before generating a draft." : "请先填写实际职责或成果"); return; }
    const signature = sourceSignature(target, "generate");
    setAiError(null);
    try {
      const result = await aiRequest.request(aiMessages("根据已提供的职责与成果整理 2–4 条简历描述，只返回正文，不补造事实。", JSON.stringify({ ...payload, description: sourceText }), locale));
      setAiDraft({ target, sourceText, result, context, sourceSignature: signature, kind: "generate" });
    } catch (error) { setAiError(error instanceof Error ? error.message : copy.aiAnalysisFailed); }
  };

  const applyAiDraft = () => {
    if (!aiDraft || !aiDraft.result.trim()) return;

    if (sourceSignature(aiDraft.target, aiDraft.kind) !== aiDraft.sourceSignature) { setAiError(locale === "en-US" ? "The original changed. Keep this result and request a new draft." : "原文已变化，请重新生成后应用"); return; }
    if (!saveVersionSnapshot(copy.beforeAiApplyLabel)) { setAiError(locale === "en-US" ? "Snapshot could not be saved." : "快照保存失败，未替换内容"); return; }

    if (aiDraft.target.type === "work") {
      updateListItem("work", aiDraft.target.id, "desc", aiDraft.result);
    } else if (aiDraft.target.type === "project") {
      updateListItem("project", aiDraft.target.id, "desc", aiDraft.result);
    } else {
      updateSkills(aiDraft.result);
    }

    setAiDraft(null);
  };

  const renderAiActions = ({
    text,
    target,
    context,
  }: {
    text: string;
    target: AiTarget;
    context: string;
  }) => (
    <div className="grid grid-cols-3 gap-2">
      {(["polish", "quantify", "concise"] as AiOptimizeMode[]).map((mode) => (
        <Button
          key={mode}
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-[10px] font-bold"
          disabled={aiRequest.pending}
          onClick={() => optimizeWithAi({ text, target, context, mode })}
        >
          <Sparkles size={12} />
          {locale === "en-US" ? ({ polish: "Polish", quantify: "Outcomes", concise: "Shorten" })[mode] : AI_MODE_LABELS[mode]}
        </Button>
      ))}
    </div>
  );

  const renderGenerateButton = ({
    target,
    context,
    payload,
  }: {
    target: Extract<AiTarget, { type: "work" | "project" }>;
    context: string;
    payload: Record<string, string | string[]>;
  }) => (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="w-full gap-2 text-xs font-bold"
      disabled={aiRequest.pending}
      onClick={() => generateAiDraft({ target, context, payload })}
    >
      <Sparkles size={14} /> {local("AI 生成初稿", "Generate draft")}
    </Button>
  );

  const getExportWarnings = () => {
    const warnings: string[] = [];
    if (!resumeData.name.trim()) warnings.push(copy.warningEmptyName);
    if (!resumeData.title.trim())
      warnings.push(copy.warningEmptyTitle);
    if (
      resumeData.contacts.filter((item) => item.isVisible && item.value)
        .length === 0
    ) {
      warnings.push(copy.warningNoContact);
    }
    if (numPages > 1) {
      warnings.push(copy.warningMultiplePages(numPages));
    }
    return warnings;
  };

  const openExportDialog = () => {
    setExportFilename(copy.defaultFilename(resumeData.name));
    setExportWarnings(getExportWarnings());
    setIsExportDialogOpen(true);
  };

  const exportToPdf = async () => {
    setIsExporting(true); setPrintError(null); setExportProgress(copy.exportPreparing);
    printCleanupRef.current?.();
    const originalTitle = document.title;
    const restoreTitle = () => { document.title = originalTitle; window.removeEventListener("afterprint", restoreTitle); printCleanupRef.current = null; };
    try {
      const root = resumeContentRef.current;
      if (!root) throw new Error(copy.previewNotFound);
      await document.fonts.ready;
      await Promise.all([...root.querySelectorAll("img")].map(image => image.decode()));
      if (!root.isConnected || resumeContentRef.current !== root) return;
      document.title = exportFilename.trim().replace(/[\\/:*?"<>|]/g, "-") || copy.defaultFilename(resumeData.name);
      printCleanupRef.current = restoreTitle;
      window.addEventListener("afterprint", restoreTitle, { once: true });
      window.print();
      setIsExportDialogOpen(false);
    } catch { restoreTitle(); setPrintError(locale === "en-US" ? "Unable to print. Check the image and try again." : "打印准备失败，请检查图片后重试"); }
    finally { setIsExporting(false); setExportProgress(null); }
  };

  const exportToJson = () => downloadFile(resumeConfig, `resume-${resumeData.name || "config"}.json`);
  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setImportPreview(null);
    setImportError(null);
    const result = await readImportFile(file);
    if (!result?.current()) return;
    if (!result.ok) { setImportError(copy.importFailed); return; }
    try { setImportPreview({ config: parseResumeConfig(JSON.parse(result.text)), unrecognized: [], source: file.name }); }
    catch { setImportError(copy.importFailed); }
  };
  const applyTextImport = () => {
    cancelImportRead();
    if (importPreview) {
      try {
        const config = parseResumeConfig(importPreview.config);
        if (!saveVersionSnapshot(copy.beforeImportLabel)) { setImportError(locale === "en-US" ? "Save a snapshot before replacing content." : "快照保存失败，未替换内容"); return; }
        setConfig(config); setImportText(""); closeImportDialog();
      } catch { setImportError(copy.importFailed); }
      return;
    }
    if (!importText.trim()) { setImportError(copy.importEmptyError); return; }
    try {
      const parsed = previewTextImport(importText);
      setImportPreview({ config: parseResumeConfig({ ...resumeConfig, resumeData: parsed.data, modules: blankResume(locale).modules }), unrecognized: parsed.unrecognized, source: locale === "en-US" ? "Text" : "文本" });
      setImportError(null);
    } catch { setImportPreview(null); setImportError(copy.importFailed); }
  };
  const closeModal = useCallback(() => {
    if (aiDraft) setAiDraft(null);
    else if (isAiAnalysisOpen) { aiRequest.cancel(); setIsAiAnalysisOpen(false); }
    else if (isExportDialogOpen && !isExporting) setIsExportDialogOpen(false);
    else if (isHistoryOpen) setIsHistoryOpen(false);
    else if (isImportDialogOpen) closeImportDialog();
  }, [aiDraft, isAiAnalysisOpen, isExportDialogOpen, isExporting, isHistoryOpen, isImportDialogOpen, aiRequest.cancel, closeImportDialog]);
  useModalFocus(Boolean(isAiAnalysisOpen || isExportDialogOpen || isHistoryOpen || isImportDialogOpen), closeModal, "[data-editor-modal]");
  const leaveEditor = () => { if (persistence.flush()) router.push("/dashboard"); };
  const local = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const renderModulePosition = (module: ModuleItem | undefined) => templateId === "split" && module ?
    <label className="flex w-full items-center justify-between gap-2 border-t border-zinc-100 pt-2 text-xs text-zinc-500"
      onClick={event => event.stopPropagation()} onPointerDown={event => event.stopPropagation()}>
      {local("模块位置", "Position")}
      <select aria-label={`${module.title} ${local("位置", "position")}`} value={resumeModuleColumn(module)}
        onChange={event => { const column = event.target.value as "main" | "sidebar"; setModules(previous => previous.map(item => item.id === module.id ? { ...item, column } : item)); }}
        className="rounded-lg border border-zinc-200 bg-white px-2 py-1">
        <option value="sidebar">{local("侧栏", "Sidebar")}</option><option value="main">{local("正文", "Main")}</option>
      </select>
    </label> : null;
  if (persistence.error || !persistence.ready) return <main className="min-h-screen flex flex-col items-center justify-center gap-4 p-8">
    <p role="status">{persistence.error === "missing" ? local("简历不存在", "Resume not found") : persistence.error ? local("数据读取失败", "Unable to read saved data") : local("加载中", "Loading")}</p>
    {persistence.error && <><button onClick={persistence.reload}>{local("重试", "Retry")}</button><button onClick={() => { try { downloadRawStorage(); } catch { /* Storage itself is unavailable. */ } }}>{local("原始备份", "Recovery data")}</button><button onClick={() => router.push("/dashboard")}>{local("返回列表", "Resume list")}</button></>}
  </main>;

  return (
    <div
      className="resume-editor h-screen w-screen overflow-hidden flex flex-col bg-zinc-50 font-sans text-zinc-900"
      /* 注入全局 CSS 变量以控制动态样式 */
      style={
        {
          "--theme-color": themeColor,
          "--theme-color-5": `${themeColor}0d`, // 5% opacity in hex
          "--theme-color-20": `${themeColor}33`, // 20% opacity in hex
        } as React.CSSProperties
      }
    >
      {/* Head */}
      <header className="min-h-[60px] shrink-0 flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6 bg-white border-b border-zinc-200 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" aria-label={local("撤销", "Undo")} title={local("撤销", "Undo")}
            disabled={!persistence.canUndo} onClick={persistence.undo}><Undo2 size={16} /></Button>
          <Button variant="outline" size="sm" aria-label={local("重做", "Redo")} title={local("重做", "Redo")}
            disabled={!persistence.canRedo} onClick={persistence.redo}><Redo2 size={16} /></Button>
          <button
            onClick={leaveEditor}
            aria-label={local("返回列表", "Resume list")}
            className="w-8 h-8 overflow-hidden rounded-full shadow-sm hover:scale-105 transition-transform"
          >
            <NextImage
              src="/qingjiao_resume/images/qinfjiao_resume.png"
              alt="Logo"
              width={32}
              height={32}
              className="object-cover"
            />
          </button>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight leading-none mb-0.5">
              青椒简历
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
              {copy.editorMode}
            </span>
          </div>
          <Badge
            className={cn(
              "ml-2 flex items-center gap-2 transition-all duration-300",
              isExporting
                ? "bg-zinc-100 text-zinc-600"
                : isSaving
                  ? "bg-amber-50 text-amber-600"
                  : (persistence.status === "failed" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"),
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
                  isSaving ? "bg-amber-500" : persistence.status === "failed" ? "bg-red-500" : "bg-emerald-500",
                )}
              />
            )}
            <span className="font-mono text-[10px] font-bold tracking-wider uppercase">
              {isExporting
                ? exportProgress
                : ({ unsaved: local("未保存", "Unsaved"), saving: copy.saving, saved: copy.saved, failed: local("保存失败", "Save failed") })[persistence.status]}
            </span>
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="text-xs font-black"
            title={copy.switchLanguage}
            onClick={toggleLocale}
          >
            {copy.lang}
          </Button>
          <div className="flex items-center gap-2 border-l border-zinc-200 pl-4 ml-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold hidden md:flex"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Rocket size={14} /> {copy.importConfig}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold hidden sm:flex"
              onClick={() => setIsAiAnalysisOpen(true)}
            >
              <Target size={14} /> {copy.aiAnalysis}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs font-bold sm:hidden"
              onClick={() => setIsAiAnalysisOpen(true)}
            >
              <Target size={14} /> AI
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              title={copy.importConfig}
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Rocket size={14} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="sm:hidden"
              title={copy.versionHistory}
              onClick={() => {
                loadVersionSnapshots();
                setIsHistoryOpen(true);
              }}
            >
              <History size={14} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold hidden sm:flex"
              onClick={exportToJson}
            >
              <Code size={14} /> {copy.backupJson}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-xs font-bold hidden md:flex"
              onClick={() => {
                loadVersionSnapshots();
                setIsHistoryOpen(true);
              }}
            >
              <History size={14} /> {copy.versionHistory}
            </Button>
            <Button
              size="sm"
              className="gap-2 text-xs font-bold shadow-lg shadow-emerald-900/10"
              onClick={openExportDialog}
              disabled={isExporting}
            >
              <DownloadCloud size={14} />
              <span className="hidden sm:inline">
                {isExporting ? copy.downloadingPdf : copy.downloadPdf}
              </span>
              <span className="sm:hidden">
                {isExporting ? "..." : copy.download}
              </span>
            </Button>
          </div>
        </div>
      </header>

      {(aiError || aiRequest.pending) && <div role="status" className="no-print flex items-center gap-3 px-4 py-2 text-sm"><span>{aiError || local("处理中", "Processing")}</span>{aiRequest.pending && <button onClick={aiRequest.cancel}>{local("取消请求", "Cancel request")}</button>}<button onClick={() => { if (persistence.flush()) router.push("/dashboard/ai"); }}>{local("AI 设置", "AI settings")}</button></div>}
      {persistence.status === "failed" && <div role="alert" className="no-print flex flex-wrap items-center gap-3 bg-red-50 px-4 py-2 text-sm text-red-700">
        <span>{persistence.conflict === "changed" ? local("其他页面已修改", "Changed in another page") : persistence.conflict === "deleted" ? local("简历已在其他页面删除", "Deleted in another page") : local("保存失败，内容仍在当前页面", "Save failed. Keep this page open.")}</span>
        {!persistence.conflict && <button onClick={persistence.flush}>{local("重试", "Retry")}</button>}
        {persistence.conflict === "changed" && <button onClick={() => { setReloadError(null); setIsReloadConfirmOpen(true); }}>{local("读取最新", "Load latest")}</button>}
        <button onClick={() => { const id = persistence.saveCopy(); if (id) router.push(`/editor?id=${id}`); }}>{local("另存副本", "Save a copy")}</button>
        <button onClick={exportToJson}>{local("下载备份", "Download backup")}</button>
        <button onClick={() => { try { downloadRawStorage(); } catch { setVersionNotice(local("备份读取失败", "Cannot read recovery data")); } }}>{local("原始备份", "Recovery data")}</button>
      </div>}
      {isReloadConfirmOpen && <Modal title={local("读取最新", "Load latest")} close={() => setIsReloadConfirmOpen(false)} closeLabel={copy.close}>
        <p className="mb-5 text-sm">{local("将替换当前编辑内容", "This replaces your current edits.")}</p>
        {reloadError && <p role="alert" className="mb-4 text-sm text-red-600">{reloadError}</p>}
        <div className="flex flex-wrap justify-end gap-3">
          <button className="rounded-xl border px-4 py-2 text-sm" onClick={exportToJson}>{local("下载备份", "Download backup")}</button>
          <button className="rounded-xl border px-4 py-2 text-sm" onClick={() => setIsReloadConfirmOpen(false)}>{copy.cancel}</button>
          <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white" onClick={() => { if (persistence.reload()) { setIsReloadConfirmOpen(false); setAiDraft(null); } else setReloadError(local("读取失败，当前内容已保留", "Load failed. Current edits were retained.")); }}>{local("确认替换", "Replace edits")}</button>
        </div>
      </Modal>}
      {versionNotice && !isHistoryOpen && <div role="status" className="no-print px-4 py-2 text-sm">{versionNotice}</div>}
      {/* Main Content */}
      <main className="resume-editor-main flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Column 1: Module Manager - Mobile Toggle */}
        <aside
          id="resume-editor-panel-manage" data-editor-panel tabIndex={-1} aria-label={copy.mobileManage}
          className={cn(
            "w-full lg:w-[280px] bg-white border-r border-zinc-100 p-4 pb-24 lg:pb-4 overflow-y-auto flex flex-col gap-6 scrollbar-hide absolute inset-0 z-40 lg:relative lg:translate-x-0 lg:visible transition-transform duration-300",
            activeMobileTab === "manage"
              ? "translate-x-0 visible"
              : "-translate-x-full invisible",
          )}
        >
          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Layout size={14} /> {copy.templateTitle}
            </h3>
            <div className="space-y-2">
              {templateIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setTemplateId(id)}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    templateId === id
                      ? "border-zinc-900 bg-white shadow-sm"
                      : "border-zinc-200 bg-white/70 hover:border-zinc-300",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-zinc-800">
                      {copy.templates[id]}
                    </span>
                    {templateId === id && (
                      <Check size={14} className="text-emerald-600" />
                    )}
                  </div>

                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Settings2 size={14} /> {copy.moduleManager}
            </h3>
            <div className="space-y-2 mb-2">
              <Card
                className={cn(
                  "flex flex-wrap items-center gap-2 transition-all",
                  activeTab === "basic" &&
                    "border-zinc-900 ring-1 ring-zinc-900/5",
                )}
              >
                <div className="w-4 h-4 rounded-sm border border-zinc-200 flex items-center justify-center bg-zinc-50 ml-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                </div>
                <button type="button" aria-pressed={activeTab === "basic"} onClick={() => openModule("basic")} className="text-sm text-zinc-600 flex-1 ml-1 text-left">
                  {copy.basicInfo}
                </button>
                <Badge className="bg-zinc-100 text-zinc-400 font-normal ml-auto">
                  {copy.fixed}
                </Badge>
                {renderModulePosition(modules.find(module => module.id === "basic"))}
              </Card>
            </div>

            <Reorder.Group
              axis="y"
              values={modules.filter((m) => m.id !== "basic")}
              onReorder={(newModules) =>
                setModules([...modules.filter(module => module.id === "basic"), ...newModules])
              }
              className="space-y-2"
            >
              {modules
                .filter((m) => m.id !== "basic")
                .map((m) => (
                  <Reorder.Item
                    key={m.id}
                    value={m}
                    onClick={() => openModule(m.id)}
                  >
                    <Card
                      className={cn(
                        "flex flex-wrap items-center gap-2 cursor-pointer transition-all",
                        activeTab === m.id &&
                          "border-zinc-900 ring-1 ring-zinc-900/5",
                        !m.visible && "opacity-50",
                      )}
                    >
                      <GripVertical
                        size={16}
                        className="text-zinc-400 cursor-grab active:cursor-grabbing"
                      />
                      <button type="button" aria-pressed={activeTab === m.id} onClick={() => openModule(m.id)} className="text-sm text-zinc-600 flex-1 text-left">
                        {m.title}
                      </button>
                      <div
                        className="flex gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button aria-label={local("上移", "Move up")} disabled={modules.filter(module => module.id !== "basic")[0]?.id === m.id} onClick={() => setModules(previous => {
                          const items = previous.filter(module => module.id !== "basic");
                          const index = items.findIndex(module => module.id === m.id);
                          return [...previous.filter(module => module.id === "basic"), ...arrayMove(items, index, Math.max(0, index - 1))];
                        })} className="p-1 rounded text-zinc-400 disabled:opacity-30">↑</button>
                        <button aria-label={local("下移", "Move down")} disabled={modules.filter(module => module.id !== "basic").slice(-1)[0]?.id === m.id} onClick={() => setModules(previous => {
                          const items = previous.filter(module => module.id !== "basic");
                          const index = items.findIndex(module => module.id === m.id);
                          return [...previous.filter(module => module.id === "basic"), ...arrayMove(items, index, Math.min(items.length - 1, index + 1))];
                        })} className="p-1 rounded text-zinc-400 disabled:opacity-30">↓</button>
                        <button
                          className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                          onClick={() => toggleModuleVisibility(m.id)}
                          title={m.visible ? local("隐藏", "Hide") : local("显示", "Show")}
                        >
                          {m.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button
                          className="p-1 hover:bg-zinc-100 rounded text-zinc-400"
                          onClick={() => removeModule(m.id)}
                          title={local("删除", "Delete")}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {renderModulePosition(m)}
                    </Card>
                  </Reorder.Item>
                ))}
            </Reorder.Group>

            <select
              aria-label={local("添加模块", "Add section")}
              className="w-full mt-4 p-2 text-sm rounded-lg border border-dashed border-zinc-300 bg-white"
              value=""
              onChange={event => {
                const choice = event.target.value;
                if (!choice) return;
                const module = choice === "custom"
                  ? { id: `custom-${crypto.randomUUID()}`, title: local("自定义模块", "Custom section"), visible: true, type: "custom" as const, content: "" }
                  : blankResume(locale).modules.find(item => item.id === choice);
                if (!module) return;
                setModules(previous => previous.some(item => item.id === module.id) ? previous : [...previous, module]);
                openModule(module.id);
              }}
            >
              <option value="" disabled>{local("添加模块", "Add section")}</option>
              {blankResume(locale).modules.filter(module => module.id !== "basic" && !modules.some(item => item.id === module.id)).map(module =>
                <option key={module.id} value={module.id}>{module.title}</option>)}
              <option value="custom">{local("自定义模块", "Custom section")}</option>
            </select>
          </section>

          <section>
            <h3 className="text-sm font-semibold mb-3 text-zinc-900 flex items-center gap-2">
              <Palette size={14} /> {local("主题色", "Theme color")}
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
                  <span className="text-xs font-semibold text-zinc-700">
                    {local("自定义", "Custom")}
                  </span>
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
                  title={local("自定义主题色", "Custom theme color")}
                />
              </div>
            </div>
          </section>

          <TypographyPanel value={typography} onChange={setTypography} />
        </aside>

        {/* Column 2: Editor Pane - Mobile Toggle */}
        <aside
          id="resume-editor-panel-edit" data-editor-panel tabIndex={-1} aria-label={copy.mobileEdit}
          className={cn(
            "w-full lg:w-[380px] bg-zinc-50/50 border-r border-zinc-200 p-6 pb-24 lg:pb-6 overflow-y-auto overflow-x-hidden scrollbar-hide absolute inset-0 z-30 lg:relative lg:block lg:translate-x-0 lg:visible transition-transform duration-300",
            activeMobileTab === "edit"
              ? "translate-x-0 visible"
              : "-translate-x-full invisible",
          )}
        >
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
                  <h2 className="text-xl font-bold tracking-tight">{local("基本信息", "Basic info")}</h2>
                </header>

                <section className="space-y-6">
                  {avatarError && <p role="alert" className="text-sm text-red-600">{avatarError}</p>}
                  {avatarRead.pending && <div role="status" className="flex gap-3 text-sm"><span>{local("读取中", "Reading")}</span><button type="button" onClick={avatarRead.cancel}>{copy.cancel}</button></div>}
                  <div className="flex items-start gap-6">
                    <div>
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
                              alt={local("头像", "Avatar")}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <User size={32} className="text-zinc-300" />
                          )}
                        </div>
                        <label
                          className="absolute -bottom-2 -right-2 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-transform cursor-pointer focus-within:ring-2 focus-within:ring-emerald-500"
                          title={local("上传头像", "Upload avatar")}
                        >
                          <Palette size={14} />
                          <input
                            type="file"
                            className="sr-only"
                            aria-label={local("头像上传", "Upload avatar")}
                            accept="image/*"
                            onChange={event => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) void handleAvatarUpload(file);
                            }}
                          />
                        </label>
                      </div>
                      {resumeData.avatar && <button type="button" onClick={() => { avatarRead.cancel(); setTempAvatar(null); setAvatarError(""); setResumeData(previous => ({ ...previous, avatar: "" })); }} className="mt-3 text-xs text-red-600">{local("删除头像", "Remove avatar")}</button>}
                    </div>
                    <div className="flex-1 space-y-5">
                      <div className="flex items-center gap-3">
                        <Input
                          aria-label={local("姓名", "Name")}
                          placeholder={local("姓名", "Name")}
                          value={resumeData.name}
                          onChange={(e) =>
                            updateBasicData("name", e.target.value)
                          }
                        />
                        <button
                          aria-label={local("显示姓名", "Show name")}
                          aria-pressed={resumeData.nameVisible}
                          onClick={() =>
                            updateBasicData(
                              "nameVisible",
                              !resumeData.nameVisible,
                            )
                          }
                          className={cn(
                            "mt-6 p-2 rounded-lg transition-colors",
                            resumeData.nameVisible
                              ? "text-zinc-400 hover:bg-zinc-100"
                              : "text-zinc-200",
                          )}
                        >
                          {resumeData.nameVisible ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          aria-label={local("求职意向", "Target role")}
                          placeholder={local("求职意向", "Target role")}
                          value={resumeData.title}
                          onChange={(e) =>
                            updateBasicData("title", e.target.value)
                          }
                        />
                        <button
                          aria-label={local("显示意向", "Show target role")}
                          aria-pressed={resumeData.titleVisible}
                          onClick={() =>
                            updateBasicData(
                              "titleVisible",
                              !resumeData.titleVisible,
                            )
                          }
                          className={cn(
                            "mt-6 p-2 rounded-lg transition-colors",
                            resumeData.titleVisible
                              ? "text-zinc-400 hover:bg-zinc-100"
                              : "text-zinc-200",
                          )}
                        >
                          {resumeData.titleVisible ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-zinc-100">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest pl-1">
                      {local("联系信息", "Contacts")}
                    </h3>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={resumeData.contacts}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {resumeData.contacts.map((item) => (
                            <SortableContactItem
                              key={item.id}
                              item={item}
                              onUpdate={(val, lab) => {
                                setResumeData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((c) =>
                                    c.id === item.id
                                      ? {
                                          ...c,
                                          value: val,
                                          label: lab ?? c.label,
                                        }
                                      : c,
                                  ),
                                }));
                              }}
                              onDelete={() => {
                                setResumeData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.filter(
                                    (c) => c.id !== item.id,
                                  ),
                                }));
                              }}
                              onToggleVisibility={() => {
                                setResumeData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((c) =>
                                    c.id === item.id
                                      ? { ...c, isVisible: !c.isVisible }
                                      : c,
                                  ),
                                }));
                              }}
                              onToggleShowLabel={() => {
                                setResumeData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((c) =>
                                    c.id === item.id
                                      ? { ...c, showLabel: !c.showLabel }
                                      : c,
                                  ),
                                }));
                              }}
                              onUpdateIcon={(icon) => {
                                setResumeData((prev) => ({
                                  ...prev,
                                  contacts: prev.contacts.map((c) =>
                                    c.id === item.id
                                      ? { ...c, iconName: icon }
                                      : c,
                                  ),
                                }));
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <Button
                      onClick={() => {
                        const id = `contact-${crypto.randomUUID()}`;
                        setResumeData((prev) => ({
                          ...prev,
                          contacts: [
                            ...prev.contacts,
                            {
                              id,
                              type: "custom",
                              iconName: "custom",
                              label: local("自定义", "Custom"),
                              value: "",
                              isVisible: true,
                              isCustom: true,
                              showLabel: true,
                            },
                          ],
                        }));
                      }}
                      className="w-full bg-zinc-900 text-white flex items-center gap-2 mt-4"
                    >
                      <Plus size={16} /> {local("新增字段", "Add field")}
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-zinc-200">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1 mb-4">
                      {local("头像样式", "Avatar")}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-medium text-zinc-500">
                        <span>{local("头像圆角 (px)", "Avatar radius (px)")}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-10 h-10 p-0"
                          onClick={() => {
                            const val = Math.max(
                              0,
                              (resumeData.avatarBorderRadius ?? 12) - 2,
                            );
                            setResumeData((prev) => ({
                              ...prev,
                              avatarBorderRadius: val,
                            }));
                          }}
                        >
                          <Minus size={14} />
                        </Button>
                        <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                          {resumeData.avatarBorderRadius ?? 12}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-10 h-10 p-0"
                          onClick={() => {
                            const val = Math.min(
                              64,
                              (resumeData.avatarBorderRadius ?? 12) + 2,
                            );
                            setResumeData((prev) => ({
                              ...prev,
                              avatarBorderRadius: val,
                            }));
                          }}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
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
                  <h2 className="text-xl font-bold tracking-tight">{local("教育背景", "Education")}</h2>
                </header>
                {resumeData.education.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("edu", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title={local("移除", "Remove")}
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label={local("学校名称", "School")}
                      placeholder={local("例如：五邑大学", "University")}
                      value={item.school}
                      onChange={(e) =>
                        updateListItem("edu", item.id, "school", e.target.value)
                      }
                    />
                    <Input
                      label={local("专业科目", "Major")}
                      placeholder={local("例如：通信工程", "Major")}
                      value={item.major}
                      onChange={(e) =>
                        updateListItem("edu", item.id, "major", e.target.value)
                      }
                    />
                    <Input
                      label={local("就读时间", "Dates")}
                      placeholder={local("例如：2022 - 2026", "2022 - 2026")}
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
                  {local("+ 新增教育", "Add education")}
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
                  <h2 className="text-xl font-bold tracking-tight">{local("工作经历", "Work experience")}</h2>
                </header>
                {resumeData.workExperiences.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("work", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title={local("移除", "Remove")}
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label={local("公司名称", "Company")}
                      placeholder={local("例如：青椒实验室", "Company")}
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
                      label={local("职位", "Role")}
                      placeholder={local("例如：高级前端开发", "Role")}
                      value={item.role}
                      onChange={(e) =>
                        updateListItem("work", item.id, "role", e.target.value)
                      }
                    />
                    <Input
                      label={local("在职期间", "Dates")}
                      placeholder={local("例如：2020 - 至今", "2020 - Present")}
                      value={item.date}
                      onChange={(e) =>
                        updateListItem("work", item.id, "date", e.target.value)
                      }
                    />
                    <div className="space-y-1.5">
                      <DescriptionEditor id={`work-description-${item.id}`} label={local("工作成果", "Responsibilities and outcomes")}
                        value={item.desc} onChange={value => updateListItem("work", item.id, "desc", value)} />
                      {renderAiActions({
                        text: item.desc,
                        target: { type: "work", id: item.id },
                        context: local("工作成果", "Work outcomes"),
                      })}
                      {renderGenerateButton({
                        target: { type: "work", id: item.id },
                        context: local("工作经历", "Work experience"),
                        payload: {
                          type: "work",
                          company: item.company,
                          role: item.role,
                          date: item.date,
                          skills: resumeData.skills,
                        },
                      })}
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => addItem("work")}
                >
                  {local("+ 新增经历", "Add experience")}
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
                  <h2 className="text-xl font-bold tracking-tight">{local("项目经验", "Projects")}</h2>
                </header>
                {resumeData.projects.map((item) => (
                  <Card
                    key={item.id}
                    className="relative group p-4 border-dashed border-zinc-200 space-y-3"
                  >
                    <button
                      onClick={() => deleteItem("project", item.id)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-50 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity border border-red-100 shadow-sm z-10"
                      title={local("移除项目", "Remove project")}
                    >
                      <Trash2 size={12} />
                    </button>
                    <Input
                      label={local("项目名称", "Project name")}
                      placeholder={local("例如：青椒简历编辑器", "Project name")}
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
                      label={local("职责", "Role")}
                      placeholder={local("例如：核心开发", "Role")}
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
                      label={local("项目时间", "Dates")}
                      placeholder={local("例如：2023.01 - 至今", "2023.01 - Present")}
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
                    <Input
                      label={local("项目链接", "Project link")}
                      type="url"
                      value={item.link || ""}
                      onChange={event => updateListItem("project", item.id, "link", event.target.value)}
                    />
                    <div className="space-y-1.5">
                      <DescriptionEditor id={`project-description-${item.id}`} label={local("项目成果", "Project outcomes")}
                        value={item.desc} onChange={value => updateListItem("project", item.id, "desc", value)} />
                      {renderAiActions({
                        text: item.desc,
                        target: { type: "project", id: item.id },
                        context: local("项目成果", "Project outcomes"),
                      })}
                      {renderGenerateButton({
                        target: { type: "project", id: item.id },
                        context: local("项目经验", "Projects"),
                        payload: {
                          type: "project",
                          projectName: item.name,
                          role: item.role,
                          date: item.date,
                          skills: resumeData.skills,
                        },
                      })}
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => addItem("project")}
                >
                  {local("+ 新增项目", "Add project")}
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
                  <h2 className="text-xl font-bold tracking-tight">{local("专业技能", "Skills")}</h2>
                </header>
                <div className="space-y-3">
                  <label htmlFor="resume-skills" className="text-xs font-medium text-zinc-500">
                    {local("技能清单 (逗号分隔)", "Skills (comma separated)")}
                  </label>
                  <textarea id="resume-skills"
                    className="w-full h-48 p-4 text-sm border border-zinc-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-zinc-400 bg-white leading-relaxed font-mono transition-colors"
                    value={resumeData.skills.join(", ")}
                    onChange={(e) => updateSkills(e.target.value)}
                    title={local("列表键入", "Skills")}
                  />
                  {renderAiActions({
                    text: resumeData.skills.join(", "),
                    target: { type: "skills" },
                    context: local("专业技能，结果使用逗号分隔", "Skills; return comma-separated text"),
                  })}
                </div>

                <div className="space-y-3 pt-4 border-t border-zinc-100">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    {local("样式", "Style")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "dot", label: local("圆点", "Bullets") },
                      { id: "tag", label: local("标签", "Tags") },
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
                      <span>{local("标签圆角 (px)", "Tag radius (px)")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillTagRadius: Math.max(
                              0,
                              (prev.skillTagRadius ?? 6) - 2,
                            ),
                          }))
                        }
                      >
                        <Minus size={14} />
                      </Button>
                      <div className="flex-1 h-10 bg-zinc-50 border border-zinc-100 rounded-lg flex items-center justify-center font-mono text-sm">
                        {typography.skillTagRadius ?? 6}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-10 h-10 p-0"
                        onClick={() =>
                          setTypography((prev) => ({
                            ...prev,
                            skillTagRadius: Math.min(
                              32,
                              (prev.skillTagRadius ?? 6) + 2,
                            ),
                          }))
                        }
                      >
                        <Plus size={14} />
                      </Button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs font-semibold text-zinc-500">
                        {local("跟随主题色", "Use theme color")}
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
                            {local("自定义", "Custom")}
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
                          title={local("自定义标签颜色", "Custom tag color")}
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
                  <h2 className="text-xl font-bold tracking-tight">
                    {local("自定义内容", "Custom section")}
                  </h2>
                </header>

                <div className="space-y-4">
                  <Input
                    label={local("模块名称", "Section title")}
                    value={modules.find((m) => m.id === activeTab)?.title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setModules((prev) =>
                        prev.map((mod) =>
                          mod.id === activeTab
                            ? { ...mod, title: newTitle }
                            : mod,
                        ),
                      );
                    }}
                  />

                  <div className="space-y-1.5">
                    <DescriptionEditor id={`section-content-${activeTab}`} label={local("模块内容", "Section content")} rows={12}
                      value={modules.find(module => module.id === activeTab)?.content || ""}
                      onChange={content => setModules(previous => previous.map(module => module.id === activeTab ? { ...module, content } : module))} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>

        <EditorPreview ref={resumeContentRef} config={resumeConfig} active={activeMobileTab === "preview"} onPagesChange={setNumPages} />
        {/* 移动端底部切换导航栏 */}
        <nav aria-label={local("编辑视图", "Editor views")} className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 h-14 bg-zinc-900/90 backdrop-blur-md rounded-2xl flex items-center px-2 gap-1 border border-white/10 shadow-2xl z-[100]">
          <button type="button" aria-pressed={activeMobileTab === "manage"} aria-controls="resume-editor-panel-manage"
            onClick={() => setActiveMobileTab("manage")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-10 rounded-xl transition-all",
              activeMobileTab === "manage"
                ? "text-white bg-white/10"
                : "text-zinc-500",
            )}
          >
            <Settings2 size={16} />
            <span className="text-[10px] font-bold">{copy.mobileManage}</span>
          </button>
          <button type="button" aria-pressed={activeMobileTab === "edit"} aria-controls="resume-editor-panel-edit"
            onClick={() => setActiveMobileTab("edit")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-16 h-10 rounded-xl transition-all",
              activeMobileTab === "edit"
                ? "text-white bg-white/10"
                : "text-zinc-500",
            )}
          >
            <User size={16} />
            <span className="text-[10px] font-bold">{copy.mobileEdit}</span>
          </button>
          <button type="button" aria-pressed={activeMobileTab === "preview"} aria-controls="resume-editor-panel-preview"
            onClick={() => setActiveMobileTab("preview")}
            className={cn(
              "flex flex-col items-center justify-center gap-1 w-20 h-10 rounded-xl transition-all",
              activeMobileTab === "preview"
                ? "text-white bg-white/10"
                : "text-zinc-500",
            )}
          >
            <Eye size={16} />
            <span className="text-[10px] font-bold">{copy.mobilePreview}</span>
          </button>
        </nav>
      </main>

      {/* 数据导入弹窗 */}
      <AnimatePresence>
        {isImportDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-editor-modal role="dialog" aria-modal="true" aria-label={copy.importTitle} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 p-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {copy.importTitle}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400">
                    {copy.importDesc}
                  </p>
                </div>
                <button
                  onClick={closeImportDialog}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  title={copy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                {importPending && <p role="status" className="text-sm">{local("读取中", "Reading")}</p>}
                <Button
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={() => importInputRef.current?.click()}
                >
                  <Code size={16} />
                  {copy.importJson}
                </Button>
                <input
                  type="file"
                  ref={importInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleImportJson}
                />

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {copy.pasteResumeText}
                  </label>
                  <textarea
                    aria-label={copy.pasteResumeText}
                    className="h-80 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 outline-none transition-colors focus:border-zinc-400"
                    placeholder={copy.importTextPlaceholder}
                    value={importText}
                    onChange={(event) => {
                      cancelImportRead();
                      setImportText(event.target.value);
                      setImportPreview(null);
                      setImportError(null);
                    }}
                  />
                </div>

                {importPreview && <div className="space-y-3"><p className="text-sm font-bold">{local("导入预览", "Import preview")}: {importPreview.source}</p><div className="max-h-72 overflow-auto rounded-xl border"><ResumePreview config={importPreview.config} /></div>{importPreview.unrecognized.length > 0 && <div><p>{local("未识别内容", "Unrecognized content")}</p><pre className="whitespace-pre-wrap text-sm">{importPreview.unrecognized.join("\n")}</pre></div>}<button onClick={() => { cancelImportRead(); setImportPreview(null); setImportError(null); }}>{local("重新解析", "Parse again")}</button></div>}
                {importError && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                    {importError}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-100 p-6">
                <Button
                  variant="secondary"
                  className="h-11"
                  onClick={closeImportDialog}
                >
                  {copy.cancel}
                </Button>
                <Button className="h-11 gap-2" disabled={importPending} onClick={applyTextImport}>
                  <Rocket size={16} />
                  {importPreview ? local("确认替换", "Replace content") : local("解析文本", "Parse text")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 版本历史弹窗 */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-editor-modal role="dialog" aria-modal="true" aria-label={copy.historyTitle} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 p-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {copy.historyTitle}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400">
                    {copy.historyDesc}
                  </p>
                </div>
                <button
                  onClick={() => setIsHistoryOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  title={copy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    className="h-11 gap-2"
                    onClick={() =>
                      saveVersionSnapshot(copy.currentVersionLabel)
                    }
                  >
                    <History size={16} />
                    {copy.saveCurrentVersion}
                  </Button>
                  {versionNotice && (
                    <span className="text-xs font-bold text-emerald-600">
                      {versionNotice}
                    </span>
                  )}
                </div>

                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                  {versionSnapshots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-center text-sm font-medium text-zinc-400">
                      {copy.noHistory}
                    </div>
                  ) : (
                    versionSnapshots.map((snapshot) => (
                      <div
                        key={snapshot.id}
                        className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="text-sm font-bold text-zinc-800">
                            {snapshot.label}
                          </div>
                          <div className="mt-1 text-xs font-medium text-zinc-400">
                            {new Date(snapshot.createdAt).toLocaleString(
                              locale === "en-US" ? "en-US" : "zh-CN",
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-xs font-bold"
                          onClick={() => restoreVersionSnapshot(snapshot)}
                        >
                          <RotateCcw size={14} />
                          {copy.restoreVersion}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Check Modal */}
      <AnimatePresence>
        {isExportDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-editor-modal role="dialog" aria-modal="true" aria-label={copy.exportTitle} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 p-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">
                    {copy.exportTitle}
                  </h3>
                  <p className="text-xs font-medium text-zinc-400">
                    {copy.exportDesc}
                  </p>
                </div>
                <button
                  disabled={isExporting}
                  onClick={() => setIsExportDialogOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  title={copy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 p-6">
                {printError && <p role="alert" className="text-red-600">{printError}</p>}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {copy.pdfFilename}
                  </label>
                  <input
                    aria-label={copy.pdfFilename}
                    className="h-11 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 text-sm font-medium outline-none transition-colors focus:border-zinc-400"
                    value={exportFilename}
                    onChange={(e) => setExportFilename(e.target.value)}
                  />
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                    {copy.checkResult}
                  </div>
                  {exportWarnings.length > 0 ? (
                    <ul className="space-y-2 text-sm font-medium text-amber-700">
                      {exportWarnings.map((warning) => (
                        <li key={warning}>- {warning}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm font-medium text-emerald-600">
                      {copy.noWarnings}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-zinc-100 bg-zinc-50/60 p-6 sm:flex-row sm:justify-end">
                <Button
                  variant="outline"
                  className="h-11"
                  disabled={isExporting}
                  onClick={() => setIsExportDialogOpen(false)}
                >
                  {copy.cancel}
                </Button>
                <Button
                  className="h-11 gap-2"
                  disabled={isExporting}
                  onClick={exportToPdf}
                >
                  <DownloadCloud size={16} />
                  {isExporting ? copy.generating : copy.confirmExport}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isAiAnalysisOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-editor-modal role="dialog" aria-modal="true" aria-label={copy.aiReportTitle} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              className="max-h-[90dvh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Target size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900">
                      {copy.aiReportTitle}
                    </h3>
                    <p className="text-xs font-medium text-zinc-400">
                      {copy.aiReportDesc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { aiRequest.cancel(); setIsAiAnalysisOpen(false); }}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                  title={copy.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid gap-6 p-6 lg:grid-cols-[360px_1fr]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {copy.jdLabel}
                    </label>
                    <textarea
                      aria-label={copy.jdLabel}
                      className="h-72 w-full resize-none rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-700 outline-none transition-colors focus:border-zinc-400"
                      placeholder={copy.jdPlaceholder}
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      type="button"
                      className="h-11 gap-2"
                      disabled={aiRequest.pending}
                      onClick={() => analyzeResumeWithAi("jd_match")}
                    >
                      <Target size={15} /> {copy.jdMatch}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 gap-2"
                      disabled={aiRequest.pending}
                      onClick={() => analyzeResumeWithAi("score")}
                    >
                      <Award size={15} /> {copy.resumeScore}
                    </Button>
                  </div>
                  {aiRequest.pending && <Button type="button" variant="outline" className="w-full" onClick={aiRequest.cancel}>{local("取消请求", "Cancel request")}</Button>}
                  {aiError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                      {aiError}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      {copy.reportTitle}
                    </div>
                    {isAiAnalyzing && (
                      <span className="text-xs font-bold text-emerald-600">
                        {copy.analyzing}
                      </span>
                    )}
                  </div>
                  <div className="h-[352px] overflow-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-700">
                    {aiAnalysisResult ||
                      copy.reportEmpty}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI suggestion review */}
      <AnimatePresence>
        {aiDraft && <AIReviewDialog
          original={aiDraft.sourceText}
          suggestion={aiDraft.result}
          context={aiDraft.context}
          stale={sourceSignature(aiDraft.target, aiDraft.kind) !== aiDraft.sourceSignature}
          error={aiError}
          onChange={result => setAiDraft(current => current ? { ...current, result } : null)}
          onApply={applyAiDraft}
          onClose={() => setAiDraft(null)}
        />}
      </AnimatePresence>

      <AnimatePresence>
        {tempAvatar && <AvatarCropDialog key={tempAvatar.id} image={tempAvatar.image}
          onClose={() => setTempAvatar(null)}
          onApply={(avatar, avatarAspect) => setResumeData(previous => ({ ...previous, avatar, avatarAspect }))} />}
      </AnimatePresence>
    </div>
  );
}

function EditorIdentity() {
  const params = useSearchParams();
  return <ResumeEditorContent key={params.get("id") || "default-1"} />;
}

export default function ResumeEditor() {
  return (
    <React.Suspense fallback={null}>
      <EditorIdentity />
    </React.Suspense>
  );
}
