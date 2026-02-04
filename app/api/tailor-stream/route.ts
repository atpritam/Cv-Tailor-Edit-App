import { NextRequest } from "next/server";
import {
  generateContentStreaming,
  generateContentWithRetry,
} from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";
import { createAnalysisPrompt, createHtmlPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  const extractFirstJson = (text: string): string | null => {
    if (!text) return null;
    text = text.replace(/```\w*\n?|```/g, "");

    // find first JSON start char (object or array)
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let start = -1;
    if (firstBrace === -1 && firstBracket === -1) return null;
    if (firstBrace === -1) start = firstBracket;
    else if (firstBracket === -1) start = firstBrace;
    else start = Math.min(firstBrace, firstBracket);

    const startChar = text[start];
    const endChar = startChar === "{" ? "}" : "]";

    let inString = false;
    let escape = false;
    let depth = 0;
    for (let i = start; i < text.length; i++) {
      const ch = text[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === "\\") {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === startChar) depth++;
      else if (ch === endChar) {
        depth--;
        if (depth === 0) {
          let candidate = text.substring(start, i + 1);
          // sanitize common non-json extras: remove trailing commas before ] or }
          candidate = candidate.replace(/,\s*([}\]])/g, "$1");
          return candidate;
        }
      }
    }
    return null;
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isControllerClosed = false;

      const safeEnqueue = (data: string) => {
        if (!isControllerClosed) {
          controller.enqueue(encoder.encode(data));
        }
      };

      const safeClose = () => {
        if (!isControllerClosed) {
          controller.close();
          isControllerClosed = true;
        }
      };

      try {
        const { jobDescription, resumeText } = await request.json();

        if (!jobDescription?.trim()) {
          safeEnqueue(
            `data: ${JSON.stringify({ error: "Job description required" })}\n\n`,
          );
          safeClose();
          return;
        }

        if (!resumeText?.trim()) {
          safeEnqueue(
            `data: ${JSON.stringify({ error: "Resume required" })}\n\n`,
          );
          safeClose();
          return;
        }

        safeEnqueue(
          `data: ${JSON.stringify({ type: "started", message: "Analysis started" })}\n\n`,
        );

        let lastAnalysisSent = 0;

        // Start analysis
        const streamAnalysis = generateContentStreaming(
          createAnalysisPrompt(jobDescription, resumeText),
          (chunk, accumulated) => {
            const now = Date.now();
            // Send updates every 120ms to avoid ui re-render overload
            if (now - lastAnalysisSent > 120) {
              try {
                const jsonStr = extractFirstJson(accumulated);
                if (jsonStr) {
                  const parsed = JSON.parse(jsonStr);
                  safeEnqueue(
                    `data: ${JSON.stringify({ type: "analysis_partial", data: parsed })}\n\n`,
                  );
                  lastAnalysisSent = now;
                }
              } catch (error: any) {
                // Ignore parse errors during streaming
              }
            }
          },
          async (fullText) => {
            try {
              const jsonStr = extractFirstJson(fullText);
              if (jsonStr) {
                const parsed = JSON.parse(jsonStr);
                safeEnqueue(
                  `data: ${JSON.stringify({ type: "analysis_complete", data: parsed })}\n\n`,
                );
              }
            } catch (err: any) {
              console.error(
                "Analysis parse error:",
                err?.message || String(err),
              );

              // Emit retry event
              safeEnqueue(
                `data: ${JSON.stringify({ type: "analysis_retrying" })}\n\n`,
              );

              try {
                // Retry synchronously
                const retryText = await generateContentWithRetry(
                  createAnalysisPrompt(jobDescription, resumeText),
                  [],
                  2,
                );
                const retryJson = extractFirstJson(retryText);
                if (retryJson) {
                  const parsedRetry = JSON.parse(retryJson);
                  safeEnqueue(
                    `data: ${JSON.stringify({ type: "analysis_complete", data: parsedRetry })}\n\n`,
                  );
                } else {
                  throw new Error("Failed to extract JSON from retry response");
                }
              } catch (retryErr) {
                console.error("Analysis retry failed:", retryErr);
                safeEnqueue(
                  `data: ${JSON.stringify({ type: "error", error: "Failed to generate analysis after retry" })}\n\n`,
                );
              }
            }
          },
        );

        // Small delay before starting HTML generation
        await new Promise((resolve) => setTimeout(resolve, 1010));

        const generateHtml = generateContentWithRetry(
          createHtmlPrompt(jobDescription, resumeText),
          [],
          2,
        );

        const [, htmlText] = await Promise.all([streamAnalysis, generateHtml]);

        try {
          const jsonStr = extractFirstJson(htmlText);
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            try {
              const processedHtml = await processHtmlResponse(
                parsed.tailoredResumeHtml,
              );

              safeEnqueue(
                `data: ${JSON.stringify({
                  type: "html_complete",
                  data: {
                    tailoredResumeHtml:
                      processedHtml || parsed.tailoredResumeHtml,
                    improvements: parsed.improvements,
                  },
                })}\n\n`,
              );
            } catch (procErr) {
              console.error(
                "HTML processing failed, sending raw HTML:",
                procErr,
              );
              safeEnqueue(
                `data: ${JSON.stringify({
                  type: "html_complete",
                  data: {
                    tailoredResumeHtml: parsed.tailoredResumeHtml,
                    improvements: parsed.improvements,
                  },
                })}\n\n`,
              );
            }
          }
        } catch (err: any) {
          console.error("HTML parse error:", err?.message || String(err));
          safeEnqueue(
            `data: ${JSON.stringify({ type: "error", error: "Failed to generate resume HTML" })}\n\n`,
          );
        }

        // Send final completion signal
        safeEnqueue(
          `data: ${JSON.stringify({
            type: "complete",
            data: { jobDescription, originalProvided: true },
          })}\n\n`,
        );

        safeClose();
      } catch (error: any) {
        console.error("Stream error:", error);
        safeEnqueue(
          `data: ${JSON.stringify({
            type: "error",
            error: error.message || "Processing failed",
          })}\n\n`,
        );
        safeClose();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
