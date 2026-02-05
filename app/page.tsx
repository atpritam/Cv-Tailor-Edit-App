"use client";

import { useCVTailor } from "@/hooks/useCVTailor";
import { useResumeParser } from "@/hooks/useResumeParser";
import { useProfilePhoto } from "@/hooks/useProfilePhoto";
import { CVTailorForm } from "@/components/CVTailorForm";
import { Analysis } from "@/components/Analysis";
import { ResumePreview } from "@/components/ResumePreview";

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

  // KEY CHANGE: Shows results page as soon as streaming starts
  const shouldShowResults = streamingStarted || results;

  return (
    <div className="min-h-screen bg-background text-foreground bg-pattern">
      {/* Header */}
      <header className="border-b border-border/50 px-4 py-4 md:px-6 md:py-5 sticky top-0 bg-background/95 backdrop-blur-sm z-100">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div
            onClick={() => window.location.reload()}
            className="cursor-pointer group"
          >
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl flex items-center gap-2 md:gap-3">
              <div className="flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <svg
                  aria-hidden="true"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 md:h-5 md:w-5 text-primary"
                  role="img"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                  <path d="M9.5 13.5l1.8 1.8 3.7-4" />
                </svg>
              </div>
              <span className="text-foreground">CV Tailor</span>
            </h1>
            <p className="mt-1 text-xs md:text-sm text-muted-foreground ml-11 md:ml-12">
              AI-powered Resume Optimization
            </p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/atpritam"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 .5C5.648.5.5 5.648.5 12c0 5.086 3.293 9.395 7.868 10.915.576.106.785-.25.785-.557 0-.275-.01-1.005-.015-1.975-3.2.695-3.877-1.543-3.877-1.543-.523-1.33-1.277-1.684-1.277-1.684-1.044-.714.079-.699.079-.699 1.157.082 1.765 1.19 1.765 1.19 1.026 1.758 2.693 1.251 3.347.957.104-.744.402-1.251.732-1.54-2.554-.29-5.242-1.277-5.242-5.678 0-1.254.45-2.279 1.187-3.083-.119-.29-.515-1.46.113-3.043 0 0 .967-.31 3.17 1.18a11.03 11.03 0 0 1 2.885-.388c.98.004 1.97.132 2.885.388 2.203-1.49 3.168-1.18 3.168-1.18.63 1.584.234 2.753.115 3.043.74.804 1.186 1.829 1.186 3.083 0 4.412-2.692 5.385-5.255 5.67.413.355.78 1.056.78 2.128 0 1.536-.014 2.774-.014 3.152 0 .31.206.667.79.554C20.71 21.39 24 17.082 24 12 24 5.648 18.352.5 12 .5z" />
              </svg>
            </a>

            <a
              href="https://linkedin.com/in/atpritam"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8.98h3.96V24H.5V8.98zM8.5 8.98h3.8v2.06h.06c.53-1 1.82-2.06 3.75-2.06 4.01 0 4.75 2.64 4.75 6.07V24h-3.96v-7.02c0-1.67-.03-3.82-2.33-3.82-2.34 0-2.7 1.83-2.7 3.71V24H8.5V8.98z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-12">
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
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 w-full">
            {/* Analysis Sidebar */}
            <aside className="w-full lg:col-span-4 order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
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
            {/* Main Content */}
            <div className="w-full lg:col-span-8 order-1 lg:order-2 min-w-0">
              <ResumePreview
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-6 md:px-6 md:py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Powered by <span className="text-primary font-medium">Google Gemini AI</span>
        </p>
      </footer>
    </div>
  );
}
