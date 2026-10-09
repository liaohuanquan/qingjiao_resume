import type { ResumeConfig, ResumeData } from "./resume";

const SECTION_FIELDS: Record<string, "education" | "workExperiences" | "projects" | "skills"> = {
  edu: "education", work: "workExperiences", project: "projects", skill: "skills",
};

export type ResumeEntrySection = "edu" | "work" | "project";
export type ResumeEntryAction = "up" | "down" | "copy" | "remove";

function changeEntries<T extends { id: string }>(items: T[], id: string, action: ResumeEntryAction, copyId?: string): T[] {
  const index = items.findIndex(item => item.id === id);
  if (index < 0) return items;
  if (action === "remove") return items.filter(item => item.id !== id);
  if (action === "copy") {
    if (!copyId || items.some(item => item.id === copyId)) return items;
    const next = items.slice();
    next.splice(index + 1, 0, { ...items[index], id: copyId });
    return next;
  }
  const destination = index + (action === "up" ? -1 : 1);
  if (destination < 0 || destination >= items.length) return items;
  const next = items.slice();
  [next[index], next[destination]] = [next[destination], next[index]];
  return next;
}

export function editResumeEntry(data: ResumeData, section: ResumeEntrySection, id: string, action: ResumeEntryAction, copyId?: string): ResumeData {
  if (section === "edu") {
    const education = changeEntries(data.education, id, action, copyId);
    return education === data.education ? data : { ...data, education };
  }
  if (section === "work") {
    const workExperiences = changeEntries(data.workExperiences, id, action, copyId);
    return workExperiences === data.workExperiences ? data : { ...data, workExperiences };
  }
  const projects = changeEntries(data.projects, id, action, copyId);
  return projects === data.projects ? data : { ...data, projects };
}

export function removeResumeModule(config: ResumeConfig, id: string): ResumeConfig {
  if (id === "basic" || !config.modules.some(module => module.id === id)) return config;
  const field = SECTION_FIELDS[id];
  const resumeData: ResumeData = field ? { ...config.resumeData, [field]: [] } : config.resumeData;
  const sectionStyles = { ...config.typography.sectionStyles };
  delete sectionStyles[id];
  return {
    ...config,
    resumeData,
    modules: config.modules.filter(module => module.id !== id),
    typography: { ...config.typography, sectionStyles },
  };
}
