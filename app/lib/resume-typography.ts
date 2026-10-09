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
