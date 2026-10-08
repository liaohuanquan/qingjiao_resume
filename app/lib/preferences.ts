export interface Preferences { theme: "light" | "dark" | "system"; reduceMotion: boolean }
export const defaultPreferences: Preferences = { theme: "system", reduceMotion: false };
export function readPreferences(): Preferences {
  const raw = localStorage.getItem("app_preferences");
  if (!raw) return defaultPreferences;
  const value = JSON.parse(raw);
  if (!value || !["light", "dark", "system"].includes(value.theme) || typeof value.reduceMotion !== "boolean") throw new Error("invalid preferences");
  return { theme: value.theme, reduceMotion: value.reduceMotion };
}
export function savePreferences(value: Preferences) {
  localStorage.setItem("app_preferences", JSON.stringify(value));
  window.dispatchEvent(new Event("app-preferences-change"));
}
