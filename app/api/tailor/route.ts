import { NextRequest, NextResponse } from "next/server";
import { generatePrompt, generateChatPrompt } from "@/lib/prompts";
import { generateContentWithRetry } from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";

export async function POST(request: NextRequest) {
  console.log("API route hit:", request.method, request.url);
  try {
    const {
      jobDescription,
      resumeText,
      linkedin,
      github,
      chatHistory,
      originalResumeHtml,
    } = await request.json();

    if (!jobDescription?.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY environment variable is not set" },
        { status: 500 },
      );
    }

    const prompt = chatHistory
      ? generateChatPrompt(chatHistory, resumeText, originalResumeHtml)
      : generatePrompt({
          jobDescription,
          resumeText,
          linkedin,
          github,
        });

    const text = await generateContentWithRetry(prompt, 3);

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
    }

    try {
      const parsed = JSON.parse(jsonStr);

      if (
        parsed.tailoredResumeHtml &&
        typeof parsed.tailoredResumeHtml === "string"
      ) {
        parsed.tailoredResumeHtml = processHtmlResponse(
          parsed.tailoredResumeHtml,
        );
      }

      return NextResponse.json({
        ...parsed,
        originalProvided: resumeText?.trim(),
        chatResponse: parsed.chatResponse || undefined,
      });
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text);
      console.error("Parse error:", parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("API Error:", error);
    const status = error?.status || error?.response?.status;
    const isRateLimit =
      status === 429 ||
      /429|Too Many Requests|Resource exhausted/i.test(String(error));
    const message = isRateLimit
      ? "Rate limit reached: the AI service is busy. Please try again shortly."
      : "Failed to process your request. Please try again.";

    return NextResponse.json(
      { error: message },
      { status: isRateLimit ? 429 : 500 },
    );
  }
}
