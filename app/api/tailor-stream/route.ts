import { NextRequest } from "next/server";
import { generateParallelStreaming } from "@/services/gen-ai";
import { processHtmlResponse } from "@/lib/response-processor";
import { HTML_TEMPLATE, RULES, SCORING_CRITERIA } from "@/lib/prompts";

const createAnalysisPrompt = (
  jobDescription: string,
  resumeText: string,
  social: string,
) => `
Expert resume analyzer. Calculate Job Compatibility Score (job-resume match.)

${social ? `SOCIALS:\n${social}\n` : ""}
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

const createHtmlPrompt = (
  jobDescription: string,
  resumeText: string,
  social: string,
) => `
Expert resume writer. Generate tailored HTML from template based on job description. And mention the improvements made.

${social ? `SOCIALS:\n${social}\n` : ""}
${RULES}

TEMPLATE:
${HTML_TEMPLATE}

JOB:
${jobDescription}

RESUME:
${resumeText}

JSON format:
{
"tailoredResumeHtml": "<complete HTML>",
"improvements": [<4-5 changes, 10 words each - hyper focused>]
}`;

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { jobDescription, resumeText, linkedin, github } =
          await request.json();

        if (!jobDescription?.trim()) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Job description required" })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        if (!resumeText?.trim()) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Resume required" })}\n\n`,
            ),
          );
          controller.close();
          return;
        }

        const social = [
          linkedin?.trim() && `LinkedIn: ${linkedin}`,
          github?.trim() && `GitHub: ${github}`,
        ]
          .filter(Boolean)
          .join("\n");

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "started", message: "Analysis started" })}\n\n`,
          ),
        );

        let analysisAccumulated = "";
        let htmlAccumulated = "";
        let lastAnalysisSent = 0;
        let lastHtmlSent = 0;

        // Run both streams in parallel
        await generateParallelStreaming([
          {
            prompt: createAnalysisPrompt(jobDescription, resumeText, social),
            onChunk: (chunk, accumulated) => {
              analysisAccumulated = accumulated;

              const now = Date.now();
              if (now - lastAnalysisSent > 120) {
                try {
                  const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    controller.enqueue(
                      encoder.encode(
                        `data: ${JSON.stringify({ type: "analysis_partial", data: parsed })}\n\n`,
                      ),
                    );
                    lastAnalysisSent = now;
                  }
                } catch {
                  // Not valid yet
                }
              }
            },
            onComplete: (fullText) => {
              try {
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: "analysis_complete", data: parsed })}\n\n`,
                    ),
                  );
                }
              } catch (err) {
                console.error("Analysis parse error:", err);
              }
            },
          },
          {
            prompt: createHtmlPrompt(jobDescription, resumeText, social),
            onChunk: (chunk, accumulated) => {
              htmlAccumulated = accumulated;

              const now = Date.now();
              if (now - lastHtmlSent > 200) {
                // Send partial HTML
                try {
                  const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    if (parsed.tailoredResumeHtml) {
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({
                            type: "html_partial",
                            data: {
                              tailoredResumeHtml: parsed.tailoredResumeHtml,
                              improvements: parsed.improvements,
                            },
                          })}\n\n`,
                        ),
                      );
                      lastHtmlSent = now;
                    }
                  }
                } catch {
                  // Not valid yet
                }
              }
            },
            onComplete: (fullText) => {
              try {
                const jsonMatch = fullText.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const parsed = JSON.parse(jsonMatch[0]);
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({
                        type: "html_complete",
                        data: {
                          tailoredResumeHtml: processHtmlResponse(
                            parsed.tailoredResumeHtml,
                          ),
                          improvements: parsed.improvements,
                        },
                      })}\n\n`,
                    ),
                  );
                }
              } catch (err) {
                console.error("HTML parse error:", err);
              }
            },
          },
        ]);

        // Send final completion signal
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "complete",
              data: { jobDescription, originalProvided: true },
            })}\n\n`,
          ),
        );

        controller.close();
      } catch (error: any) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "error",
              error: error.message || "Processing failed",
            })}\n\n`,
          ),
        );
        controller.close();
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
