import { NextRequest, NextResponse } from "next/server";
import { generateTailorPrompt } from "@/lib/prompts";
import { generateContentWithRetry } from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";

export async function POST(request: NextRequest) {
  try {
    const { jobDescription, resumeText } = await request.json();

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Job description required" },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json({ error: "API key not set" }, { status: 500 });
    }

    const prompt = generateTailorPrompt({
      jobDescription,
      resumeText,
    });

    const text = await generateContentWithRetry(prompt, 2);

    let jsonStr = text
      .trim()
      .replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1")
      .trim();

    const parsed = JSON.parse(jsonStr);

    if (parsed.tailoredResumeHtml) {
      parsed.tailoredResumeHtml = processHtmlResponse(
        parsed.tailoredResumeHtml,
      );
    }

    return NextResponse.json({
      ...parsed,
      originalProvided: !!resumeText?.trim(),
      jobDescription,
    });
  } catch (error: any) {
    console.error("Tailor API Error:", error);

    const isRateLimit = /429|quota|exhausted/i.test(String(error));
    const message = isRateLimit
      ? "Rate limit reached. Please wait 30s and retry."
      : "Processing failed. Please retry.";

    return NextResponse.json(
      { error: message },
      { status: isRateLimit ? 429 : 500 },
    );
  }
}
