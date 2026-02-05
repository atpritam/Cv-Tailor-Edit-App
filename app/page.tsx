"use client";

import { useCVTailor } from "@/hooks/useCVTailor";
import { useResumeParser } from "@/hooks/useResumeParser";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { CVTailorForm } from "@/components/CVTailorForm";
import { Analysis } from "@/components/Analysis";
import { ResumePreview } from "@/components/ResumePreview";
import { FileCheck } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function CVTailorApp() {
  const {
    jobDescription,
    setJobDescription,
    resumeText,
    setResumeText,
    results,
    loading,
    streamingStarted,
    error,
    handleSubmit,
    regenerate,
    reset: resetTailor,
    setError,
    chatHistory,
    sendChatMessage,
    undoLastChange,
    redoChange,
    canUndo,
    canRedo,
    refining,
    analysisComplete,
    htmlComplete,
    analysisRetrying,
  } = useCVTailor();

  const { profilePhotoDataUrl, handleProfilePhotoUpload, resetProfilePhoto } =
    useProfilePhoto();

  const {
    resumeFile,
    handleFileUpload,
    reset: resetParser,
  } = useResumeParser({
    setResumeText,
    setError,
  });

  // Height matching between columns
  const analysisRef = useRef<HTMLDivElement>(null);
  const [analysisHeight, setAnalysisHeight] = useState<number | null>(null);

  useEffect(() => {
    const updateHeight = () => {
      if (analysisRef.current && window.innerWidth >= 1280) {
        setAnalysisHeight(analysisRef.current.offsetHeight);
      } else {
        setAnalysisHeight(null);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    
    // Update height when content changes
    const observer = new ResizeObserver(updateHeight);
    if (analysisRef.current) {
      observer.observe(analysisRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateHeight);
      observer.disconnect();
    };
  }, [results, analysisComplete]);

  const handleFullReset = () => {
    resetTailor();
    resetParser();
    resetProfilePhoto();
  };

  const handleFormSubmit = () => {
    handleSubmit();
  };

  const handleRegenerate = () => {
    regenerate();
  };

  const shouldShowResults = streamingStarted || results;

  return (
    <div className="min-h-screen bg-ambient noise-overlay">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-ambient">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="flex h-14 md:h-16 items-center justify-between">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <FileCheck className="h-4 w-4 text-primary" />
              </div>
              <span className="text-base font-semibold text-foreground">
                CV Tailor
              </span>
            </button>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/atpritam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.293 9.395 7.868 10.915.576.106.785-.25.785-.557 0-.275-.01-1.005-.015-1.975-3.2.695-3.877-1.543-3.877-1.543-.523-1.33-1.277-1.684-1.277-1.684-1.044-.714.079-.699.079-.699 1.157.082 1.765 1.19 1.765 1.19 1.026 1.758 2.693 1.251 3.347.957.104-.744.402-1.251.732-1.54-2.554-.29-5.242-1.277-5.242-5.678 0-1.254.45-2.279 1.187-3.083-.119-.29-.515-1.46.113-3.043 0 0 .967-.31 3.17 1.18a11.03 11.03 0 0 1 2.885-.388c.98.004 1.97.132 2.885.388 2.203-1.49 3.168-1.18 3.168-1.18.63 1.584.234 2.753.115 3.043.74.804 1.186 1.829 1.186 3.083 0 4.412-2.692 5.385-5.255 5.67.413.355.78 1.056.78 2.128 0 1.536-.014 2.774-.014 3.152 0 .31.206.667.79.554C20.71 21.39 24 17.082 24 12 24 5.648 18.352.5 12 .5z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/in/atpritam"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 md:pt-16">
        {!shouldShowResults ? (
          <CVTailorForm
            resumeText={resumeText}
            setResumeText={setResumeText}
            resumeFile={resumeFile}
            handleFileUpload={handleFileUpload}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            error={error}
            loading={loading}
            handleSubmit={handleFormSubmit}
          />
        ) : (
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
            <div className="flex flex-col xl:grid xl:grid-cols-[384px_1fr] gap-6 xl:gap-8">
              {/* Left Panel - Analysis */}
              <aside ref={analysisRef} className="w-full order-2 xl:order-1">
                <Analysis
                  results={results!}
                  regenerate={handleRegenerate}
                  loading={loading}
                  refining={refining}
                  streamingStarted={streamingStarted}
                  analysisComplete={analysisComplete}
                  analysisRetrying={analysisRetrying}
                />
              </aside>

              {/* Right Panel - Preview & Chat */}
              <div className="min-w-0 order-1 xl:order-2">
                <ResumePreview
                  constrainedHeight={analysisHeight}
                  results={results!}
                  loading={loading}
                  regenerate={handleRegenerate}
                  reset={handleFullReset}
                  chatHistory={chatHistory}
                  sendChatMessage={sendChatMessage}
                  profilePhotoDataUrl={profilePhotoDataUrl}
                  handleProfilePhotoUpload={handleProfilePhotoUpload}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  onUndo={undoLastChange}
                  onRedo={redoChange}
                  streamingStarted={streamingStarted}
                  htmlComplete={htmlComplete}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer - only on form page */}
      {!shouldShowResults && (
        <footer className="border-t border-border/50 py-6 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Google Gemini AI
          </p>
        </footer>
      )}
    </div>
  );
}
