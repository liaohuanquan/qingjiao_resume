type OptimizeMode = "polish" | "quantify" | "concise";

interface OptimizeRequest {
  text?: string;
  mode?: OptimizeMode;
  context?: string;
}

const MODE_PROMPT: Record<OptimizeMode, string> = {
  polish: "润色表达，提升专业度和清晰度，保留原始事实。",
  quantify: "强化成果表达，尽量改写为可量化的简历条目；没有数据时不要编造数字。",
  concise: "压缩为简历语气，表达更短、更直接，保留核心信息。",
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return Response.json(
      { error: "缺少 AI_API_KEY 环境变量" },
      { status: 500 },
    );
  }

  let body: OptimizeRequest;
  try {
    body = (await request.json()) as OptimizeRequest;
  } catch {
    return Response.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const text = body.text?.trim();
  const mode = body.mode || "polish";

  if (!text) {
    return Response.json({ error: "待优化文本不能为空" }, { status: 400 });
  }

  if (!MODE_PROMPT[mode]) {
    return Response.json({ error: "不支持的优化模式" }, { status: 400 });
  }

  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "你是中文简历优化助手。只返回优化后的正文，不要解释，不要添加 Markdown 代码块。",
        },
        {
          role: "user",
          content: [
            `任务：${MODE_PROMPT[mode]}`,
            `上下文：${body.context || "简历文本"}`,
            "要求：使用中文；保留事实；不要虚构公司、学校、项目、指标。",
            `原文：\n${text}`,
          ].join("\n"),
        },
      ],
    }),
  });

  if (!upstream.ok) {
    return Response.json(
      { error: `AI 服务请求失败：${upstream.status}` },
      { status: 502 },
    );
  }

  const data = await upstream.json();
  const result = data?.choices?.[0]?.message?.content?.trim();

  if (!result) {
    return Response.json({ error: "AI 服务未返回有效内容" }, { status: 502 });
  }

  return Response.json({ result });
}
