/**
 * Refine API Route - Diff-based edit change
 */

import { NextRequest, NextResponse } from "next/server";
import { generateRefineDiffPrompt } from "@/lib/prompts";
import { generateContentWithRetry } from "@/services/gen-ai";
import { applyHtmlDiff } from "@/lib/html-diff-processor";
import { ChatMessage } from "@/lib/types";

export async function POST(request: NextRequest) {
  console.log("Refine API route hit:", request.method, request.url);
  try {
    const {
      userMessage,
      chatHistory,
      currentResumeHtml,
      originalTailoredHtml,
      jobDescription,
    }: {
      userMessage: string;
      chatHistory?: ChatMessage[];
      currentResumeHtml: string;
      originalTailoredHtml?: string;
      jobDescription?: string;
    } = await request.json();

    if (!userMessage?.trim()) {
      return NextResponse.json(
        { error: "User message is required" },
        { status: 400 },
      );
    }

    if (!currentResumeHtml?.trim()) {
      return NextResponse.json(
        { error: "Current resume HTML is required" },
        { status: 400 },
      );
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      return NextResponse.json(
        { error: "GOOGLE_AI_API_KEY environment variable is not set" },
        { status: 500 },
      );
    }

    const prompt = generateRefineDiffPrompt({
      userMessage,
      currentResumeHtml,
      originalTailoredHtml,
      jobDescription,
    });

    const text = await generateContentWithRetry(prompt, chatHistory, 3, true);

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
      }
    }

    try {
      const parsed = JSON.parse(jsonStr);
      console.log("Refine API parsed response:", parsed);

      // Apply the HTML block changes
      const updatedHtml = await applyHtmlDiff(
        currentResumeHtml,
        parsed.blocks || [],
      );

      return NextResponse.json({
        updatedHtml,
        chatResponse: parsed.chatResponse || "Changes applied successfully.",
        blocks: parsed.blocks || [],
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
    console.error("Refine API Error:", error);
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
