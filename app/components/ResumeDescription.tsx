import type { ReactNode } from "react";
import { descriptionBlocks, webLink } from "../lib/resume-description";

function inlineText(text: string, interactive: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Only escaped characters, **bold**, and [text](http(s) URL) are interpreted.
  const tokens = /\\([\\*\[\]()])|\*\*((?:\\.|[^*\\])+?)\*\*|\[((?:\\.|[^\]\\])*)\]\((https?:\/\/(?:[^\s()]|\([^\s()]*\))+)\)/g;
  let cursor = 0;
  for (const match of text.matchAll(tokens)) {
    const index = match.index ?? 0;
    nodes.push(text.slice(cursor, index));
    if (match[1] !== undefined) nodes.push(match[1]);
    else if (match[2] !== undefined) nodes.push(<strong key={index}>{inlineText(match[2], interactive)}</strong>);
    else {
      const href = text[index - 1] === "!" ? null : webLink(match[4]);
      const title = inlineText(match[3], false);
      nodes.push(!href ? match[0] : interactive
        ? <a key={index} href={href}>{title}</a>
        : <span key={index} className="resume-link">{title}</span>);
    }
    cursor = index + match[0].length;
  }
  nodes.push(text.slice(cursor));
  return nodes;
}

export function ResumeDescription({ text, interactive = true }: { text: string; interactive?: boolean }) {
  return <div className="resume-description">{descriptionBlocks(text).map((block, index) => {
    if (block.type === "paragraph") return <p key={index}>{inlineText(block.text, interactive)}</p>;
    const items = block.items.map((item, i) => <li key={i}>{inlineText(item, interactive)}</li>);
    return block.ordered ? <ol key={index} start={block.start}>{items}</ol> : <ul key={index}>{items}</ul>;
  })}</div>;
}
