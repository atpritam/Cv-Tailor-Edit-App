"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Printer,
  Upload,
} from "lucide-react";
import type { TailorResult } from "@/lib/types";
import { Chat } from "./Chat";
import type { ChatMessage } from "@/hooks/useCVTailor";
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
}: ResumePreviewProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const [selectedTheme, setSelectedTheme] = useState(0); // Default to Classic Blue
  const [showProfilePhoto, setShowProfilePhoto] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Apply theme colors to resume
  useEffect(() => {
    if (resumeRef.current) {
      const theme = COLOR_THEMES[selectedTheme];
      const container = resumeRef.current;

      // Apply colors using CSS variables
      container.style.setProperty("--resume-primary", theme.primary);
      container.style.setProperty("--resume-h2", theme.h2);
      container.style.setProperty("--resume-border", theme.border);
      container.style.setProperty("--resume-link", theme.link);
      container.style.setProperty("--resume-tech", theme.tech);

      // Apply to elements
      const h1 = container.querySelector("h1");
      if (h1) h1.style.color = theme.primary;

      const h2s = container.querySelectorAll("h2");
      h2s.forEach((h2) => {
        (h2 as HTMLElement).style.color = theme.h2;
        (h2 as HTMLElement).style.borderBottomColor = theme.border;
      });

      const links = container.querySelectorAll("a");
      links.forEach((link) => {
        (link as HTMLElement).style.color = theme.link;
      });

      const techs = container.querySelectorAll(".project-tech");
      techs.forEach((tech) => {
        (tech as HTMLElement).style.color = theme.tech;
      });

      const projectLinks = container.querySelectorAll(".project-link");
      projectLinks.forEach((link) => {
        (link as HTMLElement).style.color = theme.link;
      });
    }
  }, [
    selectedTheme,
    results.tailoredResumeHtml,
    showProfilePhoto,
    isDownloading,
    profilePhotoDataUrl,
  ]);

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

        // Add photo if available and enabled
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

      {/* Tailored Resume Preview */}
      <div className="mb-4 md:mb-6 overflow-hidden rounded-lg border border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-2 border-b border-border bg-muted/50 px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="shrink-0" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              {results.recommendation === "apply_as_is"
                ? "Optimized Resume"
                : "Tailored Resume"}
            </h3>
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-wrap md:flex-nowrap">
            {profilePhotoDataUrl ? (
              // Existing Profile Photo Toggle
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium whitespace-nowrap">
                  Profile Pic
                </span>
                <button
                  onClick={() => {
                    if (!controlsDisabled)
                      setShowProfilePhoto(!showProfilePhoto);
                  }}
                  disabled={controlsDisabled}
                  aria-disabled={controlsDisabled}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                    showProfilePhoto ? "bg-primary" : "bg-muted-foreground/30"
                  } ${controlsDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                  aria-label="Toggle profile photo"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showProfilePhoto ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ) : (
              // New Profile Photo Upload Button
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium whitespace-nowrap cursor-pointer">
                  Add Profile Pic
                </span>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                  aria-hidden
                  disabled={controlsDisabled}
                />
                <button
                  onClick={() => {
                    if (!controlsDisabled)
                      profilePhotoInputRef.current?.click();
                  }}
                  disabled={controlsDisabled}
                  aria-disabled={controlsDisabled}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10 text-muted-foreground hover:bg-muted-foreground/20 transition-colors ${controlsDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                  aria-label="Upload profile photo"
                >
                  <Upload size={16} />
                </button>
              </div>
            )}

            {/* Color Theme Selector */}
            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label="Color themes"
            >
              {COLOR_THEMES.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!controlsDisabled) setSelectedTheme(index);
                  }}
                  disabled={controlsDisabled}
                  aria-disabled={controlsDisabled}
                  className={`relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full ${controlsDisabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
                  style={{
                    width: "20px",
                    height: "20px",
                    padding: "2px",
                  }}
                  aria-label={theme.name}
                  title={theme.name}
                >
                  {selectedTheme === index && (
                    <div
                      className="absolute inset-0 rounded-full border-2 border-white"
                      style={{
                        boxShadow: "0 0 0 1px rgba(0,0,0,0.1)",
                      }}
                    />
                  )}
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      backgroundColor: theme.primary,
                      transform:
                        selectedTheme === index ? "scale(0.75)" : "scale(1)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
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
              className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 md:py-4 text-sm font-medium text-primary-foreground transition-colors ${
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

            <button
              onClick={handlePrint}
              disabled={actionDisabled}
              className={`flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 md:py-4 text-sm font-medium text-foreground transition-colors ${
                actionDisabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-muted cursor-pointer"
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
            className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors md:col-span-2 ${
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
          className={`flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-3 md:py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted ${
            loading || streamingStarted
              ? "disabled:cursor-not-allowed disabled:opacity-50"
              : "cursor-pointer"
          }`}
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
