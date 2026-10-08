"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { complete, type AIMessage } from "../lib/ai-client";

export function useAIRequest(locale: string) {
  const active = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const cancel = useCallback(() => active.current?.abort(), []);
  useEffect(() => cancel, [cancel]);
  const request = useCallback(async (messages: AIMessage[]) => {
    if (active.current) throw new Error(locale === "en-US" ? "Another request is running." : "已有请求进行中");
    const controller = new AbortController();
    active.current = controller;
    setPending(true);
    let timedOut = false;
    const timer = window.setTimeout(() => { timedOut = true; controller.abort(); }, 60000);
    try {
      const result = await complete(messages, controller.signal, locale);
      if (controller.signal.aborted) throw new Error("aborted");
      return result;
    } catch (error) {
      if (controller.signal.aborted) throw new Error(locale === "en-US" ? (timedOut ? "Request timed out." : "Request cancelled.") : (timedOut ? "请求超时" : "已取消"));
      throw error;
    } finally { clearTimeout(timer); active.current = null; setPending(false); }
  }, [locale]);
  return { request, pending, cancel };
}
