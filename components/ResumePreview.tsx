"use client";

import React, { useRef, useEffect } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";
import type { TailorResult } from "@/lib/types";
import { Chat } from "./Chat";
import type { ChatMessage } from "@/hooks/useCVTailor";
import { downloadPDF } from "@/lib/pdf";

type ResumePreviewProps = {
  results: TailorResult;
  loading: boolean;
  regenerate: () => void;
  reset: () => void;
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string) => void;
  profilePhotoDataUrl: string | null;
};

export function ResumePreview({
  results,
  loading,
  regenerate,
  reset,
  chatHistory,
  sendChatMessage,
  profilePhotoDataUrl,
}: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);

  // Inject profile photo whenever resume HTML or photo changes
  useEffect(() => {
    if (resumeRef.current) {
      const profileContainer =
        resumeRef.current.querySelector(".profile-container");
      if (profileContainer) {
        const existingImg = profileContainer.querySelector(
          "img.profile-picture",
        );
        if (existingImg) {
          existingImg.remove();
        }

        // Add photo if available
        if (profilePhotoDataUrl) {
          const img = document.createElement("img");
          img.src = profilePhotoDataUrl;
          img.className = "profile-picture";
          img.alt = "Profile";
          Object.assign(img.style, {
            objectFit: "cover",
            borderRadius: "14px",
            flexShrink: "0",
            marginRight: "18px",
          });
          profileContainer.prepend(img);
        }
      }
    }
  }, [results.tailoredResumeHtml, profilePhotoDataUrl, loading]);

  return (
    <div className="w-full min-w-0">
      {/* Chat */}
      <Chat
        chatHistory={chatHistory}
        sendChatMessage={sendChatMessage}
        isLoading={loading}
      />

      {/* Tailored Resume Preview */}
      <div className="mb-4 md:mb-6 overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3 md:px-6 md:py-4">
          <FileText size={16} className="shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            {results.recommendation === "apply_as_is"
              ? "Optimized Resume"
              : "Tailored Resume"}
          </h3>
        </div>
        <div
          ref={resumeRef}
          className="resume-container max-h-[50vh] md:max-h-[calc(100vh-400px)] overflow-auto"
          dangerouslySetInnerHTML={{ __html: results.tailoredResumeHtml }}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
        <button
          onClick={() => {
            if (resumeRef.current) {
              downloadPDF(resumeRef.current, profilePhotoDataUrl);
            }
          }}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 md:py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
        >
          <Download size={16} />
          Download / Print PDF
        </button>

        <button
          onClick={regenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 md:py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              Regenerate
              <RefreshCw size={16} />
            </>
          )}
        </button>

        <button
          onClick={reset}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 md:py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
