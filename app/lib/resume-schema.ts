import type { ResumeConfig, ResumeData, ResumeTemplateId } from "./resume";

export const templateIds: ResumeTemplateId[] = ["classic", "split", "tech"];
export const fontFamilies = {
  sans: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  serif: "'Songti SC', SimSun, serif",
  mono: "'SFMono-Regular', Consolas, 'PingFang SC', monospace",
};

export function blankResume(locale = "zh-CN"): ResumeConfig {
  const titles = locale === "en-US"
    ? ["Basic info", "Education", "Work experience", "Projects", "Skills"]
    : ["基本信息", "教育背景", "工作经历", "项目经验", "专业技能"];
  return {
    resumeData: { name: "", nameVisible: true, title: "", titleVisible: true, contacts: [], education: [], workExperiences: [], projects: [], skills: [], avatarAspect: 1, avatarBorderRadius: 12 },
    modules: ["basic", "edu", "work", "project", "skill"].map((id, i) => ({ id, title: titles[i], visible: true })),
    themeColor: "#10b981", templateId: "classic",
    typography: { fontFamily: fontFamilies.sans, fontSize: 14.5, lineHeight: 1.6, skillStyle: "dot", skillTagRadius: 6, skillTagColor: "#71717a", skillTagUseTheme: true },
  };
}

export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid object");
  return value as Record<string, unknown>;
}
function string(value: unknown, fallback = ""): string {
  if (value === undefined) return fallback;
  if (typeof value !== "string") throw new Error("invalid text");
  return value;
}
function boolean(value: unknown, fallback = true): boolean {
  if (value === undefined) return fallback;
  if (typeof value !== "boolean") throw new Error("invalid visibility");
  return value;
}
function number(value: unknown, fallback: number, positive = false): number {
  if (value === undefined) return fallback;
  if (typeof value !== "number" || !Number.isFinite(value) || (positive ? value <= 0 : value < 0)) throw new Error("invalid number");
  return value;
}
export function color(value: unknown, fallback = "#10b981"): string {
  const result = string(value, fallback);
  if (/^#[a-f\d]{3}$/i.test(result)) return "#" + [...result.slice(1)].map(c => c + c).join("");
  if (!/^#[a-f\d]{6}$/i.test(result)) throw new Error("invalid color");
  return result;
}
function array<T>(value: unknown, parse: (item: unknown, i: number) => T): T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("invalid list");
  return value.map(parse);
}
function unique<T extends { id: string }>(items: T[]): T[] {
  if (items.some(item => !item.id) || new Set(items.map(item => item.id)).size !== items.length) throw new Error("invalid item id");
  return items;
}

export function normalizeResumeData(value: unknown): ResumeData {
  const data = record(value);
  let contacts = unique(array(data.contacts, (value, i) => {
    const item = record(value);
    return { id: string(item.id, `contact-${i}`), type: string(item.type, "custom"), iconName: string(item.iconName, "custom"), label: string(item.label), value: string(item.value), isVisible: boolean(item.isVisible), isCustom: boolean(item.isCustom, false), showLabel: boolean(item.showLabel, false) };
  }));
  if (data.contacts === undefined) {
    contacts = ["phone", "email", "city", "birthday", "experience", "hometown", "politics", "github", "blog"].flatMap(key => {
      const value = string(data[key]);
      const labels: Record<string, string> = { phone: "电话", email: "邮箱", city: "城市", birthday: "生日", experience: "经验", hometown: "籍贯", politics: "政治面貌", github: "GitHub", blog: "网站" };
      return value ? [{ id: `legacy-${key}`, type: key, iconName: key, label: labels[key], value, isVisible: true, isCustom: false, showLabel: false }] : [];
    });
  }
  const education = unique(array(data.education, (value, i) => {
    const item = record(value);
    return { id: string(item.id, `edu-${i}`), school: string(item.school), major: string(item.major), date: string(item.date) };
  }));
  const workExperiences = unique(array(data.workExperiences, (value, i) => {
    const item = record(value);
    return { id: string(item.id, `work-${i}`), company: string(item.company), role: string(item.role), date: string(item.date), desc: string(item.desc) };
  }));
  const projects = unique(array(data.projects, (value, i) => {
    const item = record(value);
    return { id: string(item.id, `project-${i}`), name: string(item.name), role: string(item.role), date: string(item.date), desc: string(item.desc), link: string(item.link) };
  }));
  const avatar = string(data.avatar);
  if (avatar && !/^data:image\/(png|jpe?g|webp|gif);base64,/i.test(avatar)) throw new Error("invalid avatar");
  return { name: string(data.name), title: string(data.title), nameVisible: boolean(data.nameVisible), titleVisible: boolean(data.titleVisible), contacts, education, workExperiences, projects, skills: array(data.skills, value => string(value)).filter(Boolean), avatar, avatarAspect: number(data.avatarAspect, 1, true), avatarBorderRadius: number(data.avatarBorderRadius, 12) };
}

export function parseResumeConfig(value: unknown): ResumeConfig {
  const config = record(value);
  const defaults = blankResume();
  const modules = config.modules === undefined ? defaults.modules : unique(array(config.modules, value => {
    const item = record(value);
    const id = string(item.id);
    if (["basic", "edu", "work", "project", "skill"].includes(id) && item.type === "custom") throw new Error("invalid module type");
    if (!["basic", "edu", "work", "project", "skill"].includes(id) && item.type !== "custom") throw new Error("invalid module");
    if (item.type !== undefined && item.type !== "standard" && item.type !== "custom") throw new Error("invalid module type");
    return { id, title: string(item.title), visible: boolean(item.visible), type: item.type as "standard" | "custom" | undefined, content: string(item.content) };
  }));
  const typo = config.typography === undefined ? {} : record(config.typography);
  const oldFont = string(typo.fontFamily, fontFamilies.sans);
  const fontFamily = Object.values(fontFamilies).includes(oldFont) ? oldFont : /SimSun|宋体|Songti/i.test(oldFont) ? fontFamilies.serif : /mono|Consolas/i.test(oldFont) ? fontFamilies.mono : fontFamilies.sans;
  if (typo.skillStyle !== undefined && typo.skillStyle !== "dot" && typo.skillStyle !== "tag") throw new Error("invalid skill style");
  const sectionStyles: NonNullable<ResumeConfig["typography"]["sectionStyles"]> = {};
  if (typo.sectionStyles !== undefined) Object.entries(record(typo.sectionStyles)).forEach(([id, value]) => {
    const style = record(value);
    sectionStyles[id] = { fontSize: style.fontSize === undefined ? undefined : number(style.fontSize, 14.5, true), spacing: style.spacing === undefined ? undefined : number(style.spacing, 24) };
  });
  const templateId = config.templateId === undefined ? "classic" : config.templateId;
  if (!templateIds.includes(templateId as ResumeTemplateId)) throw new Error("invalid template");
  return {
    resumeData: normalizeResumeData(config.resumeData), modules, themeColor: color(config.themeColor), templateId: templateId as ResumeTemplateId,
    typography: { fontFamily, fontSize: number(typo.fontSize, 14.5, true), lineHeight: number(typo.lineHeight, 1.6, true), skillStyle: (typo.skillStyle || "dot") as "dot" | "tag", skillTagRadius: number(typo.skillTagRadius, 6), skillTagColor: color(typo.skillTagColor, "#71717a"), skillTagUseTheme: boolean(typo.skillTagUseTheme), sectionStyles },
  };
}

export function visibleResumeText(config: ResumeConfig): string {
  const data = config.resumeData;
  return config.modules.filter(module => module.visible).map(module => {
    if (module.id === "basic") return [data.nameVisible ? data.name : "", data.titleVisible ? data.title : ""].filter(Boolean).join("\n");
    const lines = module.type === "custom" ? [module.content || ""]
      : module.id === "edu" ? data.education.map(item => `${item.school} ${item.major} ${item.date}`)
      : module.id === "work" ? data.workExperiences.map(item => `${item.company} ${item.role} ${item.date}\n${item.desc}`)
      : module.id === "project" ? data.projects.map(item => `${item.name} ${item.role} ${item.date}\n${item.desc}`)
      : module.id === "skill" ? [data.skills.join(", ")] : [];
    return lines.some(line => line.trim()) ? `${module.title}\n${lines.join("\n")}` : "";
  }).filter(Boolean).join("\n\n");
}

export function sampleResume(locale = "zh-CN"): ResumeConfig {
  const config = blankResume(locale);
  const english = locale === "en-US";
  config.resumeData = { ...config.resumeData, name: english ? "Alex Chen" : "张三", title: english ? "Frontend Engineer" : "前端工程师", contacts: [{ id: "sample-email", type: "email", iconName: "email", label: english ? "Email" : "邮箱", value: "demo@example.com", isVisible: true, isCustom: false }], education: [{ id: "sample-edu", school: english ? "Example University" : "示例大学", major: english ? "Computer Science" : "计算机科学", date: "2020 – 2024" }], workExperiences: [{ id: "sample-work", company: english ? "Example Company" : "示例公司", role: english ? "Frontend Engineer" : "前端工程师", date: "2024 – 2026", desc: english ? "Built and maintained web applications.\nImproved page loading and accessibility." : "负责业务页面开发与维护。\n优化页面加载和键盘操作。" }], projects: [{ id: "sample-project", name: english ? "Resume editor" : "简历编辑器", role: english ? "Developer" : "开发", date: "2025", desc: english ? "Implemented editing, local storage, and printing." : "实现编辑、本地保存与打印。" }], skills: ["TypeScript", "React", "CSS"] };
  return config;
}
