"use client";

import React from "react";
import Image from "next/image";
import type { ResumeConfig, ModuleItem, ResumeData, TypographyConfig } from "../lib/resume";
import { ICON_MAP } from "../lib/contact-icons";
import { resumeModuleColumn } from "../lib/resume-layout";
import { typographyDefaults } from "../lib/resume-typography";
import { webLink } from "../lib/resume-description";
import { ResumeDescription } from "./ResumeDescription";

function ProjectLink({ value, interactive }: { value: string; interactive: boolean }) {
  const href = webLink(value);
  return <p className="resume-project-link">{!href ? value : interactive ? <a href={href}>{value}</a> : <span className="resume-link">{value}</span>}</p>;
}

function ResumeHeader({ data, avatarAlt, editAction }: { data: ResumeData; avatarAlt: string; editAction?: React.ReactNode }) {
  const contacts = data.contacts.filter(item => item.isVisible && item.value.trim());
  if (!data.avatar && !(data.nameVisible && data.name.trim()) && !(data.titleVisible && data.title.trim()) && !contacts.length) return null;
  const aspect = data.avatarAspect || 1;
  const width = Math.min(92, 112 * aspect);
  const height = width / aspect;
  return <header className="resume-header" data-module="basic">
    {editAction}
    {data.avatar && <Image className="resume-avatar" src={data.avatar} unoptimized loading="eager" alt={avatarAlt}
      width={Math.max(1, Math.round(width))} height={Math.max(1, Math.round(height))}
      style={{ width, height, borderRadius: data.avatarBorderRadius, objectFit: "cover" }} />}
    <div className="resume-heading">
      {data.nameVisible && data.name.trim() && <h1>{data.name}</h1>}
      {data.titleVisible && data.title.trim() && <p className="resume-title">{data.title}</p>}
      {contacts.length > 0 && <div className="resume-contacts">{contacts.map(item => {
        const Icon = ICON_MAP[item.iconName] || ICON_MAP.custom;
        return <span key={item.id}><Icon size={12} aria-hidden="true" /><span>{(item.isCustom || item.showLabel) && item.label && `${item.label}：`}{item.value}</span></span>;
      })}</div>}
    </div>
  </header>;
}

function SkillList({ skills, typography, themeColor }: { skills: string[]; typography: TypographyConfig; themeColor: string }) {
  if (!skills.some(skill => skill.trim())) return null;
  const tag = typography.skillStyle === "tag";
  const color = typography.skillTagUseTheme ? themeColor : typography.skillTagColor ?? "#71717a";
  return <ul className={`resume-skills ${tag ? "resume-tags" : ""}`}>{skills.filter(skill => skill.trim()).map((skill, index) =>
    <li key={index} style={tag ? { borderRadius: typography.skillTagRadius ?? 6, color, borderColor: `${color}33`, backgroundColor: `${color}0d` } : undefined}>{skill}</li>)}</ul>;
}

function isLongEntry(text: string) {
  return text.split(/\r?\n/).length > 8 || text.length > 800;
}

export const ResumeDocument = React.forwardRef<HTMLDivElement, { config: ResumeConfig; pageGuides?: boolean; avatarAlt?: string; interactiveLinks?: boolean; onEditModule?: (id: string) => void; editLabel?: string }>(function ResumeDocument({ config, pageGuides = false, avatarAlt = "头像", interactiveLinks = true, onEditModule, editLabel = "编辑" }, ref) {
  const { resumeData: data, typography, themeColor, templateId, modules } = config;
  const editAction = (module: ModuleItem) => onEditModule ? <button type="button" className="resume-edit-module no-print"
    aria-label={module.title ? `${editLabel} ${module.title}` : editLabel} onClick={() => onEditModule(module.id)}>{editLabel}</button> : null;
  function content(module: ModuleItem) {
    if (module.type === "custom") return module.content?.trim() ? <ResumeDescription text={module.content} interactive={interactiveLinks} /> : null;
    if (module.id === "edu") return data.education.filter(item => item.school || item.major || item.date).map(item =>
      <article className={`resume-entry ${isLongEntry(item.major) ? "resume-entry-long" : ""}`} key={item.id}>
        <div className="resume-entry-heading"><strong>{item.school}</strong>{item.date && <span className="resume-date">{item.date}</span>}</div>
        {item.major && <p className="resume-role">{item.major}</p>}
      </article>);
    if (module.id === "work") return data.workExperiences.filter(item => item.company || item.role || item.date || item.desc).map(item =>
      <article className={`resume-entry ${isLongEntry(item.desc) ? "resume-entry-long" : ""}`} key={item.id}>
        <div className="resume-entry-heading"><strong>{item.company}</strong>{item.date && <span className="resume-date">{item.date}</span>}</div>
        {item.role && <p className="resume-role">{item.role}</p>}
        <ResumeDescription text={item.desc} interactive={interactiveLinks} />
      </article>);
    if (module.id === "project") return data.projects.filter(item => item.name || item.role || item.date || item.desc || item.link).map(item =>
      <article className={`resume-entry ${isLongEntry(item.desc) ? "resume-entry-long" : ""}`} key={item.id}>
        <div className="resume-entry-heading"><strong>{item.name}</strong>{item.date && <span className="resume-date">{item.date}</span>}</div>
        {item.role && <p className="resume-role">{item.role}</p>}
        {item.link && <ProjectLink value={item.link} interactive={interactiveLinks} />}
        <ResumeDescription text={item.desc} interactive={interactiveLinks} />
      </article>);
    if (module.id === "skill") return <SkillList skills={data.skills} typography={typography} themeColor={themeColor} />;
    return null;
  }
  const visible = modules.filter(module => module.visible).flatMap(module => {
    if (module.id === "basic") {
      const hasHeader = Boolean(data.avatar || (data.nameVisible && data.name.trim()) || (data.titleVisible && data.title.trim()) || data.contacts.some(item => item.isVisible && item.value.trim()));
      return hasHeader ? [{ module, node: <ResumeHeader key={module.id} data={data} avatarAlt={avatarAlt} editAction={editAction(module)} /> }] : [];
    }
    if (module.id === "skill" && !data.skills.some(skill => skill.trim())) return [];
    const children = content(module);
    if (!children || (Array.isArray(children) && !children.length)) return [];
    const style = typography.sectionStyles?.[module.id];
    return [{ module, node: <section key={module.id} className="resume-section" data-module={module.id} style={{ fontSize: style?.fontSize, marginBottom: style?.spacing }}>
      {editAction(module)}
      {module.title && <h2>{module.title}</h2>}<div className="resume-section-body">{children}</div>
    </section> }];
  });
  const sidebar = visible.filter(entry => resumeModuleColumn(entry.module) === "sidebar");
  const main = visible.filter(entry => resumeModuleColumn(entry.module) === "main");
  const columns = templateId === "split" && sidebar.length > 0 && main.length > 0;
  return <div ref={ref} className={`resume-document resume-${templateId} ${pageGuides ? "resume-page-guides" : ""}`} style={{
    "--theme-color": themeColor,
    "--name-size": `${typography.nameFontSize ?? typographyDefaults.nameFontSize}px`,
    "--heading-size": `${typography.headingFontSize ?? typographyDefaults.headingFontSize}px`,
    "--paragraph-gap": `${typography.paragraphSpacing ?? typographyDefaults.paragraphSpacing}px`,
    "--entry-gap": `${typography.entrySpacing ?? typographyDefaults.entrySpacing}px`,
    "--section-gap": `${typography.sectionSpacing ?? typographyDefaults.sectionSpacing}px`,
    fontFamily: typography.fontFamily, fontSize: typography.fontSize, lineHeight: typography.lineHeight,
  } as React.CSSProperties}>
    {columns ? <div className="resume-split-layout">
      <div className="resume-sidebar">{sidebar.map(entry => entry.node)}</div>
      <div className="resume-main">{main.map(entry => entry.node)}</div>
    </div> : <div className="resume-sections">{visible.map(entry => entry.node)}</div>}
  </div>;
});
