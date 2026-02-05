"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Printer,
  Upload,
  RotateCcw,
  Check,
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

const COLOR_THEMES = [
  { name: "Classic Blue", primary: "#2563eb", h2: "#2563eb", border: "#2563eb", link: "#2563eb", tech: "#2563eb" },
  { name: "Professional Navy", primary: "#1e40af", h2: "#1e40af", border: "#1e40af", link: "#1e40af", tech: "#1e40af" },
  { name: "Corporate Slate", primary: "#475569", h2: "#475569", border: "#475569", link: "#475569", tech: "#475569" },
  { name: "Modern Teal", primary: "#0d9488", h2: "#0d9488", border: "#0d9488", link: "#0d9488", tech: "#0d9488" },
  { name: "Executive Purple", primary: "#7c3aed", h2: "#7c3aed", border: "#7c3aed", link: "#7c3aed", tech: "#7c3aed" },
  { name: "Tech Green", primary: "#059669", h2: "#059669", border: "#059669", link: "#059669", tech: "#059669" },
  { name: "Creative Orange", primary: "#ea580c", h2: "#ea580c", border: "#ea580c", link: "#ea580c", tech: "#ea580c" },
  { name: "Finance Burgundy", primary: "#991b1b", h2: "#991b1b", border: "#991b1b", link: "#991b1b", tech: "#991b1b" },
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
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
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
        if (!el.style.borderBottomColor) el.style.borderBottomColor = theme.border;
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
  }, [selectedTheme, results.tailoredResumeHtml, showProfilePhoto, isDownloading, profilePhotoDataUrl]);

  useEffect(() => {
    if (resumeRef.current) {
      const profileContainer = resumeRef.current.querySelector(".profile-container");
      if (profileContainer) {
        const existingImg = profileContainer.querySelector("img.profile-picture");
        if (existingImg) existingImg.remove();

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
  }, [results.tailoredResumeHtml, profilePhotoDataUrl, showProfilePhoto, loading, selectedTheme, isDownloading]);

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
    <div className="w-full min-w-0 flex flex-col h-full">
      {/* Chat */}
      <Chat
        chatHistory={chatHistory}
        sendChatMessage={sendChatMessage}
        isLoading={loading}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        isTailoring={!htmlComplete && (loading || !!streamingStarted) && chatHistory.length === 0}
      />

      {/* Resume Preview Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-6 flex flex-col" style={{ height: 'calc(100% - 4.5rem)' }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border px-4 py-4 sm:px-5 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileText size={14} className="text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Resume Preview
            </h3>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Photo Toggle/Upload */}
            {profilePhotoDataUrl ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Photo</span>
                <button
                  onClick={() => !controlsDisabled && setShowProfilePhoto(!showProfilePhoto)}
                  disabled={controlsDisabled}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    showProfilePhoto ? "bg-primary" : "bg-muted-foreground/30"
                  } ${controlsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                      showProfilePhoto ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Add photo</span>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoUpload}
                  className="hidden"
                  disabled={controlsDisabled}
                />
                <button
                  onClick={() => !controlsDisabled && profilePhotoInputRef.current?.click()}
                  disabled={controlsDisabled}
                  className={`h-7 w-7 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors ${
                    controlsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  <Upload size={14} />
                </button>
              </div>
            )}

            {/* Color Theme Selector */}
            <div className="flex items-center gap-1.5">
              {COLOR_THEMES.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => !controlsDisabled && setSelectedTheme(index)}
                  disabled={controlsDisabled}
                  className={`relative h-5 w-5 rounded-full transition-all ${
                    controlsDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                  }`}
                  style={{ backgroundColor: theme.primary }}
                  title={theme.name}
                >
                  {selectedTheme === index && (
                    <Check size={12} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resume Content */}
        {showResumeLoader ? (
          <div className="flex-1">
            <ResumeSkeleton />
          </div>
        ) : (
          <div
            ref={resumeRef}
            className="resume-container flex-1 overflow-auto"
            style={{ WebkitOverflowScrolling: "touch" }}
            dangerouslySetInnerHTML={{ __html: results.tailoredResumeHtml }}
          />
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <button
          onClick={handleDownload}
          disabled={actionDisabled}
          className={`flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all ${
            actionDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-primary/90 cursor-pointer"
          }`}
        >
          {isDownloading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download size={16} />
              <span>Download PDF</span>
            </>
          )}
        </button>

        {!isMobile && (
          <button
            onClick={handlePrint}
            disabled={actionDisabled}
            className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all ${
              actionDisabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-accent hover:border-primary cursor-pointer"
            }`}
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        )}

        <button
          onClick={reset}
          disabled={loading || !!streamingStarted}
          className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all ${
            loading || streamingStarted
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-accent hover:border-primary cursor-pointer"
          }`}
        >
          <RotateCcw size={16} />
          <span>Start Over</span>
        </button>
      </div>
    </div>
  );
}
