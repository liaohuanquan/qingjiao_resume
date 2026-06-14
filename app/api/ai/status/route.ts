export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    baseUrl: process.env.AI_BASE_URL || "https://api.openai.com/v1",
    model: process.env.AI_MODEL || "gpt-4o-mini",
    hasApiKey: Boolean(process.env.AI_API_KEY),
  });
}
