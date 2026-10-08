import type { ContactItem, ResumeData } from "./resume";

type ImportSectionKey =
  | "intro"
  | "contact"
  | "education"
  | "work"
  | "project"
  | "skill";

const IMPORT_SECTION_KEYWORDS: Record<
  Exclude<ImportSectionKey, "intro">,
  string[]
> = {
  contact: [
    "联系",
    "联系方式",
    "contact",
    "contacts",
    "contact information",
  ],
  education: ["教育", "教育背景", "education", "education background"],
  work: [
    "工作",
    "工作经历",
    "实习经历",
    "经历",
    "experience",
    "work",
    "work experience",
    "professional experience",
    "employment history",
  ],
  project: [
    "项目",
    "项目经验",
    "projects",
    "project",
    "project experience",
    "personal projects",
  ],
  skill: [
    "技能",
    "专业技能",
    "skills",
    "skill",
    "technical skills",
    "professional skills",
    "core skills",
  ],
};

const stripImportLine = (line: string) =>
  line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/^\d+[.)、]\s*/, "")
    .replace(/\*\*/g, "")
    .trim();

const getImportSectionKey = (line: string): ImportSectionKey | null => {
  const normalized = stripImportLine(line).replace(/[:：]$/, "").toLowerCase();
  const match = Object.entries(IMPORT_SECTION_KEYWORDS).find(([, keywords]) =>
    keywords.some((keyword) => normalized === keyword.toLowerCase()),
  );
  return (match?.[0] as ImportSectionKey | undefined) ?? null;
};

const splitImportBlocks = (lines: string[]) => {
  const blocks: string[][] = [];
  let current: string[] = [];

  lines.forEach((line) => {
    if (!line.trim()) {
      if (current.length > 0) {
        blocks.push(current);
        current = [];
      }
      return;
    }
    current.push(stripImportLine(line));
  });

  if (current.length > 0) blocks.push(current);
  return blocks;
};

const findImportDate = (lines: string[]) => {
  const datePattern =
    /((?:19|20)\d{2}(?:[./-]\d{1,2})?\s*(?:-|–|—|至|到|~)\s*(?:至今|present|now|(?:19|20)\d{2}(?:[./-]\d{1,2})?)|(?:19|20)\d{2}(?:[./-]\d{1,2})?)/i;
  return lines.find((line) => datePattern.test(line))?.match(datePattern)?.[0] ?? "";
};

const removeImportDate = (line: string, date: string) =>
  date ? line.replace(date, "").replace(/[|｜·,，-]+$/g, "").trim() : line;

const parseImportContacts = (text: string, contactLines: string[]) => {
  const contacts: ContactItem[] = [];
  const pushContact = (
    type: string,
    iconName: string,
    label: string,
    value: string,
  ) => {
    if (!value || contacts.some((item) => item.value === value)) return;
    contacts.push({
      id: `import-contact-${contacts.length + 1}`,
      type,
      iconName,
      label,
      value,
      isVisible: true,
      isCustom: false,
      showLabel: type === "custom",
    });
  };

  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const phone = (text.match(/(?:\+?\d[\d ()-]{7,}\d)/g) || []).find(value => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15 && !/(?:19|20)\d{2}\s*[-–—]\s*(?:19|20)\d{2}/.test(value);
  })?.replace(/\s+/g, "") || "";
  pushContact("phone", "phone", "电话", phone);
  pushContact("email", "email", "邮箱", email);

  contactLines.forEach((line) => {
    const value = stripImportLine(line);
    if (!value) return;
    if (/城市|地址|所在地|location|city/i.test(value)) {
      pushContact("city", "city", "城市", (/^https?:\/\//i.test(value) ? value : value.replace(/^[^:：]+[:：]\s*/, "")));
    } else if (/github/i.test(value)) {
      pushContact("github", "github", "GitHub", (/^https?:\/\//i.test(value) ? value : value.replace(/^[^:：]+[:：]\s*/, "")));
    } else if (/博客|blog|website|网站/i.test(value)) {
      pushContact("blog", "blog", "博客", (/^https?:\/\//i.test(value) ? value : value.replace(/^[^:：]+[:：]\s*/, "")));
    }
  });

  return contacts;
};

export const parseResumeTextDraft = (text: string): ResumeData => {
  const sections: Record<ImportSectionKey, string[]> = {
    intro: [],
    contact: [],
    education: [],
    work: [],
    project: [],
    skill: [],
  };
  let currentSection: ImportSectionKey = "intro";

  text.split(/\r?\n/).forEach((rawLine) => {
    const sectionKey = getImportSectionKey(rawLine);
    if (sectionKey) {
      currentSection = sectionKey;
      return;
    }
    sections[currentSection].push(rawLine);
  });

  const introLines = sections.intro.map(stripImportLine).filter(Boolean);
  const contactLines = sections.contact.map(stripImportLine).filter(Boolean);
  const contacts = parseImportContacts([...introLines, ...contactLines].join("\n"), [...introLines, ...contactLines]);
  const introWithoutContacts = introLines.filter(
    (line) =>
      !/@/.test(line) &&
      !/(电话|手机|邮箱|email|phone|城市|地址|location|city)/i.test(line) &&
      !contacts.some(contact => line.replace(/\s/g, "").includes(contact.value.replace(/\s/g, ""))),
  );

  const educationBlocks = splitImportBlocks(sections.education);
  const workBlocks = splitImportBlocks(sections.work);
  const projectBlocks = splitImportBlocks(sections.project);
  const skillLines = sections.skill.map(stripImportLine).filter(Boolean);

  return {
    name: introWithoutContacts[0] || "",
    nameVisible: true,
    title: introWithoutContacts[1] || "",
    titleVisible: true,
    contacts,
    avatarAspect: 1,
    avatarBorderRadius: 12,
    education: educationBlocks.map((block, index) => {
      const date = findImportDate(block);
      const withoutDate = block.map((line) => removeImportDate(line, date)).filter(Boolean);
      return {
        id: `import-edu-${index + 1}`,
        school: withoutDate[0] || "",
        major: withoutDate.slice(1).join(" ") || "",
        date,
      };
    }),
    workExperiences: workBlocks.map((block, index) => {
      const date = findImportDate(block);
      const withoutDate = block.map((line) => removeImportDate(line, date)).filter(Boolean);
      return {
        id: `import-work-${index + 1}`,
        company: withoutDate[0] || "",
        role: withoutDate[1] || "",
        date,
        desc: withoutDate.slice(2).join("\n"),
      };
    }),
    projects: projectBlocks.map((block, index) => {
      const date = findImportDate(block);
      const withoutDate = block.map((line) => removeImportDate(line, date)).filter(Boolean);
      return {
        id: `import-project-${index + 1}`,
        name: withoutDate[0] || "",
        role: withoutDate[1] || "",
        date,
        desc: withoutDate.slice(2).join("\n"),
      };
    }),
    skills:
      skillLines
        .join(",")
        .split(/[,，、|｜/]/)
        .map((skill) => skill.trim())
        .filter(Boolean) || [],
  };
};


export function previewTextImport(text: string) {
  const intro: string[] = [];
  const recognized: string[] = [];
  const unrecognized: string[] = [];
  const unsupportedHeadings = ["自我评价", "个人简介", "获奖经历", "荣誉奖项", "证书", "证书荣誉", "兴趣爱好", "志愿经历", "summary", "profile", "awards", "certifications", "interests", "volunteer experience"];
  let section: ImportSectionKey | "unknown" = "intro";
  text.split(/\r?\n/).forEach(line => {
    const key = getImportSectionKey(line);
    if (key) { section = key; recognized.push(line); return; }
    if ((/^#{1,6}\s+/.test(line) && section !== "intro") || unsupportedHeadings.includes(stripImportLine(line).replace(/[:：]$/, "").toLowerCase())) { section = "unknown"; unrecognized.push(line); return; }
    if (section === "unknown") { if (line.trim()) unrecognized.push(line); return; }
    recognized.push(line);
    if (section === "intro" && line.trim() && !/(电话|手机|邮箱|email|phone|城市|地址|location|city|@)/i.test(line)) intro.push(line);
  });
  const data = parseResumeTextDraft(recognized.join("\n"));
  const isContact = (line: string) => data.contacts.some(contact => line.replace(/\s/g, "").includes(contact.value.replace(/\s/g, "")));
  unrecognized.push(...intro.filter(line => !isContact(line)).slice(2));
  let contactSection = false;
  recognized.forEach(line => {
    const key = getImportSectionKey(line);
    if (key) { contactSection = key === "contact"; return; }
    if (contactSection && line.trim() && !isContact(line)) unrecognized.push(line);
  });
  return { data, unrecognized: [...new Set(unrecognized)] };
}
