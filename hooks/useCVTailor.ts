"use client";

import { useState } from "react";
import type { TailorResult } from "@/lib/types";

export type ChatMessage = {
  role: "user" | "assistant";
  parts: { text: string }[];
};

type TailorApiPayload = {
  jobDescription: string;
  linkedin: string;
  github: string;
  resumeText: string;
  chatHistory?: ChatMessage[];
  originalResumeHtml?: string;
};

export function useCVTailor() {
  const [jobDescription, setJobDescription] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [results, setResults] = useState<TailorResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [lastRequestTime, setLastRequestTime] = useState<number>(0);
  const [originalResumeHtml, setOriginalResumeHtml] = useState<string>("");

  const tailorRequest = async (payload: TailorApiPayload) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minDelay = 3000;

    if (timeSinceLastRequest < minDelay && lastRequestTime > 0) {
      const waitTime = minDelay - timeSinceLastRequest;
      setError(
        `Please wait ${Math.ceil(waitTime / 1000)} seconds before making another request...`,
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      setError("");
    }

    setLastRequestTime(Date.now());
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/tailor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process your request");
      }

      if (payload.chatHistory) {
        // This is a chat refinement request - use real LLM response
        setResults((prev) =>
          prev
            ? {
                ...prev,
                tailoredResumeHtml: data.tailoredResumeHtml,
                resumeCss: data.resumeCss,
              }
            : data,
        );
        if (data.chatResponse) {
          setChatHistory((prev) => [
            ...prev,
            { role: "assistant", parts: [{ text: data.chatResponse }] },
          ]);
        }
      } else {
        // This is the initial generation - store original and use template message
        setOriginalResumeHtml(data.tailoredResumeHtml);
        setResults(data);
        setChatHistory([
          {
            role: "assistant",
            parts: [
              {
                text: "I've created the first version of your tailored resume. Let me know what you think!",
              },
            ],
          },
        ]);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to process your request. Please try again.";

      //  helpful error messages for rate limits
      if (errorMessage.includes("Rate limit") || errorMessage.includes("429")) {
        setError(
          "⏱️ API rate limit reached. The free tier has strict limits. Please wait 30-60 seconds and try again. Consider upgrading to a paid tier for higher limits.",
        );
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
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

    setChatHistory([]);
    setOriginalResumeHtml("");

    tailorRequest({
      jobDescription,
      linkedin,
      github,
      resumeText,
    });
  };

  const regenerate = async () => {
    setChatHistory([
      {
        role: "assistant",
        parts: [
          {
            text: "I've created the first version of your tailored resume. Let me know what you think!",
          },
        ],
      },
    ]);

    tailorRequest({
      jobDescription,
      linkedin,
      github,
      resumeText,
    });
  };

  const sendChatMessage = async (message: string) => {
    if (!results) {
      return;
    }
    const newHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", parts: [{ text: message }] },
    ];
    setChatHistory(newHistory);

    tailorRequest({
      jobDescription,
      linkedin,
      github,
      resumeText: results.tailoredResumeHtml,
      chatHistory: newHistory,
      originalResumeHtml: originalResumeHtml,
    });
  };

  const reset = () => {
    setJobDescription("");
    setLinkedin("");
    setGithub("");
    setResumeText("");
    setResults(null);
    setError("");
    setChatHistory([]);
    setLastRequestTime(0);
    setOriginalResumeHtml("");
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
    handleSubmit,
    regenerate,
    reset,
    setError,
    chatHistory,
    sendChatMessage,
  };
}
