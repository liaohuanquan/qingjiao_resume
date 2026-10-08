export interface AISettings { baseUrl: string; model: string }
export interface AIMessage { role: "system" | "user"; content: string }
let settings: AISettings = { baseUrl: "", model: "" };
let sessionKey = "";
let revision = 0;
const listeners = new Set<() => void>();
function notify() { revision++; listeners.forEach(listener => listener()); }
export function subscribeAI(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
export function aiRevision() { return revision; }
export function getAISettings() { return settings; }
export function hasSessionKey() { return Boolean(sessionKey); }
export function setSessionKey(key: string) { sessionKey = key.trim(); notify(); }
export function resetAI() { settings = { baseUrl: "", model: "" }; sessionKey = ""; notify(); }

export function loadAISettings() {
  const legacy = localStorage.getItem("ai_providers");
  // Discard persisted keys before parsing or migrating legacy provider drafts.
  if (legacy !== null) localStorage.removeItem("ai_providers");
  const stored = localStorage.getItem("ai_settings");
  let source: unknown = null;
  if (stored !== null) source = JSON.parse(stored);
  else if (legacy !== null) {
    try {
      const providers: unknown = JSON.parse(legacy);
      if (Array.isArray(providers)) source = providers.find(item => item?.isActive) || providers[0];
    } catch { /* A corrupt legacy draft must never restore a key. */ }
  }
  if (source && typeof source === "object") {
    const item = source as Record<string, unknown>;
    settings = { baseUrl: typeof item.baseUrl === "string" ? item.baseUrl : "", model: typeof item.model === "string" ? item.model : "" };
    localStorage.setItem("ai_settings", JSON.stringify(settings));
  }
  notify();
  return settings;
}
export function saveAISettings(value: AISettings) {
  const next = { baseUrl: value.baseUrl.trim(), model: value.model.trim() };
  if (next.baseUrl) endpoint(next.baseUrl);
  localStorage.setItem("ai_settings", JSON.stringify(next));
  settings = next; notify();
}
function endpoint(baseUrl: string) {
  const url = new URL(baseUrl);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("invalid address");
  url.pathname = url.pathname.replace(/\/+$/, "");
  if (!url.pathname.endsWith("/chat/completions")) url.pathname += "/chat/completions";
  return url.href;
}

export async function complete(messages: AIMessage[], signal: AbortSignal, locale: string) {
  const english = locale === "en-US";
  const text = (zh: string, en: string) => english ? en : zh;
  if (!settings.baseUrl || !settings.model || !sessionKey) throw new Error(text("请先填写 AI 设置和密钥", "Enter AI settings and a session key first."));
  let url: string;
  try { url = endpoint(settings.baseUrl); } catch { throw new Error(text("服务地址无效", "Invalid service address.")); }
  let response: Response;
  try {
    response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${sessionKey}`, "Content-Type": "application/json" }, credentials: "omit", redirect: "error", signal, body: JSON.stringify({ model: settings.model, messages, temperature: 0.3, stream: false }) });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error(text("请求失败，请检查网络或跨域配置", "Request failed. Check network or CORS settings."));
  }
  if (response.status === 401 || response.status === 403) throw new Error(text("密钥或模型权限无效", "Invalid key or model access."));
  if (response.status === 429) throw new Error(text("额度不足或请求过多", "Quota exhausted or too many requests."));
  if (!response.ok) throw new Error(text(`服务请求失败（${response.status}）`, `Service request failed (${response.status}).`));
  let data: { choices?: { message?: { content?: unknown } }[] };
  try { data = await response.json(); } catch { throw new Error(text("服务响应格式无效", "Invalid service response.")); }
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error(text("服务未返回有效内容", "Service returned no content."));
  return content.trim();
}
