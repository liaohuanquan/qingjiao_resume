"use client";

import { useCallback, useSyncExternalStore } from "react";

export type AppLocale = "zh-CN" | "en-US";

const APP_LOCALE_KEY = "app_locale";
const APP_LOCALE_EVENT = "app-locale-change";
let sessionLocale: AppLocale = "zh-CN";
let temporaryLocale: AppLocale | null = null;

function normalizeLocale(value: string | null): AppLocale {
  return value === "en-US" ? "en-US" : "zh-CN";
}

function subscribeLocale(onStoreChange: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === APP_LOCALE_KEY) {
      onStoreChange();
    }
  };
  const handleLocaleChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(APP_LOCALE_EVENT, handleLocaleChange);
  const timer = window.setTimeout(onStoreChange, 0);
  return () => {
    window.clearTimeout(timer);
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(APP_LOCALE_EVENT, handleLocaleChange);
  };
}

function getLocaleSnapshot() {
  if (temporaryLocale) return temporaryLocale;
  try { const stored = localStorage.getItem(APP_LOCALE_KEY); return stored === null ? sessionLocale : normalizeLocale(stored); }
  catch { return sessionLocale; }
}

export const getCurrentLocale = getLocaleSnapshot;

function getServerLocaleSnapshot() {
  return "zh-CN" as AppLocale;
}

export function resetLocale() {
  sessionLocale = "zh-CN";
  temporaryLocale = null;
  window.dispatchEvent(new Event(APP_LOCALE_EVENT));
}

export function useAppLocale() {
  const locale = useSyncExternalStore(
    subscribeLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  const setLocale = useCallback((nextLocale: AppLocale) => {
    sessionLocale = nextLocale;
    try { localStorage.setItem(APP_LOCALE_KEY, nextLocale); temporaryLocale = null; }
    catch { temporaryLocale = nextLocale; }
    window.dispatchEvent(
      new CustomEvent<AppLocale>(APP_LOCALE_EVENT, { detail: nextLocale }),
    );
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "zh-CN" ? "en-US" : "zh-CN");
  }, [locale, setLocale]);

  return { locale, setLocale, toggleLocale };
}
