"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { ResumeConfig } from "../lib/resume";
import { PAPER_HEIGHT, PAPER_WIDTH } from "../lib/resume-layout";
import { ResumeDocument } from "./ResumeDocument";

export function ResumePreview({ config, thumbnail = false }: { config: ResumeConfig; thumbnail?: boolean }) {
  const container = useRef<HTMLDivElement>(null);
  const document = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ scale: 0.3, height: PAPER_HEIGHT });
  useLayoutEffect(() => {
    const root = container.current;
    const paper = document.current;
    if (!root || !paper) return;
    const resize = () => {
      const scale = Math.min(1, Math.max(0.01, root.clientWidth / PAPER_WIDTH));
      const height = Math.max(PAPER_HEIGHT, paper.scrollHeight);
      setSize(previous => previous.scale === scale && previous.height === height ? previous : { scale, height });
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(root);
    observer.observe(paper);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={container} aria-hidden={thumbnail || undefined} className={`relative w-full ${thumbnail ? "aspect-[210/297] overflow-hidden" : "overflow-hidden"}`} style={thumbnail ? undefined : { height: size.height * size.scale }}>
      <div inert={thumbnail || undefined} className={thumbnail ? "pointer-events-none" : undefined} style={{ width: PAPER_WIDTH, transform: `scale(${size.scale})`, transformOrigin: "top left" }}>
        <ResumeDocument ref={document} config={config} interactiveLinks={false} avatarAlt="" />
      </div>
    </div>
  );
}
