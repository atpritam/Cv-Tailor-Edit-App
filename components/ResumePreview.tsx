"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Printer,
  Upload,
  RotateCcw,
} from "lucide-react";
import type { TailorResult, ChatMessage } from "@/lib/types";
import { Chat } from "./Chat";
import { downloadPDF, printPDF } from "@/lib/pdf";
import { ResumeSkeleton } from "./ui/ResumeSkeleton";

type ResumePreviewProps = {
  results: TailorResult;
  loading: boolean;
  regenerate: () => void;
  reset: () => void;
  chatHistory: ChatMessage[];
  sendChatMessage: (message: string) => void;
  profilePhotoDataUrl: string | null;
  handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  streamingStarted?: boolean;
  htmlComplete?: boolean;
};

// Professional resume color themes
const COLOR_THEMES = [
  {
    name: "Classic Blue",
    primary: "#2563eb",
    h2: "#2563eb",
    border: "#2563eb",
    link: "#2563eb",
    tech: "#2563eb",
  },
  {
    name: "Professional Navy",
    primary: "#1e40af",
    h2: "#1e40af",
    border: "#1e40af",
    link: "#1e40af",
    tech: "#1e40af",
  },
  {
    name: "Corporate Slate",
    primary: "#475569",
    h2: "#475569",
    border: "#475569",
    link: "#475569",
    tech: "#475569",
  },
  {
    name: "Modern Teal",
    primary: "#0d9488",
    h2: "#0d9488",
    border: "#0d9488",
    link: "#0d9488",
    tech: "#0d9488",
  },
  {
    name: "Executive Purple",
    primary: "#7c3aed",
    h2: "#7c3aed",
    border: "#7c3aed",
    link: "#7c3aed",
    tech: "#7c3aed",
  },
  {
    name: "Tech Green",
    primary: "#059669",
    h2: "#059669",
    border: "#059669",
    link: "#059669",
    tech: "#059669",
  },
  {
    name: "Creative Orange",
    primary: "#ea580c",
    h2: "#ea580c",
    border: "#ea580c",
    link: "#ea580c",
    tech: "#ea580c",
  },
  {
    name: "Finance Burgundy",
    primary: "#991b1b",
    h2: "#991b1b",
    border: "#991b1b",
    link: "#991b1b",
    tech: "#991b1b",
  },
];

export function ResumePreview({
  results,
  loading,
  regenerate,
  reset,
  chatHistory,
  sendChatMessage,
  profilePhotoDataUrl,
  handleProfilePhotoUpload,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  streamingStarted,
  htmlComplete = false,
}: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (resumeRef.current) {
      const theme = COLOR_THEMES[selectedTheme];
      const container = resumeRef.current;

      container.style.setProperty("--resume-primary", theme.primary);
      container.style.setProperty("--resume-h2", theme.h2);
      container.style.setProperty("--resume-border", theme.border);
      container.style.setProperty("--resume-link", theme.link);
      container.style.setProperty("--resume-tech", theme.tech);

      const h1 = container.querySelector("h1");
      if (h1) {
        const h1El = h1 as HTMLElement;
        if (!h1El.style.color) h1El.style.color = theme.primary;
      }

      const h2s = container.querySelectorAll("h2");
      h2s.forEach((h2) => {
        const el = h2 as HTMLElement;
        if (!el.style.color) el.style.color = theme.h2;
        if (!el.style.borderBottomColor)
          el.style.borderBottomColor = theme.border;
      });

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        const el = link as HTMLElement;
        if (!el.style.color) el.style.color = theme.link;
      });

      const techs = container.querySelectorAll(".project-tech");
      techs.forEach((tech) => {
        const el = tech as HTMLElement;
        if (!el.style.color) el.style.color = theme.tech;
      });

      const projectLinks = container.querySelectorAll(".project-link");
      projectLinks.forEach((link) => {
        const el = link as HTMLElement;
        if (!el.style.color) el.style.color = theme.link;
      });
    }
  }, [
    selectedTheme,
    results.tailoredResumeHtml,
    showProfilePhoto,
    isDownloading,
    profilePhotoDataUrl,
  ]);

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

        if (profilePhotoDataUrl && showProfilePhoto) {
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
  }, [
    results.tailoredResumeHtml,
    profilePhotoDataUrl,
    showProfilePhoto,
    loading,
    selectedTheme,
    isDownloading,
  ]);

  const handleDownload = async () => {
    if (resumeRef.current) {
      try {
        setIsDownloading(true);
        await downloadPDF(
          resumeRef.current,
          showProfilePhoto ? profilePhotoDataUrl : null,
          COLOR_THEMES[selectedTheme],
        );
      } finally {
        setIsDownloading(false);
      }
    }
  };

  const handlePrint = async () => {
    if (resumeRef.current) {
      await printPDF(
        resumeRef.current,
        showProfilePhoto ? profilePhotoDataUrl : null,
        COLOR_THEMES[selectedTheme],
      );
    }
  };

  const actionDisabled = isDownloading || loading || !!streamingStarted;
  const controlsDisabled = isDownloading || loading || !!streamingStarted;
  const showResumeLoader = !htmlComplete && (loading || streamingStarted);

  return (
    <div className="w-full min-w-0">
      {/* Chat */}
      <Chat
        chatHistory={chatHistory}
        sendChatMessage={sendChatMessage}
        isLoading={loading}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
      />

      {/* Resume Preview Card */}
      <div className="mb-4 md:mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-2 border-b border-border bg-muted/30 px-4 py-3 md:px-5 md:py-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText size={16} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              {results.recommendation === "apply_as_is"
                ? "Optimized Resume"
                : "Tailored Resume"}
            </h3>
          </div>

          <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
            {profilePhotoDataUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Photo
                </span>
                <button
                  onClick={() => {
                    if (!controlsDisabled)
                      setShowProfilePhoto(!showProfilePhoto);
                  }}
                  disabled={controlsDisabled}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    showProfilePhoto ? "bg-primary" : "bg-muted-foreground/30"
                  } ${controlsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  aria-label="Toggle profile photo"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      showProfilePhoto ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                  Add Photo
                </span>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                  disabled={controlsDisabled}
                />
                <button
                  onClick={() => {
                    if (!controlsDisabled)
                      profilePhotoInputRef.current?.click();
                  }}
                  disabled={controlsDisabled}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors ${
                    controlsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                  aria-label="Upload profile photo"
                >
                  <Upload size={14} />
                </button>
              </div>
            )}

            {/* Color Theme Selector */}
            <div className="flex items-center gap-1.5" role="group" aria-label="Color themes">
              {COLOR_THEMES.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!controlsDisabled) setSelectedTheme(index);
                  }}
                  disabled={controlsDisabled}
                  className={`relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card rounded-full ${
                    controlsDisabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  style={{
                    width: "18px",
                    height: "18px",
                    padding: "2px",
                  }}
                  aria-label={theme.name}
                  title={theme.name}
                >
                  {selectedTheme === index && (
                    <div
                      className="absolute inset-0 rounded-full border-2 border-foreground/20"
                      style={{
                        boxShadow: "0 0 0 1px rgba(255,255,255,0.1)",
                      }}
                    />
                  )}
                  <div
                    className="w-full h-full rounded-full transition-transform"
                    style={{
                      backgroundColor: theme.primary,
                      transform: selectedTheme === index ? "scale(0.7)" : "scale(1)",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {showResumeLoader ? (
          <ResumeSkeleton />
        ) : (
          <div
            ref={resumeRef}
            className="resume-container max-h-[50vh] md:max-h-[calc(100vh-400px)] overflow-auto"
            style={{
              WebkitOverflowScrolling: "touch",
              transform: "translateZ(0)",
            }}
            dangerouslySetInnerHTML={{ __html: results.tailoredResumeHtml }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-3">
        {!isMobile ? (
          <>
            <button
              onClick={handleDownload}
              disabled={actionDisabled}
              className={`flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all ${
                actionDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              }`}
            >
              {isDownloading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Download PDF
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={actionDisabled}
              className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all ${
                actionDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted hover:border-primary/30 cursor-pointer"
              }`}
            >
              <Printer size={16} />
              Print Resume
            </button>
          </>
        ) : (
          <button
            onClick={handleDownload}
            disabled={actionDisabled}
            className={`flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all ${
              actionDisabled
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-primary/90 cursor-pointer"
            }`}
          >
            {isDownloading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download size={16} />
                Download PDF
              </>
            )}
          </button>
        )}

        <button
          onClick={reset}
          disabled={loading || !!streamingStarted}
          className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/30 ${
            loading || streamingStarted
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          <RotateCcw size={16} />
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
