"use client";

import React from "react";
import Image from "next/image";
import type { ResumeConfig, ModuleItem } from "../lib/resume";
import { ICON_MAP } from "../lib/contact-icons";

function Paragraphs({ text }: { text: string }) {
  return <div className="resume-description">{text.split(/\n+/).filter(line => line.trim()).map((line, i) => <p key={i}>{line}</p>)}</div>;
}

export const ResumeDocument = React.forwardRef<HTMLDivElement, { config: ResumeConfig; pageGuides?: boolean; avatarAlt?: string }>(function ResumeDocument({ config, pageGuides = false, avatarAlt = "头像" }, ref) {
  const { resumeData: data, typography, themeColor, templateId, modules } = config;
  function content(module: ModuleItem) {
    if (module.type === "custom") return module.content?.trim() ? <Paragraphs text={module.content} /> : null;
    if (module.id === "edu") return data.education.filter(item => item.school || item.major || item.date).map(item => <article className="resume-entry" key={item.id}><div className="resume-entry-heading"><strong>{item.school}</strong><span>{item.date}</span></div>{item.major && <p>{item.major}</p>}</article>);
    if (module.id === "work") return data.workExperiences.filter(item => item.company || item.role || item.date || item.desc).map(item => <article className={`resume-entry ${item.desc.split("\n").length > 8 || item.desc.length > 800 ? "resume-entry-long" : ""}`} key={item.id}><div className="resume-entry-heading"><strong>{item.company}</strong><span>{item.date}</span></div>{item.role && <p className="resume-role">{item.role}</p>}<Paragraphs text={item.desc} /></article>);
    if (module.id === "project") return data.projects.filter(item => item.name || item.role || item.date || item.desc || item.link).map(item => <article className={`resume-entry ${item.desc.split("\n").length > 8 || item.desc.length > 800 ? "resume-entry-long" : ""}`} key={item.id}><div className="resume-entry-heading"><strong>{item.name}</strong><span>{item.date}</span></div>{item.role && <p className="resume-role">{item.role}</p>}{item.link && (/^https?:\/\//i.test(item.link) ? <a href={item.link}>{item.link}</a> : <p>{item.link}</p>)}<Paragraphs text={item.desc} /></article>);
    if (module.id === "skill") return data.skills.some(skill => skill.trim()) ? <ul className={`resume-skills ${typography.skillStyle === "tag" ? "resume-tags" : ""}`}>{data.skills.filter(skill => skill.trim()).map((skill, i) => <li key={i} style={typography.skillStyle === "tag" ? { borderRadius: typography.skillTagRadius, color: typography.skillTagUseTheme ? themeColor : typography.skillTagColor, borderColor: typography.skillTagUseTheme ? `${themeColor}33` : `${typography.skillTagColor}33`, backgroundColor: typography.skillTagUseTheme ? `${themeColor}0d` : `${typography.skillTagColor}0d` } : undefined}>{skill}</li>)}</ul> : null;
    return null;
  }
  return <div ref={ref} className={`resume-document resume-${templateId} ${pageGuides ? "resume-page-guides" : ""}`} style={{ "--theme-color": themeColor, fontFamily: typography.fontFamily, fontSize: typography.fontSize, lineHeight: typography.lineHeight } as React.CSSProperties}>
    <div className="resume-sections">{modules.filter(module => module.visible).map(module => {
      if (module.id === "basic") {
        const contacts = data.contacts.filter(item => item.isVisible && item.value.trim());
        if (!data.avatar && !(data.nameVisible && data.name.trim()) && !(data.titleVisible && data.title.trim()) && !contacts.length) return null;
        return <header key={module.id} className="resume-header">
      {data.avatar && <Image src={data.avatar} unoptimized loading="eager" alt={avatarAlt} width={112} height={112 / (data.avatarAspect || 1)} style={{ width: 112, height: 112 / (data.avatarAspect || 1), borderRadius: data.avatarBorderRadius, objectFit: "cover" }} />}
      <div className="resume-heading">
        {data.nameVisible && data.name.trim() && <h1>{data.name}</h1>}
        {data.titleVisible && data.title.trim() && <p className="resume-title">{data.title}</p>}
        <div className="resume-contacts">{contacts.map(item => {
          const Icon = ICON_MAP[item.iconName] || ICON_MAP.custom;
          return <span key={item.id}><Icon size={13} aria-hidden="true" />{(item.isCustom || item.showLabel) && item.label && `${item.label}：`}{item.value}</span>;
        })}</div>
      </div>
        </header>;
      }
      const children = content(module);
      if (!children || (Array.isArray(children) && children.length === 0)) return null;
      const style = typography.sectionStyles?.[module.id];
      return <section key={module.id} className="resume-section" style={{ fontSize: style?.fontSize, marginBottom: style?.spacing }}><h2>{module.title}</h2><div className="resume-section-body">{children}</div></section>;
    })}</div>
  </div>;
});
