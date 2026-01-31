"use client";
import React from "react";
import { Check } from "lucide-react";
import type { TailorResult } from "@/lib/types";

type AnalysisProps = {
  results: TailorResult;
};

export function Analysis({ results }: AnalysisProps) {
  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* ATS Score */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-6 text-center w-full">
        <div
          className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-none ${
            results.analysis.atsScore >= 85
              ? "text-green-600"
              : results.analysis.atsScore >= 70
                ? "text-amber-600"
                : "text-red-600"
          }`}
        >
          {results.analysis.atsScore}
        </div>
        <div className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Job Compatibility Score
        </div>
        <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full transition-all ${
              results.analysis.atsScore >= 85
                ? "bg-green-500"
                : results.analysis.atsScore >= 70
                  ? "bg-amber-500"
                  : "bg-red-500"
            }`}
            style={{ width: `${results.analysis.atsScore}%` }}
          />
        </div>
      </div>

      {/* Key Skills */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
        <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Skills Required
        </h3>
        <div className="flex flex-wrap gap-2">
          {results.analysis.keySkills.map((skill, i) => (
            <span
              key={i}
              className="rounded-full bg-primary/10 px-2.5 md:px-3 py-1 text-xs text-primary break-words"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Improvements */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
        <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Optimizations Applied
        </h3>
        <div className="flex flex-col gap-2">
          {results.analysis.improvements.map((improvement, i) => (
            <div key={i} className="flex gap-2 text-xs md:text-sm">
              <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
              <span className="break-words">{improvement}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      {results.originalProvided &&
        results.analysis.matchingStrengths.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
            <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Strengths
            </h3>
            <div className="flex flex-col gap-2">
              {results.analysis.matchingStrengths.map((strength, i) => (
                <div key={i} className="flex gap-2 text-xs md:text-sm">
                  <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="break-words">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Gaps */}
      {results.analysis.gaps.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
          <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Areas to Enhance
          </h3>
          <div className="flex flex-col gap-2">
            {results.analysis.gaps.map((gap, i) => (
              <div key={i} className="flex gap-2 text-xs md:text-sm">
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
                <span className="break-words">{gap}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
