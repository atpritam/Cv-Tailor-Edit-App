"use client";

import { useState } from "react";
import type { TailorResult, ResumeVersion } from "@/lib/types";

export type ChatMessage = {
  role: "user" | "assistant";
  parts: { text: string }[];
};

const MAX_HISTORY_VERSIONS = 10; // Store last 10 versions for undo

export function useCVTailor() {
  const [jobDescription, setJobDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Version history for undo functionality
  const [versionHistory, setVersionHistory] = useState<ResumeVersion[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState<number>(-1);

  // Store original tailored resume and job description for refine context
  const [originalTailoredHtml, setOriginalTailoredHtml] = useState<string>("");
  const [storedJobDescription, setStoredJobDescription] = useState<string>("");

  const addVersion = (html: string, description: string) => {
    const newVersion: ResumeVersion = {
      id: `v-${Date.now()}`,
      html,
      timestamp: Date.now(),
      changeDescription: description,
    };

    setVersionHistory((prev) => {
      // If we're not at the end of history, remove everything after current index
      const baseHistory =
        currentVersionIndex === -1
          ? prev
          : prev.slice(0, currentVersionIndex + 1);

      // Add new version and keep only last MAX_HISTORY_VERSIONS
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
    setError("");
    setChatHistory([]);
    setVersionHistory([]);
    setCurrentVersionIndex(-1);

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeText,
          linkedin,
          github,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process your request");
      }

      setResults(data);
      setOriginalTailoredHtml(data.tailoredResumeHtml);
      setStoredJobDescription(data.jobDescription || jobDescription);

      // Add initial version to history
      addVersion(data.tailoredResumeHtml, "Initial tailored resume");

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
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async () => {
    // Reset history and regenerate
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
    if (!results) {
      return;
    }

    setLoading(true);
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userMessage: message,
          currentResumeHtml: currentHtml,
          originalTailoredHtml: originalTailoredHtml,
          jobDescription: storedJobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process your request");
      }

      // Update results with new HTML
      setResults((prev) =>
        prev
          ? {
              ...prev,
              tailoredResumeHtml: data.updatedHtml,
            }
          : null,
      );

      // Add to version history
      addVersion(data.updatedHtml, message.substring(0, 50));

      // Add assistant response to chat
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          parts: [{ text: data.chatResponse }],
        },
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

      // Remove user message from chat on error
      setChatHistory(chatHistory);
    } finally {
      setLoading(false);
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
              {
                text: `Restored version: ${nextVersion.changeDescription}`,
              },
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
    setLinkedin("");
    setGithub("");
    setResumeText("");
    setResults(null);
    setError("");
    setChatHistory([]);
    setOriginalTailoredHtml("");
    setStoredJobDescription("");
    setVersionHistory([]);
    setCurrentVersionIndex(-1);
  };

  return {
    jobDescription,
    setJobDescription,
    linkedin,
    setLinkedin,
    github,
    setGithub,
    resumeText,
    setResumeText,
    results,
    loading,
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
  };
}
