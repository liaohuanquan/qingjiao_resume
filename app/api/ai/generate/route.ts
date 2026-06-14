type GenerateType = "work" | "project";

interface GenerateRequest {
  type?: GenerateType;
  company?: string;
  projectName?: string;
  role?: string;
  date?: string;
  skills?: string[];
}

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

  let body: GenerateRequest;
  try {
    body = (await request.json()) as GenerateRequest;
  } catch {
    return Response.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  if (body.type !== "work" && body.type !== "project") {
    return Response.json({ error: "不支持的生成类型" }, { status: 400 });
  }

  const title =
    body.type === "work"
      ? `${body.company || "未填写公司"} / ${body.role || "未填写岗位"}`
      : `${body.projectName || "未填写项目"} / ${body.role || "未填写职责"}`;
  const skills = body.skills?.filter(Boolean).join("、") || "未填写";

  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [
        {
          role: "system",
          content:
            "你是中文简历撰写助手。只返回 2-4 条简历描述正文，不要解释，不要添加 Markdown 代码块。",
        },
        {
          role: "user",
          content: [
            `类型：${body.type === "work" ? "工作经历" : "项目经验"}`,
            `对象：${title}`,
            `时间：${body.date || "未填写"}`,
            `技术栈/关键词：${skills}`,
            "要求：使用中文；不要虚构公司、项目、指标；没有明确数字时使用偏保守表达；每条以短句呈现。",
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
