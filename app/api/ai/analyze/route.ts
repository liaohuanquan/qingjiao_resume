type AnalyzeMode = "jd_match" | "score";

interface AnalyzeRequest {
  mode?: AnalyzeMode;
  resumeText?: string;
  jdText?: string;
}

const MODE_PROMPT: Record<AnalyzeMode, string> = {
  jd_match:
    "基于招聘 JD 分析简历匹配度，输出匹配度百分比、命中关键词、缺失关键词、优先修改建议。",
  score:
    "从完整性、量化成果、关键词表达、排版密度四个维度给简历评分，并输出可执行修改建议。",
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

  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return Response.json({ error: "请求体不是有效 JSON" }, { status: 400 });
  }

  const mode = body.mode || "score";
  const resumeText = body.resumeText?.trim();
  const jdText = body.jdText?.trim();

  if (!MODE_PROMPT[mode]) {
    return Response.json({ error: "不支持的分析模式" }, { status: 400 });
  }

  if (!resumeText) {
    return Response.json({ error: "简历内容不能为空" }, { status: 400 });
  }

  if (mode === "jd_match" && !jdText) {
    return Response.json({ error: "JD 内容不能为空" }, { status: 400 });
  }

  const upstream = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "你是中文简历诊断助手。输出结构化中文报告，不要添加 Markdown 代码块。",
        },
        {
          role: "user",
          content: [
            `任务：${MODE_PROMPT[mode]}`,
            "报告格式：先给结论，再列出问题和修改建议。建议必须具体到简历内容。",
            `简历内容：\n${resumeText}`,
            jdText ? `招聘 JD：\n${jdText}` : "",
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
