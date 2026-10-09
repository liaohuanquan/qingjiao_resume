"use client";

import { useId, type SetStateAction } from "react";
import type { TypographyConfig } from "../lib/resume";
import { applyDensity, currentDensity, densityPresets, fontFamilies, resetTypography, typographyDefaults, type DensityPreset } from "../lib/resume-typography";
import { useAppLocale } from "../hooks/useAppLocale";

type Metric = "fontSize" | "lineHeight" | "nameFontSize" | "headingFontSize" | "paragraphSpacing" | "entrySpacing" | "sectionSpacing";

export function TypographyPanel({ value, onChange }: { value: TypographyConfig; onChange: (value: SetStateAction<TypographyConfig>) => void }) {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  const id = useId();
  const density = currentDensity(value);
  const densityLabels: Record<DensityPreset, string> = { compact: t("紧凑", "Compact"), standard: t("标准", "Standard"), roomy: t("宽松", "Roomy") };
  const control = (key: Metric, label: string, min: number, max: number, step: number, font = false) => {
    const current = value[key] ?? typographyDefaults[key];
    const output = key === "lineHeight" ? current.toFixed(2) : font ? `${(current * 0.75).toFixed(1)} pt` : `${current} px`;
    const change = (delta: number) => onChange(previous => ({ ...previous, [key]: Number(Math.max(min, Math.min(max, (previous[key] ?? typographyDefaults[key]) + delta)).toFixed(2)) }));
    return <div className="space-y-1.5" key={key}>
      <span id={`${id}-${key}`} className="text-xs font-medium text-zinc-500">{label}</span>
      <div role="group" aria-labelledby={`${id}-${key}`} className="flex items-center gap-2">
        <button type="button" aria-label={`${t("减小", "Decrease")} ${label}`} disabled={current <= min} onClick={() => change(-step)} className="h-9 w-9 rounded-lg border border-zinc-200 bg-white disabled:opacity-30">−</button>
        <output className="flex h-9 flex-1 items-center justify-center rounded-lg bg-zinc-50 text-xs tabular-nums">{output}</output>
        <button type="button" aria-label={`${t("增大", "Increase")} ${label}`} disabled={current >= max} onClick={() => change(step)} className="h-9 w-9 rounded-lg border border-zinc-200 bg-white disabled:opacity-30">+</button>
      </div>
    </div>;
  };
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">{t("排版", "Typography")}</h3><button type="button" onClick={() => onChange(resetTypography)} className="text-xs text-zinc-500 underline">{t("重置排版", "Reset typography")}</button></div>
    <fieldset className="space-y-2"><legend className="text-xs font-medium text-zinc-500">{t("密度", "Density")}{density === null && <span className="ml-2">{t("自定义", "Custom")}</span>}</legend>
      <div className="grid grid-cols-3 gap-1">{(Object.keys(densityPresets) as DensityPreset[]).map(preset =>
        <button key={preset} type="button" aria-pressed={density === preset} onClick={() => onChange(previous => applyDensity(previous, preset))}
          className={`rounded-lg border px-2 py-2 text-xs ${density === preset ? "border-zinc-900 bg-zinc-900 text-white" : "border-zinc-200 bg-white text-zinc-600"}`}>{densityLabels[preset]}</button>)}</div>
    </fieldset>
    <label className="block text-xs font-medium text-zinc-500">{t("字体", "Font")}<select value={value.fontFamily} onChange={event => onChange(previous => ({ ...previous, fontFamily: event.target.value }))} className="mt-2 h-9 w-full rounded-lg border border-zinc-300 bg-white px-2 text-sm">
      <option value={fontFamilies.sans}>{t("黑体", "Sans serif")}</option><option value={fontFamilies.serif}>{t("宋体", "Serif")}</option><option value={fontFamilies.mono}>{t("等宽", "Monospace")}</option>
    </select></label>
    {control("fontSize", t("正文字号", "Body size"), 10, 24, 0.5, true)}
    {control("nameFontSize", t("姓名字号", "Name size"), 16, 48, 1, true)}
    {control("headingFontSize", t("标题字号", "Heading size"), 10, 28, 0.5, true)}
    {control("lineHeight", t("行距", "Line height"), 1, 2.5, 0.05)}
    <details className="space-y-3"><summary className="cursor-pointer text-xs font-medium text-zinc-500">{t("间距", "Spacing")}</summary>
      {control("paragraphSpacing", t("段落间距", "Paragraph spacing"), 0, 24, 1)}
      {control("entrySpacing", t("经历间距", "Entry spacing"), 0, 48, 2)}
      {control("sectionSpacing", t("模块间距", "Section spacing"), 0, 48, 2)}
    </details>
  </section>;
}
