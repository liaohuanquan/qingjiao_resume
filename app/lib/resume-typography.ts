import type { TypographyConfig } from "./resume";

export const fontFamilies = {
  sans: "Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  serif: "'Songti SC', SimSun, serif",
  mono: "'SFMono-Regular', Consolas, 'PingFang SC', monospace",
};

// CSS pixels; screen and print consume the same values.
export const typographyDefaults = {
  fontFamily: fontFamilies.sans,
  fontSize: 14.5,
  lineHeight: 1.5,
  nameFontSize: 28,
  headingFontSize: 15.5,
  paragraphSpacing: 4,
  entrySpacing: 12,
  sectionSpacing: 20,
};

export function resetTypography(current: TypographyConfig): TypographyConfig {
  return { ...current, ...typographyDefaults, sectionStyles: {} };
}

// Density changes spacing only; sizes, fonts and skill appearance remain user choices.
export const densityPresets = {
  compact: { lineHeight: 1.35, paragraphSpacing: 2, entrySpacing: 8, sectionSpacing: 14 },
  standard: { lineHeight: 1.5, paragraphSpacing: 4, entrySpacing: 12, sectionSpacing: 20 },
  roomy: { lineHeight: 1.65, paragraphSpacing: 6, entrySpacing: 16, sectionSpacing: 26 },
};
export type DensityPreset = keyof typeof densityPresets;
const densityKeys = ["lineHeight", "paragraphSpacing", "entrySpacing", "sectionSpacing"] as const;

export function currentDensity(current: TypographyConfig): DensityPreset | null {
  if (Object.values(current.sectionStyles ?? {}).some(style => style.spacing !== undefined)) return null;
  return (Object.keys(densityPresets) as DensityPreset[]).find(preset => densityKeys.every(key =>
    (current[key] ?? typographyDefaults[key]) === densityPresets[preset][key])) ?? null;
}

export function applyDensity(current: TypographyConfig, preset: DensityPreset): TypographyConfig {
  if (currentDensity(current) === preset) return current;
  const sectionStyles: NonNullable<TypographyConfig["sectionStyles"]> = {};
  for (const [id, style] of Object.entries(current.sectionStyles ?? {})) {
    if (style.fontSize !== undefined) sectionStyles[id] = { fontSize: style.fontSize };
  }
  return { ...current, ...densityPresets[preset], sectionStyles };
}
