"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import Cropper, { type Area } from "react-easy-crop";
import { useAppLocale } from "../hooks/useAppLocale";
import { useModalFocus } from "../hooks/useModalFocus";
import { cropAvatar } from "../lib/resume-avatar";

export function AvatarCropDialog({ image, onApply, onClose }: { image: string; onApply: (avatar: string, aspect: number) => void; onClose: () => void }) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState(1);
  const [area, setArea] = useState<Area | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const active = useRef<AbortController | null>(null);
  const cancel = useCallback(() => { active.current?.abort(); active.current = null; }, []);
  useEffect(() => cancel, [cancel]);
  const close = useCallback(() => { cancel(); onClose(); }, [cancel, onClose]);
  useModalFocus(true, close, "[data-avatar-crop]");
  const apply = async () => {
    if (!area || pending || active.current) return;
    const controller = new AbortController();
    active.current = controller;
    setPending(true); setError("");
    try {
      const result = await cropAvatar(image, area, controller.signal);
      if (active.current !== controller || controller.signal.aborted) return;
      onApply(result, aspect);
      close();
    } catch {
      if (active.current === controller && !controller.signal.aborted) setError(t("图片处理失败，请重新选择", "Cannot process image. Choose another file."));
    } finally {
      if (active.current === controller) { active.current = null; setPending(false); }
    }
  };
  const move = (value: { x: number; y: number }) => { if (value.x === crop.x && value.y === crop.y) return; setArea(null); setCrop(value); };
  const resize = (value: number) => { if (value === zoom) return; setArea(null); setZoom(value); };
  return <motion.div data-avatar-crop role="dialog" aria-modal="true" aria-label={t("头像裁剪", "Crop avatar")} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
    <div className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-100 p-5"><h2 className="text-lg font-bold">{t("头像裁剪", "Crop avatar")}</h2><button type="button" aria-label={t("关闭", "Close")} onClick={close} className="rounded-lg p-2 text-zinc-500"><X size={20} /></button></header>
      {error && <p role="alert" className="px-5 pt-4 text-sm text-red-600">{error}</p>}
      <div className={`relative h-[min(400px,45dvh)] shrink-0 bg-zinc-900 ${pending ? "pointer-events-none" : ""}`} inert={pending || undefined}>
        <Cropper image={image} crop={crop} zoom={zoom} aspect={aspect} onCropChange={move} onZoomChange={resize} onCropComplete={(_, pixels) => setArea(Object.values(pixels).every(Number.isFinite) && pixels.width > 0 && pixels.height > 0 ? pixels : null)} onMediaLoaded={size => { if (size.naturalWidth && size.naturalHeight) setError(""); else { setArea(null); setError(t("图片无法读取", "Cannot load image")); } }} mediaProps={{ onError: () => { setArea(null); setError(t("图片无法读取", "Cannot load image")); } }} />
      </div>
      <div className="space-y-5 p-5">
        <fieldset disabled={pending} className="space-y-2"><legend className="mb-2 text-xs font-medium text-zinc-500">{t("宽高比", "Aspect ratio")}</legend><div className="grid grid-cols-3 gap-3">{[{ label: "1:1", value: 1 }, { label: "3:4", value: 3 / 4 }, { label: "4:3", value: 4 / 3 }].map(ratio => <button key={ratio.value} type="button" aria-pressed={aspect === ratio.value} onClick={() => { if (ratio.value === aspect) return; setArea(null); setAspect(ratio.value); }} className={`rounded-lg border px-3 py-2 text-sm ${aspect === ratio.value ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200"}`}>{ratio.label}</button>)}</div></fieldset>
        <label className="block space-y-2 text-sm"><span>{t("缩放", "Zoom")} {Math.round(zoom * 100)}%</span><input type="range" disabled={pending} value={zoom} min={1} max={3} step={0.1} onChange={event => resize(Number(event.target.value))} className="w-full accent-zinc-900" /></label>
        <div className="flex justify-end gap-3"><button type="button" onClick={close} className="rounded-xl border px-4 py-2 text-sm">{t("取消", "Cancel")}</button><button type="button" onClick={apply} disabled={pending || !area || Boolean(error)} className="flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-50"><Check size={16} />{pending ? t("处理中", "Processing") : t("应用头像", "Apply avatar")}</button></div>
      </div>
    </div>
  </motion.div>;
}
