export interface ContactItem {
  id: string;
  type: string; // e.g., 'email', 'phone', 'city', 'custom'
  iconName: string; // Lucide 图标名
  label: string;
  value: string;
  isVisible: boolean;
  isCustom: boolean;
  showLabel?: boolean;
}

export interface ResumeData {
  name: string;
  nameVisible: boolean;
  title: string;
  titleVisible: boolean;
  // --- 旧字段保留用于兼容性，初始化后将迁移至 contacts ---
  phone?: string;
  email?: string;
  city?: string;
  birthday?: string;
  experience?: string;
  hometown?: string;
  politics?: string;
  github?: string;
  blog?: string;
  // --- 动态字段 ---
  contacts: ContactItem[];
  // -------------------
  avatar?: string;
  avatarAspect?: number;
  avatarBorderRadius?: number; // 圆角百分比 0-50
  education: EducationItem[];
  workExperiences: WorkItem[];
  projects: ProjectItem[];
  skills: string[];
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  date: string;
}

export interface WorkItem {
  id: string;
  company: string;
  role: string;
  date: string;
  desc: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  role: string;
  date: string;
  link?: string;
  desc: string;
}

export interface TypographyConfig {
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

export interface ModuleItem {
  id: string;
  title: string;
  visible: boolean;
  type?: "standard" | "custom";
  content?: string;
}

export interface ResumeMetadata {
  id: string;
  title: string;
  lastModified: string;
  theme: string;
  templateId?: ResumeTemplateId;
}

export interface ResumeConfig {
  resumeData: ResumeData;
  modules: ModuleItem[];
  themeColor: string;
  typography: TypographyConfig;
  templateId: ResumeTemplateId;
}

export interface ResumeSnapshot {
  id: string;
  label: string;
  createdAt: string;
  config: ResumeConfig;
}

export type ResumeTemplateId = "classic" | "split" | "tech";
