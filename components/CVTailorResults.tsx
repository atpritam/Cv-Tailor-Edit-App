"use client";

import React, { useRef } from "react";
import {
  Download,
  ArrowRight,
  Check,
  FileText,
  Loader2,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import type { TailorResult } from "@/lib/types";

type CVTailorResultsProps = {
  results: TailorResult;
  loading: boolean;
  regenerate: () => void;
  reset: () => void;
  downloadPDF: () => Promise<void> | void;
  streamingStarted?: boolean;
};

export function CVTailorResults({
  results,
  loading,
  regenerate,
  reset,
  downloadPDF,
  streamingStarted,
}: CVTailorResultsProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  return (
    <div>
      {/* Recommendation Banner */}
      <div
        className={`mb-8 rounded-xl p-6 border ${
          results.recommendation === "apply_as_is"
            ? "bg-[#34d399]/5 border-[#34d399]/20"
            : results.recommendation === "needs_resume"
              ? "bg-[#fbbf24]/5 border-[#fbbf24]/20"
              : "bg-primary/5 border-primary/20"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-xl p-3 ${
              results.recommendation === "apply_as_is"
                ? "bg-[#34d399]/10 text-[#34d399]"
                : results.recommendation === "needs_resume"
                  ? "bg-[#fbbf24]/10 text-[#fbbf24]"
                  : "bg-primary/10 text-primary"
            }`}
          >
            {results.recommendation === "apply_as_is" ? (
              <ThumbsUp size={24} />
            ) : (
              <Sparkles size={24} />
            )}
          </div>
          <div>
            <h2
              className={`text-lg font-semibold ${
                results.recommendation === "apply_as_is"
                  ? "text-[#34d399]"
                  : results.recommendation === "needs_resume"
                    ? "text-[#fbbf24]"
                    : "text-primary"
              }`}
            >
              {results.recommendation === "apply_as_is"
                ? "Your Resume is Ready!"
                : results.recommendation === "needs_resume"
                  ? "Resume Needed for Personalization"
                  : "Tailored Resume Generated"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {results.recommendationReason}
            </p>
          </div>
        </div>
      </div>

      {/* ATS Score */}
      <div className="mb-8 rounded-xl border border-border bg-card p-8 text-center">
        <div
          className={`text-6xl font-bold leading-none md:text-7xl ${
            results.analysis.atsScore >= 85
              ? "text-[#34d399]"
              : results.analysis.atsScore > 65
                ? "text-[#fbbf24]"
                : "text-[#f87171]"
          }`}
        >
          {results.analysis.atsScore}
        </div>
        <div className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Job Compatibility Score
        </div>
        <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all duration-700 ${
              results.analysis.atsScore >= 85
                ? "bg-[#34d399]"
                : results.analysis.atsScore > 65
                  ? "bg-[#fbbf24]"
                  : "bg-[#f87171]"
            }`}
            style={{ width: `${results.analysis.atsScore}%` }}
          />
        </div>
      </div>

      {/* Analysis Grid */}
      <div
        className={`mb-8 grid gap-6 ${
          results.originalProvided ? "md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {/* Key Skills */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Skills Required
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Optimizations Applied
          </h3>
          <div className="flex flex-col gap-2.5">
            {results.analysis.improvements.map((improvement, i) => (
              <div key={i} className="flex gap-2.5 text-sm">
                <div className="h-5 w-5 rounded-full bg-[#34d399]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-[#34d399]" />
                </div>
                <span className="text-muted-foreground">{improvement}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comparison Section */}
      {results.originalProvided &&
        results.analysis.matchingStrengths.length > 0 && (
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Strengths */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Strengths
              </h3>
              <div className="flex flex-col gap-2.5">
                {results.analysis.matchingStrengths.map((strength, i) => (
                  <div key={i} className="flex gap-2.5 text-sm">
                    <div className="h-5 w-5 rounded-full bg-[#34d399]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[#34d399]" />
                    </div>
                    <span className="text-muted-foreground">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            {results.analysis.gaps.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Areas to Enhance
                </h3>
                <div className="flex flex-col gap-2.5">
                  {results.analysis.gaps.map((gap, i) => (
                    <div key={i} className="flex gap-2.5 text-sm">
                      <div className="h-2 w-2 rounded-full bg-[#fbbf24] shrink-0 mt-2" />
                      <span className="text-muted-foreground">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Tailored Resume Preview */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 border-b border-border bg-muted/30 px-5 py-4">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {results.recommendation === "apply_as_is"
              ? "Optimized Resume"
              : "Tailored Resume"}
          </h3>
        </div>
        <div
          ref={resumeRef}
          className="resume-container max-h-[400px] overflow-auto"
          dangerouslySetInnerHTML={{ __html: results.tailoredResumeHtml }}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={async () => {
            try {
              setIsDownloading(true);
              const maybePromise = downloadPDF();
              if (maybePromise && typeof maybePromise.then === "function") {
                await maybePromise;
              }
            } finally {
              setIsDownloading(false);
            }
          }}
          disabled={isDownloading || loading || !!streamingStarted}
          className={`flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-all ${
            isDownloading
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
          onClick={regenerate}
          disabled={loading || !!streamingStarted}
          className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin text-primary" />
              Regenerating...
            </>
          ) : (
            <>
              Regenerate
              <ArrowRight size={16} />
            </>
          )}
        </button>

        <button
          onClick={reset}
          disabled={loading || !!streamingStarted}
          className={`flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/30 ${
            loading || streamingStarted
              ? "cursor-not-allowed opacity-50"
              : "cursor-pointer"
          }`}
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
