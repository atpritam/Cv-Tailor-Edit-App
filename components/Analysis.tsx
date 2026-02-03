"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { TailorResult } from "@/lib/types";
import { SCORING_WEIGHTS, MATCH_LEVELS } from "@/lib/weights";
import { Skeleton } from "@/components/ui/skeleton";

type AnalysisProps = {
  results: TailorResult;
  regenerate: () => void;
  loading: boolean;
  streamingStarted?: boolean;
  refining?: boolean;
};

export function Analysis({
  results,
  regenerate,
  loading,
  streamingStarted,
  refining = false,
}: AnalysisProps) {
  const [showMetrics, setShowMetrics] = useState(false);

  const hasDetailedScoring =
    results.analysis.SkillMatch !== undefined &&
    results.analysis.ExperienceMatch !== undefined &&
    results.analysis.TitleMatch !== undefined &&
    results.analysis.SoftSkillMatch !== undefined;

  const metrics = [
    {
      key: "SkillMatch",
      label: "Skills",
      weight: String(SCORING_WEIGHTS.SkillMatch),
      color: "bg-gradient-to-r from-blue-400 to-blue-700",
    },
    {
      key: "ExperienceMatch",
      label: "Experience",
      weight: String(SCORING_WEIGHTS.ExperienceMatch),
      color: "bg-gradient-to-r from-purple-400 to-purple-700",
    },
    {
      key: "TitleMatch",
      label: "Title Match",
      weight: String(SCORING_WEIGHTS.TitleMatch),
      color: "bg-gradient-to-r from-teal-400 to-teal-700",
    },
    {
      key: "SoftSkillMatch",
      label: "Soft Skills",
      weight: String(SCORING_WEIGHTS.SoftSkillMatch),
      color: "bg-gradient-to-r from-pink-400 to-pink-700",
    },
  ];

  const [animateBars, setAnimateBars] = useState(false);
  const [barsPlayedOnce, setBarsPlayedOnce] = useState(false);

  useEffect(() => {
    let tStart: ReturnType<typeof setTimeout> | null = null;
    let tEnd: ReturnType<typeof setTimeout> | null = null;
    if (showMetrics) {
      if (!barsPlayedOnce) {
        setAnimateBars(false);
        tStart = setTimeout(() => {
          setAnimateBars(true);
        }, 360);
        tEnd = setTimeout(() => {
          setBarsPlayedOnce(true);
        }, 360 + 420);
      } else {
        setAnimateBars(false);
      }
    } else {
      setAnimateBars(false);
    }
    return () => {
      if (tStart) clearTimeout(tStart);
      if (tEnd) clearTimeout(tEnd);
    };
  }, [showMetrics, barsPlayedOnce]);

  const [animateMain, setAnimateMain] = useState(false);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | null = null;
    const score = results.analysis?.atsScore;
    if (typeof score === "number" && score > 0) {
      setAnimateMain(false);
      t = setTimeout(() => setAnimateMain(true), 80);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [results.analysis?.atsScore]);

  useEffect(() => {
    if (loading && !refining) {
      setBarsPlayedOnce(false);
      setAnimateBars(false);
      setAnimateMain(false);
      setShowMetrics(false);
    }
  }, [loading, refining]);

  const isLoadingScore =
    loading && !refining && results.analysis.atsScore === 0;

  return (
    <div className="space-y-6 md:space-y-8 w-full">
      {/* Regenerate Button */}
      <button
        onClick={regenerate}
        disabled={loading || !!streamingStarted}
        className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-primary/20 bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Regenerating ...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            Regenerate Analysis
          </>
        )}
      </button>

      {/* Job Score with Detailed Metrics */}
      <div className="rounded-lg border border-border bg-card overflow-hidden w-full">
        <div className="p-4 md:p-6 text-center">
          {isLoadingScore ? (
            <div className="space-y-3">
              <Skeleton
                className="h-16 md:h-20 rounded-lg mx-auto w-32"
                shimmer
              />
              <Skeleton className="h-4 rounded w-40 mx-auto" shimmer />
              <Skeleton
                className="h-1.5 rounded-full w-full max-w-xs mx-auto"
                shimmer
              />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center gap-2">
                <div
                  className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-none bg-clip-text text-transparent ${
                    (results.analysis.atsScore ?? 0) > MATCH_LEVELS.high
                      ? "bg-gradient-to-r from-green-400 to-green-700"
                      : (results.analysis.atsScore ?? 0) > MATCH_LEVELS.mid
                        ? "bg-gradient-to-r from-amber-400 to-amber-700"
                        : "bg-gradient-to-r from-red-400 to-red-700"
                  }`}
                >
                  {results.analysis.atsScore}
                </div>
              </div>
              <div className="mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Job Compatibility Score
              </div>
              <div className="mx-auto mt-3 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-600 ${
                    (results.analysis.atsScore ?? 0) > MATCH_LEVELS.high
                      ? "bg-gradient-to-r from-green-400 to-green-700"
                      : (results.analysis.atsScore ?? 0) > MATCH_LEVELS.mid
                        ? "bg-gradient-to-r from-amber-400 to-amber-700"
                        : "bg-gradient-to-r from-red-400 to-red-700"
                  }`}
                  style={{
                    width: animateMain ? `${results.analysis.atsScore}%` : "0%",
                  }}
                />
              </div>
            </>
          )}

          {/* Show Metrics Button */}
          {hasDetailedScoring && !isLoadingScore && (
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="mt-4 flex items-center justify-center gap-2 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Info size={14} />
              {showMetrics ? "Hide" : "Show"} Detailed Metrics
              {showMetrics ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>
          )}
        </div>

        {/* Detailed Scoring Breakdown */}
        {hasDetailedScoring && (
          <div
            className={`border-t border-border bg-muted/30 overflow-hidden transition-all ease-in-out ${
              showMetrics
                ? "duration-300 max-h-[800px] opacity-100 py-4 md:py-6"
                : "duration-150 max-h-0 opacity-0 py-0 md:py-0"
            }`}
          >
            <div className="px-4 md:px-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {metrics.map((m, idx) => {
                  const value = (results.analysis as any)[m.key];
                  return (
                    <div className="space-y-2" key={m.key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">
                          {m.label} | Weight: {m.weight}
                        </span>
                        <span className="font-bold text-foreground">
                          {value}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full ${m.color} ${
                            barsPlayedOnce ? "" : "transition-all duration-300"
                          }`}
                          style={{
                            width: barsPlayedOnce
                              ? `${value}%`
                              : animateBars
                                ? `${value}%`
                                : "0%",
                            transitionDelay:
                              !barsPlayedOnce && animateBars
                                ? `${idx * 80}ms`
                                : undefined,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Skills */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
        <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Key Skills Required
        </h3>
        {loading && !refining && results.analysis.keySkills.length === 0 ? (
          <div className="space-y-2">
            <Skeleton className="h-6 rounded-full w-20" shimmer />
            <Skeleton className="h-6 rounded-full w-24" shimmer />
            <Skeleton className="h-6 rounded-full w-16" shimmer />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 px-2.5 md:px-3 py-1 text-xs text-primary break-words animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Improvements */}
      <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
        <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Optimizations Applied
        </h3>
        {loading && !refining && results.analysis.improvements.length === 0 ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-4 rounded mt-0.5" shimmer />
              <Skeleton className="h-4 rounded flex-1" shimmer />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-4 w-4 rounded mt-0.5" shimmer />
              <Skeleton className="h-4 rounded flex-1" shimmer />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {results.analysis.improvements.map((improvement, i) => (
              <div
                key={i}
                className="flex gap-2 text-xs md:text-sm animate-fade-in"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                <span className="break-words">{improvement}</span>
              </div>
            ))}
          </div>
        )}
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
                <div
                  key={i}
                  className="flex gap-2 text-xs md:text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <Check size={16} className="mt-0.5 shrink-0 text-green-600" />
                  <span className="break-words">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Gaps */}
      {results.analysis.gaps.length > 0 &&
        results.analysis.gaps[0] !== "Resume required" && (
          <div className="rounded-lg border border-border bg-card p-4 md:p-6 w-full">
            <h3 className="mb-3 md:mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Areas to Enhance
            </h3>
            <div className="flex flex-col gap-2">
              {results.analysis.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex gap-2 text-xs md:text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-amber-400 to-amber-700 shadow-sm" />
                  <span className="break-words">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
