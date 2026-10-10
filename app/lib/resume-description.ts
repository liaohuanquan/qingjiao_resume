export type DescriptionBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; start: number; items: string[] };

export function descriptionBlocks(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let list: Extract<DescriptionBlock, { type: "list" }> | null = null;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) { list = null; continue; }
    const bullet = line.match(/^\s*(?:[-*+•]\s+|(\d+)[.)、]\s+)(.+)$/);
    if (!bullet) { list = null; blocks.push({ type: "paragraph", text: line }); continue; }
    const ordered = bullet[1] !== undefined;
    const start = ordered ? Number(bullet[1]) : 1;
    if (!Number.isSafeInteger(start)) { list = null; blocks.push({ type: "paragraph", text: line }); continue; }
    if (!list || list.ordered !== ordered || (ordered && start !== list.start + list.items.length)) {
      list = { type: "list", ordered, start, items: [] };
      blocks.push(list);
    }
    list.items.push(bullet[2]);
  }
  return blocks;
}

export function webLink(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch { return null; }
}

export type DescriptionEdit = { text: string; start: number; end: number };

export function boldDescription(text: string, start: number, end: number): DescriptionEdit {
  const selected = text.slice(start, end);
  const listPrefix = /^(\s*(?:[-*+•]|\d+[.)、])\s+)/;
  if (selected.includes("\n") || listPrefix.test(selected)) {
    const lines = selected.split("\n");
    const contents = lines.filter(line => line.trim()).map(line => line.replace(listPrefix, ""));
    const remove = contents.length > 0 && contents.every(line => line.startsWith("**") && line.endsWith("**") && line.length >= 4);
    const replacement = lines.map(line => {
      if (!line.trim()) return line;
      const prefix = line.match(listPrefix)?.[0] || "";
      const content = line.slice(prefix.length);
      if (!content.trim()) return line;
      const alreadyBold = content.startsWith("**") && content.endsWith("**") && content.length >= 4;
      return prefix + (remove ? content.slice(2, -2) : alreadyBold ? content : `**${content}**`);
    }).join("\n");
    return { text: text.slice(0, start) + replacement + text.slice(end), start, end: start + replacement.length };
  }
  if (selected.startsWith("**") && selected.endsWith("**") && selected.length >= 4) {
    const replacement = selected.slice(2, -2);
    return { text: text.slice(0, start) + replacement + text.slice(end), start, end: start + replacement.length };
  }
  if (text.slice(Math.max(0, start - 2), start) === "**" && text.slice(end, end + 2) === "**") {
    return { text: text.slice(0, start - 2) + selected + text.slice(end + 2), start: start - 2, end: end - 2 };
  }
  return { text: text.slice(0, start) + `**${selected}**` + text.slice(end), start: start + 2, end: end + 2 };
}

export function bulletDescription(text: string, start: number, end: number): DescriptionEdit {
  const first = start === 0 ? 0 : text.lastIndexOf("\n", start - 1) + 1;
  const effectiveEnd = end > start && text[end - 1] === "\n" ? end - 1 : end;
  const nextLine = text.indexOf("\n", effectiveEnd);
  const last = nextLine === -1 ? text.length : nextLine;
  const original = text.slice(first, last);
  const lines = original.split("\n");
  const nonempty = lines.filter(line => line.trim());
  const remove = nonempty.length > 0 && nonempty.every(line => /^\s*[-*+•]\s+/.test(line));
  const replacement = lines.map(line => {
    if (!line.trim() && nonempty.length) return line;
    const indent = line.match(/^\s*/)?.[0] || "";
    const content = line.slice(indent.length).replace(/^(?:[-*+•]|\d+[.)、])\s+/, "");
    return indent + (remove ? "" : "- ") + content;
  }).join("\n");
  const result = text.slice(0, first) + replacement + text.slice(last);
  const caret = Math.max(first, Math.min(first + replacement.length, start + replacement.length - original.length));
  return { text: result, start: start === end ? caret : first, end: start === end ? caret : first + replacement.length };
}

export function linkDescription(text: string, start: number, end: number, label: string, href: string): DescriptionEdit {
  // Escape link delimiters, preserve inline bold, and keep URL parentheses inside the URL.
  const title = label.replace(/[\\\[\]()]/g, character => `\\${character}`);
  const url = href.replace(/[()]/g, character => character === "(" ? "%28" : "%29");
  const replacement = `[${title}](${url})`;
  return { text: text.slice(0, start) + replacement + text.slice(end), start, end: start + replacement.length };
}
