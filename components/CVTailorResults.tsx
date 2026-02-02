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
  downloadPDF: () => void;
};

export function CVTailorResults({
  results,
  loading,
  regenerate,
  reset,
  downloadPDF,
}: CVTailorResultsProps) {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  return (
    <div>
      {/* Recommendation Banner */}
      <div
        className={`mb-8 rounded-lg p-6 ${
          results.recommendation === "apply_as_is"
            ? "bg-green-50 border border-green-200"
            : results.recommendation === "needs_resume"
              ? "bg-amber-50 border border-amber-200"
              : "bg-blue-50 border border-blue-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div
            className={`rounded-full p-2 ${
              results.recommendation === "apply_as_is"
                ? "bg-gradient-to-br from-green-400 to-green-700 text-white shadow-sm"
                : results.recommendation === "needs_resume"
                  ? "bg-gradient-to-br from-amber-400 to-amber-700 text-white shadow-sm"
                  : "bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-sm"
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
                  ? "text-green-800"
                  : results.recommendation === "needs_resume"
                    ? "text-amber-800"
                    : "text-blue-800"
              }`}
            >
              {results.recommendation === "apply_as_is"
                ? "Your Resume is Ready!"
                : results.recommendation === "needs_resume"
                  ? "Resume Needed for Personalization"
                  : "Tailored Resume Generated"}
            </h2>
            <p
              className={`mt-1 text-sm ${
                results.recommendation === "apply_as_is"
                  ? "text-green-700"
                  : results.recommendation === "needs_resume"
                    ? "text-amber-700"
                    : "text-blue-700"
              }`}
            >
              {results.recommendationReason}
            </p>
          </div>
        </div>
      </div>

      {/* ATS Score */}
      <div className="mb-8 rounded-lg border border-border bg-card p-8 text-center">
        <div
          className={`text-6xl font-bold leading-none md:text-7xl ${
            results.analysis.atsScore >= 85
              ? "bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-700"
              : results.analysis.atsScore > 65
                ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-700"
                : "bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-700"
          }`}
        >
          {results.analysis.atsScore}
        </div>
        <div className="mt-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Job Compatibility Score
        </div>
        <div className="mx-auto mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${
              results.analysis.atsScore >= 85
                ? "bg-gradient-to-r from-green-400 to-green-700"
                : results.analysis.atsScore > 65
                  ? "bg-gradient-to-r from-amber-400 to-amber-700"
                  : "bg-gradient-to-r from-red-400 to-red-700"
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
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Skills Required
          </h3>
          <div className="flex flex-wrap gap-2">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Optimizations Applied
          </h3>
          <div className="flex flex-col gap-2">
            {results.analysis.improvements.map((improvement, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                <span>{improvement}</span>
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
            <div className="rounded-lg border border-border bg-card p-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Strengths
              </h3>
              <div className="flex flex-col gap-2">
                {results.analysis.matchingStrengths.map((strength, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <Check
                      size={16}
                      className="mt-0.5 shrink-0 text-green-600"
                    />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gaps */}
            {results.analysis.gaps.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Areas to Enhance
                </h3>
                <div className="flex flex-col gap-2">
                  {results.analysis.gaps.map((gap, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 shadow-sm" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      {/* Tailored Resume Preview */}
      <div className="mb-6 overflow-hidden rounded-lg border border-border">
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-6 py-4">
          <FileText size={16} />
          <h3 className="text-xs font-semibold uppercase tracking-wider">
            {results.recommendation === "apply_as_is"
              ? "Optimized Resume"
              : "Tailored Resume"}
          </h3>
        </div>
        <div
          ref={resumeRef}
          className="resume-container max-h-150 overflow-auto"
          dangerouslySetInnerHTML={{ __html: results.tailoredResumeHtml }}
        />
      </div>

      {/* Action Buttons */}
      <div className="grid gap-4 md:grid-cols-3">
        <button
          onClick={async () => {
            try {
              setIsDownloading(true);
              const maybePromise: any = downloadPDF();
              if (maybePromise && typeof maybePromise.then === "function") {
                await maybePromise;
              }
            } finally {
              setIsDownloading(false);
            }
          }}
          disabled={isDownloading}
          className={`flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 ${
            isDownloading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
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
              Download / Print PDF
            </>
          )}
        </button>

        <button
          onClick={regenerate}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
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
          className="flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-4 text-sm font-medium text-foreground transition-colors hover:bg-muted cursor-pointer"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
