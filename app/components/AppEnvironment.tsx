"use client";
import { useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { loadAISettings, resetAI } from "../lib/ai-client";
import { readPreferences, defaultPreferences } from "../lib/preferences";
import { useAppLocale } from "../hooks/useAppLocale";

export function AppEnvironment({ children }: { children: ReactNode }) {
  const { locale } = useAppLocale();
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  useEffect(() => {
    try { loadAISettings(); } catch { resetAI(); }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => {
      let preferences = defaultPreferences;
      try { preferences = readPreferences(); } catch { /* Keep the broken value available for recovery. */ }
      document.documentElement.dataset.theme = preferences.theme === "system" ? (media.matches ? "dark" : "light") : preferences.theme;
      document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion);
      setReduceMotion(preferences.reduceMotion);
    };
    update();
    media.addEventListener("change", update);
    window.addEventListener("app-preferences-change", update);
    window.addEventListener("storage", update);
    return () => { media.removeEventListener("change", update); window.removeEventListener("app-preferences-change", update); window.removeEventListener("storage", update); };
  }, []);
  return <MotionConfig reducedMotion={reduceMotion ? "always" : "user"}><div className="app-surface">{children}</div></MotionConfig>;
}
