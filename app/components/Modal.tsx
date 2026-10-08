"use client";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { useModalFocus } from "../hooks/useModalFocus";

export function Modal({ title, close, children, closeLabel = "关闭" }: { title: string; close: () => void; children: ReactNode; closeLabel?: string }) {
  useModalFocus(true, close);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"><div data-modal role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl"><header className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold">{title}</h2><button type="button" aria-label={closeLabel} onClick={close} className="rounded-lg p-2"><X size={18} /></button></header>{children}</div></div>;
}
