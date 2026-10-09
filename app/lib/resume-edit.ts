import type { ResumeConfig, ResumeData } from "./resume";

const SECTION_FIELDS: Record<string, "education" | "workExperiences" | "projects" | "skills"> = {
  edu: "education", work: "workExperiences", project: "projects", skill: "skills",
};

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
