import type { ContactItem, ResumeData } from "./resume";

type ImportSectionKey = "intro" | "contact" | "education" | "work" | "project" | "skill";
type ImportLine = { raw: string; text: string; heading: number; bullet: boolean };

const SECTION_KEYWORDS: Record<ImportSectionKey, string[]> = {
  intro: ["基本信息", "个人信息", "basic info", "personal information"],
  contact: ["联系", "联系方式", "contact", "contacts", "contact information"],
  education: ["教育", "教育背景", "教育经历", "学历", "education", "education background", "academic background"],
  work: ["工作", "工作经历", "实习经历", "经历", "experience", "work", "work experience", "professional experience", "employment history"],
  project: ["项目", "项目经验", "项目经历", "projects", "project", "project experience", "personal projects"],
  skill: ["技能", "专业技能", "skills", "skill", "technical skills", "professional skills", "core skills"],
};
const UNSUPPORTED_HEADINGS = ["自我评价", "个人简介", "获奖经历", "荣誉奖项", "证书", "证书荣誉", "兴趣爱好", "志愿经历", "summary", "profile", "awards", "certifications", "interests", "volunteer experience"];
const stripLine = (line: string) => line.replace(/^\s*#{1,6}\s+/, "").replace(/^\s*[-*+•]\s+/, "").replace(/^\s*\d+[.)、]\s+/, "").replace(/\*\*/g, "").trim();
const sectionKey = (line: ImportLine): ImportSectionKey | undefined => {
  const name = line.text.replace(/[:：]$/, "").toLowerCase();
  return (Object.keys(SECTION_KEYWORDS) as ImportSectionKey[]).find(key => SECTION_KEYWORDS[key].includes(name));
};

function splitSections(text: string) {
  const sections: Record<ImportSectionKey, ImportLine[]> = { intro: [], contact: [], education: [], work: [], project: [], skill: [] };
  const unrecognized: string[] = [];
  let current: ImportSectionKey | "unknown" = "intro";
  let sectionLevel = 1;
  for (const raw of text.split(/\r?\n/)) {
    const line: ImportLine = { raw, text: stripLine(raw), heading: raw.match(/^\s*(#{1,6})\s+/)?.[1].length || 0, bullet: /^\s*(?:[-*+•]|\d+[.)、])\s+/.test(raw) };
    const key = sectionKey(line);
    // Deeper headings in experience sections belong to entries, even if their
    // text happens to match a section name such as "Projects".
    const entryHeading = line.heading > sectionLevel && ["education", "work", "project"].includes(current);
    if (key && !entryHeading) {
      if (sections[key].length) sections[key].push({ raw: "", text: "", heading: 0, bullet: false });
      current = key;
      sectionLevel = line.heading || 1;
      continue;
    }
    const unsupported = UNSUPPORTED_HEADINGS.includes(line.text.replace(/[:：]$/, "").toLowerCase());
    if (!entryHeading && (unsupported || (line.heading > 0 && current !== "intro" && (current === "unknown" || line.heading <= sectionLevel)))) {
      current = "unknown";
      if (line.text) unrecognized.push(raw);
      continue;
    }
    if (current === "unknown") { if (line.text) unrecognized.push(raw); }
    else sections[current].push(line);
  }
  return { sections, unrecognized };
}

function splitBlocks(lines: ImportLine[]) {
  const headingLevels = lines.filter(line => line.heading > 0).map(line => line.heading);
  const entryLevel = headingLevels.length ? Math.min(...headingLevels) : 0;
  const blocks: ImportLine[][] = [];
  let block: ImportLine[] = [];
  const finish = () => { if (block.length) blocks.push(block); block = []; };
  for (const line of lines) {
    if (!line.text) { if (!entryLevel) finish(); continue; }
    if (entryLevel && line.heading === entryLevel) finish();
    block.push(line);
  }
  finish();
  return blocks;
}

const DATE_UNIT = "(?:19|20)\\d{2}(?:[./-]\\d{1,2}|年(?:\\d{1,2}月)?)?";
const DATE_RANGE = `${DATE_UNIT}(?:\\s*(?:-|–|—|至|到|~|～)\\s*(?:至今|present|now|${DATE_UNIT})|\\s*(?:至今|present|now))`;
const DATE_PATTERN = new RegExp(`${DATE_RANGE}|${DATE_UNIT}`, "i");
const RANGE_PATTERN = new RegExp(DATE_RANGE, "i");

function takeDate(block: ImportLine[]) {
  let date = "";
  let index = -1;
  let dateOnly = false;
  for (let i = 0; i < block.length; i++) {
    const line = block[i];
    if (line.bullet) continue;
    const match = line.text.match(DATE_PATTERN);
    if (!match) continue;
    const remainder = line.text.replace(match[0], "").replace(/^(?:日期|时间|dates?)\s*[:：]?/i, "").replace(/[\s|｜·,，()（）]/g, "");
    // Single years are only dates on their own line. Embedded ranges are only
    // read from entry headers, never removed from description paragraphs.
    if (remainder && (i > 1 || !RANGE_PATTERN.test(match[0]) || !/^[\s|｜·,，()（）]*$/.test(line.text.slice((match.index || 0) + match[0].length)))) continue;
    date = match[0]; index = i; dateOnly = !remainder; break;
  }
  return {
    date,
    lines: block.map((line, i) => i === index ? {
      ...line,
      text: dateOnly ? "" : line.text.replace(date, "").replace(/\(\s*\)|（\s*）/g, "").replace(/^[\s|｜·,，]+|[\s|｜·,，]+$/g, "").trim(),
      // Keep formatted descriptions consistent with the extracted date, including
      // entry subheadings that later become description paragraphs.
      raw: dateOnly ? "" : line.raw.replace(date, "").replace(/\(\s*\)|（\s*）/g, "").replace(/[\s|｜·,，]+(?=(?:\*\*)?$)/g, ""),
    } : line).filter(line => line.text),
  };
}

const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+?\d[\d ()-]{7,}\d)/g;
const URL_PATTERN = /https?:\/\/[^\s<>\])，,]+/gi;

function parseContacts(intro: ImportLine[], contactLines: ImportLine[]) {
  const contacts: ContactItem[] = [];
  const remainingIntro: string[] = [];
  const unrecognized: string[] = [];
  const push = (type: string, value: string, label: string) => {
    if (!value || contacts.some(item => item.value === value)) return;
    contacts.push({ id: `import-contact-${contacts.length + 1}`, type, iconName: type === "custom" ? "user" : type, label, value, isVisible: true, isCustom: type === "custom", showLabel: type === "custom" });
  };
  const consume = (line: ImportLine, isContactSection: boolean) => {
    if (!line.text) return;
    let remainder = line.text;
    for (const email of line.text.match(EMAIL_PATTERN) || []) { push("email", email, "邮箱"); remainder = remainder.replace(email, ""); }
    for (const phone of line.text.replace(URL_PATTERN, "").match(PHONE_PATTERN) || []) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15 || /(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}/.test(phone)) continue;
      push("phone", phone.replace(/\s+/g, ""), "电话"); remainder = remainder.replace(phone, "");
    }
    remainder = remainder.replace(/(?:电话|手机|邮箱|email|phone)\s*[:：]\s*(?=$|[|｜·,，;；])/gi, "");
    const labeled = remainder.match(/^(城市|地址|所在地|location|city|github|博客|blog|website|网站)\s*[:：]\s*(.+)$/i);
    if (labeled) {
      const label = labeled[1].toLowerCase();
      const type = /^(城市|地址|所在地|location|city)$/.test(label) ? "city" : label === "github" ? "github" : "blog";
      push(type, labeled[2].trim(), type === "city" ? "城市" : type === "github" ? "GitHub" : "博客");
      remainder = "";
    } else {
      for (const url of remainder.match(URL_PATTERN) || []) {
        let host: string;
        try { host = new URL(url).hostname.toLowerCase(); } catch { continue; }
        push(host === "github.com" || host === "www.github.com" ? "github" : "blog", url, host === "github.com" || host === "www.github.com" ? "GitHub" : "网站");
        remainder = remainder.replace(url, "").replace(/\[([^\]]*)\]\(\)/g, "");
      }
    }
    remainder = remainder.replace(/^[\s|｜·,，;；]+|[\s|｜·,，;；]+$/g, "").trim();
    if (!remainder) return;
    if (isContactSection) {
      const custom = remainder.match(/^([^:：]+)[:：]\s*(.+)$/);
      if (custom) push("custom", custom[2].trim(), custom[1].trim());
      else unrecognized.push(line.raw);
    } else remainingIntro.push(remainder);
  };
  intro.forEach(line => consume(line, false));
  contactLines.forEach(line => consume(line, true));
  return { contacts, remainingIntro, unrecognized };
}

function projectLink(lines: ImportLine[]) {
  let link = "";
  const remaining: ImportLine[] = [];
  for (const line of lines) {
    const markdown = line.text.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
    const standalone = line.text.match(/^(?:(?:链接|项目链接|网址|link|url|website|repository)\s*[:：]\s*)?(https?:\/\/\S+)$/i);
    if (!link && (standalone || markdown)) link = (standalone?.[1] || markdown?.[2] || "");
    // A standalone link has its own field; links embedded in a paragraph remain.
    if (standalone && standalone[1] === link) continue;
    remaining.push(markdown && (line.heading > 0 || remaining.length === 0) ? { ...line, text: line.text.replace(markdown[0], markdown[1]) } : line);
  }
  return { link, lines: remaining };
}

export function previewTextImport(text: string) {
  const { sections, unrecognized } = splitSections(text);
  const contact = parseContacts(sections.intro, sections.contact);
  unrecognized.push(...contact.unrecognized);
  let name = "";
  let title = "";
  let hasName = false;
  let hasTitle = false;
  const plainIntro: string[] = [];
  for (const line of contact.remainingIntro) {
    const labeledName = line.match(/^(?:姓名|name)\s*[:：]\s*(.*)$/i);
    const labeledTitle = line.match(/^(?:职位|求职意向|职称|title|role)\s*[:：]\s*(.*)$/i);
    if (labeledName && !hasName) { name = labeledName[1]; hasName = true; }
    else if (labeledTitle && !hasTitle) { title = labeledTitle[1]; hasTitle = true; }
    else plainIntro.push(line);
  }
  if (!hasName) name = plainIntro.shift() || "";
  if (!hasTitle) title = plainIntro.shift() || "";
  unrecognized.push(...plainIntro);
  const parseEntry = (block: ImportLine[]) => {
    const dated = takeDate(block);
    const [first, second, ...rest] = dated.lines;
    const role = second && !second.bullet && !second.heading ? second.text : "";
    const description = role ? rest : dated.lines.slice(1);
    return { name: first?.text || "", role, date: dated.date, desc: description.map(line => line.raw.replace(/^\s*#{1,6}\s+/, "").trim()).join("\n") };
  };
  const data: ResumeData = {
    name, title, nameVisible: true, titleVisible: true, contacts: contact.contacts,
    avatarAspect: 1, avatarBorderRadius: 12,
    education: splitBlocks(sections.education).map((block, index) => {
      const { date, lines } = takeDate(block);
      return { id: `import-edu-${index + 1}`, school: lines[0]?.text || "", major: lines.slice(1).map(line => line.text).join("\n"), date };
    }),
    workExperiences: splitBlocks(sections.work).map((block, index) => {
      const entry = parseEntry(block);
      return { id: `import-work-${index + 1}`, company: entry.name, role: entry.role, date: entry.date, desc: entry.desc };
    }),
    projects: splitBlocks(sections.project).map((block, index) => {
      const linked = projectLink(block);
      const entry = parseEntry(linked.lines);
      return { id: `import-project-${index + 1}`, name: entry.name, role: entry.role, date: entry.date, desc: entry.desc, link: linked.link };
    }),
    skills: sections.skill.flatMap(line => line.text.split(/[,，、|｜]/)).map(skill => skill.trim()).filter(Boolean),
  };
  return { data, unrecognized: [...new Set(unrecognized)] };
}
