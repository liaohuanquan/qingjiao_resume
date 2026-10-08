"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAppLocale } from "../../hooks/useAppLocale";
import { useAIRequest } from "../../hooks/useAIRequest";
import { aiRevision, getAISettings, hasSessionKey, loadAISettings, saveAISettings, setSessionKey, subscribeAI } from "../../lib/ai-client";

export default function AIPage() {
  const { locale } = useAppLocale();
  const t = (zh: string, en: string) => locale === "en-US" ? en : zh;
  useSyncExternalStore(subscribeAI, aiRevision, () => 0);
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const request = useAIRequest(locale);
  useEffect(() => {
    try { const settings = loadAISettings(); setBaseUrl(settings.baseUrl); setModel(settings.model); }
    catch { setError(locale === "en-US" ? "Unable to read AI settings." : "AI 设置读取失败"); }
  }, [locale]);
  const save = () => {
    try {
      if (!baseUrl.trim() || !model.trim()) { setError(t("请填写服务地址和模型", "Enter a service address and model.")); return false; }
      saveAISettings({ baseUrl, model });
      if (keyInput.trim()) { setSessionKey(keyInput); setKeyInput(""); }
      setStatus(t("已保存", "Saved")); setError(""); return true;
    } catch { setStatus(""); setError(t("保存失败，请检查地址和存储", "Save failed. Check address and storage.")); return false; }
  };
  const check = async () => {
    if (!save()) return;
    setStatus("");
    try { await request.request([{ role: "user", content: "Reply only OK." }]); setStatus(t("连接可用", "Connection available")); }
    catch (error) { setError(error instanceof Error ? error.message : t("请求失败", "Request failed")); }
  };
  const saved = getAISettings();
  return <main className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-12"><div className="mx-auto max-w-3xl space-y-6"><h1 className="text-3xl font-bold">{t("AI 设置", "AI settings")}</h1><form onSubmit={event => { event.preventDefault(); save(); }} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6">
    <label className="block text-sm font-medium">{t("服务地址", "Service address")}<input type="url" required disabled={request.pending} value={baseUrl} onChange={event => { setBaseUrl(event.target.value); setStatus(""); }} placeholder="https://example.com/v1" className="mt-2 w-full rounded-xl border bg-zinc-50 p-3" /></label>
    <label className="block text-sm font-medium">{t("模型", "Model")}<input required disabled={request.pending} value={model} onChange={event => { setModel(event.target.value); setStatus(""); }} className="mt-2 w-full rounded-xl border bg-zinc-50 p-3" /></label>
    <label className="block text-sm font-medium">{t("会话密钥", "Session key")}<input type="password" autoComplete="off" disabled={request.pending} value={keyInput} onChange={event => { setKeyInput(event.target.value); setStatus(""); }} placeholder={hasSessionKey() ? t("已设置，输入可替换", "Set; enter to replace") : ""} className="mt-2 w-full rounded-xl border bg-zinc-50 p-3" /></label>
    <p className="text-xs text-zinc-500">{t("密钥刷新后失效，服务须支持跨域请求", "Key expires on refresh. The service must allow browser CORS requests.")}</p><p className="text-xs text-zinc-500">{t("仅支持 OpenAI-compatible 接口", "OpenAI-compatible endpoints only")}</p>
    <div className="flex flex-wrap gap-3"><button disabled={request.pending} type="submit" className="rounded-xl bg-zinc-900 px-5 py-3 text-sm text-white disabled:opacity-50">{t("保存", "Save")}</button><button disabled={request.pending} type="button" onClick={check} className="rounded-xl border px-5 py-3 text-sm disabled:opacity-50">{t("测试连接", "Check connection")}</button>{request.pending && <button type="button" onClick={request.cancel} className="rounded-xl border px-5 py-3 text-sm">{t("取消请求", "Cancel request")}</button>}{hasSessionKey() && <button type="button" disabled={request.pending} onClick={() => { setSessionKey(""); setKeyInput(""); setStatus(t("密钥已清除", "Key cleared")); }} className="rounded-xl border px-5 py-3 text-sm">{t("清除密钥", "Clear key")}</button>}</div>
    <p role="status" className="text-sm">{request.pending ? t("连接中", "Connecting") : status || (saved.baseUrl && saved.model && hasSessionKey() ? t("就绪", "Ready") : t("待配置", "Not configured"))}</p>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form></div></main>;
}
