import { NextRequest } from "next/server";
import {
  generateContentStreaming,
  generateContentWithRetry,
} from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";
import { HTML_TEMPLATE, RULES, SCORING_CRITERIA } from "@/lib/prompts";

const createAnalysisPrompt = (jobDescription: string, resumeText: string) => `
Expert resume analyzer. Calculate Job Compatibility Score (job-resume match.)

${SCORING_CRITERIA}

JOB:
${jobDescription}

RESUME:
${resumeText}

JSON format:
{
  "atsScore": <0-100>,
  "SkillMatch": <0-100>,
  "ExperienceMatch": <0-100>,
  "TitleMatch": <0-100>,
  "SoftSkillMatch": <0-100>,
  "evidence": {"skillMatches":[{"token":"","count":0}],"experienceMatches":[{"phrase":"","count":0}],"titleMatches":[{"phrase":"","count":0}],"softSkillMatches":[{"phrase":"","count":0}]},
  "keySkills": [<6-10 from job>],
  "matchingStrengths": [<4-6>],
  "gaps": [<3-5>],
}`;

const createHtmlPrompt = (jobDescription: string, resumeText: string) => `
You are an expert resume writer and ATS optimization specialist.

Task:
- Generate a tailored resume in valid HTML using the provided TEMPLATE.
- Customize content based on the JOB description.
- Preserve the TEMPLATE structure.
- Improve clarity, relevance, and impact without fabricating experience.

Output rules:
- Do NOT mention instructions, rules, or constraints.
- Return ONLY valid JSON in the exact format specified.

RULES:
${RULES}

TEMPLATE:
${HTML_TEMPLATE}

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeText}

Return JSON:
{
"tailoredResumeHtml": "<complete HTML>",
"improvements": [<4-5 changes, 10 words each - hyper focused>]
}`;

export async function POST(request: NextRequest) {
  const extractFirstJson = (text: string): string | null => {
    if (!text) return null;
    text = text.replace(/```\w*\n?|```/g, "");

    const start = text.indexOf("{");
    if (start === -1) return null;

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
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) {
          return text.substring(start, i + 1);
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
          (fullText) => {
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
            }
          },
        );

        await new Promise((resolve) => setTimeout(resolve, 270));

        const generateHtml = generateContentWithRetry(
          createHtmlPrompt(jobDescription, resumeText),
          2,
        );

        const [, htmlText] = await Promise.all([streamAnalysis, generateHtml]);

        try {
          const jsonStr = extractFirstJson(htmlText);
          if (jsonStr) {
            const parsed = JSON.parse(jsonStr);
            safeEnqueue(
              `data: ${JSON.stringify({
                type: "html_complete",
                data: {
                  tailoredResumeHtml: processHtmlResponse(
                    parsed.tailoredResumeHtml,
                  ),
                  improvements: parsed.improvements,
                },
              })}\n\n`,
            );
          }
        } catch (err: any) {
          console.error("HTML parse error:", err?.message || String(err));
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
