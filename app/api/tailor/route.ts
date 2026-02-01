import { NextRequest, NextResponse } from "next/server";
import { generatePrompt, generateChatPrompt } from "@/lib/prompts";
import { generateContentWithRetry } from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";
import fs from "fs";
import path from "path";

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

    const resumeStyles = fs.readFileSync(
      path.join(process.cwd(), "public", "resume-styles.css"),
      "utf-8",
    );

    const prompt = chatHistory
      ? generateChatPrompt(
          chatHistory,
          resumeText,
          resumeStyles,
          originalResumeHtml,
        )
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
        let finalHtml = processHtmlResponse(parsed.tailoredResumeHtml);

        if (parsed.resumeCss && typeof parsed.resumeCss === "string") {
          const styleTag = `<style>${parsed.resumeCss}</style>`;
          const headCloseTagIndex = finalHtml.indexOf("</head>");
          if (headCloseTagIndex !== -1) {
            finalHtml =
              finalHtml.substring(0, headCloseTagIndex) +
              styleTag +
              finalHtml.substring(headCloseTagIndex);
          } else {
            const bodyOpenTagIndex = finalHtml.indexOf("<body");
            if (bodyOpenTagIndex !== -1) {
              const insertIndex = finalHtml.indexOf(">", bodyOpenTagIndex) + 1;
              finalHtml =
                finalHtml.substring(0, insertIndex) +
                styleTag +
                finalHtml.substring(insertIndex);
            } else {
              finalHtml = styleTag + finalHtml;
            }
          }
        }
        parsed.tailoredResumeHtml = finalHtml;
      }

      return NextResponse.json({
        ...parsed,
        resumeCss: parsed.resumeCss,
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
