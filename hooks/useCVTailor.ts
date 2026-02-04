"use client";

import { useState, useRef } from "react";
import type { TailorResult, ResumeVersion, ChatMessage } from "@/lib/types";

const MAX_HISTORY_VERSIONS = 5;

export function useCVTailor() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [streamingStarted, setStreamingStarted] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [refining, setRefining] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [htmlComplete, setHtmlComplete] = useState(false);
  const [analysisRetrying, setAnalysisRetrying] = useState(false);

  const [versionHistory, setVersionHistory] = useState<ResumeVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);

  const [originalTailoredHtml, setOriginalTailoredHtml] = useState<string>("");
  const [storedJobDescription, setStoredJobDescription] = useState<string>("");

  const eventSourceRef = useRef<EventSource | null>(null);

  const addVersion = (html: string, description: string) => {
    const newVersion: ResumeVersion = {
      id: `v-${Date.now()}`,
      html,
      timestamp: Date.now(),
      changeDescription: description,
    };

    setVersionHistory((prev) => {
      const baseHistory =
        currentVersionIndex === -1
          ? prev
          : prev.slice(0, currentVersionIndex + 1);
      const newHistory = [...baseHistory, newVersion].slice(
        -MAX_HISTORY_VERSIONS,
      );
      return newHistory;
    });

    setCurrentVersionIndex((prev) => {
      const baseLength = prev === -1 ? versionHistory.length : prev + 1;
      return Math.min(baseLength, MAX_HISTORY_VERSIONS - 1);
    });
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description");
      return;
    }

    if (!resumeText.trim()) {
      setError(
        "Please provide your resume by pasting text or uploading a file",
      );
      return;
    }

    setLoading(true);
    setStreamingStarted(false);
    setAnalysisComplete(false);
    setHtmlComplete(false);
    setAnalysisRetrying(false);
    setError("");
    setChatHistory([]);
    setVersionHistory([]);
    setCurrentVersionIndex(-1);

    // initial empty result (will be populated by stream)
    setResults({
      recommendation: "tailor_resume",
      recommendationReason: "Analyzing...",
      analysis: {
        atsScore: 0,
        keySkills: [],
        matchingStrengths: [],
        gaps: [],
        improvements: [],
      },
      tailoredResumeHtml: "",
      originalProvided: true,
    });

    try {
      //  streaming endpoint
      const response = await fetch("/api/tailor-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText,
        }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "started") {
                setStreamingStarted(true);
              } else if (data.type === "analysis_retrying") {
                // Show skeletons again during retry
                setAnalysisRetrying(true);
                setAnalysisComplete(false);
                setResults((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    analysis: {
                      atsScore: 0,
                      keySkills: [],
                      matchingStrengths: [],
                      gaps: [],
                      improvements: [],
                    },
                  };
                });
              } else if (
                data.type === "analysis_partial" ||
                data.type === "analysis_complete"
              ) {
                // Update analysis as it comes in
                setAnalysisRetrying(false);

                if (data.type === "analysis_complete") {
                  setAnalysisComplete(true);
                }

                setResults((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    recommendation:
                      data.data.recommendation || prev.recommendation,
                    recommendationReason:
                      data.data.recommendationReason ||
                      prev.recommendationReason,
                    analysis: {
                      atsScore: data.data.atsScore ?? prev.analysis.atsScore,
                      SkillMatch: data.data.SkillMatch,
                      ExperienceMatch: data.data.ExperienceMatch,
                      TitleMatch: data.data.TitleMatch,
                      SoftSkillMatch: data.data.SoftSkillMatch,
                      evidence: data.data.evidence,
                      keySkills: data.data.keySkills || prev.analysis.keySkills,
                      matchingStrengths:
                        data.data.matchingStrengths ||
                        prev.analysis.matchingStrengths,
                      gaps: data.data.gaps || prev.analysis.gaps,
                      improvements:
                        data.data.improvements || prev.analysis.improvements,
                    },
                  };
                });
              } else if (
                data.type === "html_partial" ||
                data.type === "html_complete"
              ) {
                // Update HTML as it comes in
                if (data.type === "html_complete") {
                  setHtmlComplete(true);
                }

                setResults((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    tailoredResumeHtml:
                      data.data.tailoredResumeHtml || prev.tailoredResumeHtml,
                    analysis: {
                      ...prev.analysis,
                      improvements:
                        data.data.improvements || prev.analysis.improvements,
                    },
                  };
                });

                if (data.type === "html_complete") {
                  // Store for undo/refine
                  setOriginalTailoredHtml(data.data.tailoredResumeHtml);
                  addVersion(
                    data.data.tailoredResumeHtml,
                    "Initial tailored resume",
                  );
                }
              } else if (data.type === "complete") {
                setStoredJobDescription(
                  data.data.jobDescription || jobDescription,
                );
                setChatHistory([
                  {
                    role: "assistant",
                    parts: [
                      {
                        text: "I've created your tailored resume. You can refine it further by asking me to make specific changes!",
                      },
                    ],
                  },
                ]);
              } else if (data.type === "error") {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              console.error("Parse error:", parseErr);
            }
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process your request. Please try again.";

      if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        setError(
          "⏱️ API rate limit reached. Please wait 30-60 seconds and try again.",
        );
      } else {
        setError(errorMessage);
      }
      console.error(err);

      // Clear results on error
      setResults(null);
      setAnalysisComplete(false);
      setHtmlComplete(false);
    } finally {
      setLoading(false);
      setStreamingStarted(false);
      setAnalysisRetrying(false);
    }
  };

  const regenerate = async () => {
    setChatHistory([
      {
        role: "assistant",
        parts: [
          {
            text: "I've created your tailored resume. You can refine it further by asking me to make specific changes!",
          },
        ],
      },
    ]);
    setVersionHistory([]);
    setCurrentVersionIndex(-1);

    await handleTailor();
  };

  const sendChatMessage = async (message: string) => {
    if (!results) return;

    setLoading(true);
    setRefining(true);
    setError("");

    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] },
    ];
    setChatHistory(newHistory);

    try {
      const currentHtml =
        currentVersionIndex >= 0 && versionHistory[currentVersionIndex]
          ? versionHistory[currentVersionIndex].html
          : results.tailoredResumeHtml;

      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          chatHistory: newHistory,
          currentResumeHtml: currentHtml,
          originalTailoredHtml: originalTailoredHtml,
          jobDescription: storedJobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process your request");
      }

      if (data.blocks && data.blocks.length > 0) {
        setResults((prev) =>
          prev ? { ...prev, tailoredResumeHtml: data.updatedHtml } : null,
        );
        addVersion(data.updatedHtml, message.substring(0, 50));
      }

      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", parts: [{ text: data.chatResponse }] },
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process your request. Please try again.";

      if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        setError(
          "⏱️ API rate limit reached. Please wait a moment and try again.",
        );
      } else {
        setError(errorMessage);
      }
      console.error(err);

      setChatHistory(chatHistory);
    } finally {
      setLoading(false);
      setRefining(false);
    }
  };

  const undoLastChange = () => {
    if (currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1;
      setCurrentVersionIndex(newIndex);
      const previousVersion = versionHistory[newIndex];

      if (previousVersion && results) {
        setResults({
          ...results,
          tailoredResumeHtml: previousVersion.html,
        });

        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            parts: [
              {
                text: `Reverted to previous version: ${previousVersion.changeDescription}`,
              },
            ],
          },
        ]);
      }
    }
  };

  const redoChange = () => {
    if (currentVersionIndex < versionHistory.length - 1) {
      const newIndex = currentVersionIndex + 1;
      setCurrentVersionIndex(newIndex);
      const nextVersion = versionHistory[newIndex];

      if (nextVersion && results) {
        setResults({
          ...results,
          tailoredResumeHtml: nextVersion.html,
        });

        setChatHistory((prev) => [
          ...prev,
          {
            role: "assistant",
            parts: [
              { text: `Restored version: ${nextVersion.changeDescription}` },
            ],
          },
        ]);
      }
    }
  };

  const canUndo = currentVersionIndex > 0;
  const canRedo = currentVersionIndex < versionHistory.length - 1;

  const reset = () => {
    setJobDescription("");
    setResumeText("");
    setResults(null);
    setError("");
    setChatHistory([]);
    setOriginalTailoredHtml("");
    setStoredJobDescription("");
    setVersionHistory([]);
    setCurrentVersionIndex(-1);
    setStreamingStarted(false);
    setAnalysisComplete(false);
    setHtmlComplete(false);
    setAnalysisRetrying(false);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  return {
    jobDescription,
    setJobDescription,
    resumeText,
    setResumeText,
    results,
    loading,
    streamingStarted,
    error,
    handleSubmit: handleTailor,
    regenerate,
    reset,
    setError,
    chatHistory,
    sendChatMessage,
    undoLastChange,
    redoChange,
    canUndo,
    canRedo,
    versionHistory,
    currentVersionIndex,
    refining,
    analysisComplete,
    htmlComplete,
    analysisRetrying,
  };
}
