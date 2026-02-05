"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
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
  analysisComplete?: boolean;
  analysisRetrying?: boolean;
};

export function Analysis({
  results,
  regenerate,
  loading,
  streamingStarted,
  refining = false,
  analysisComplete = false,
  analysisRetrying = false,
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
      color: "bg-primary",
    },
    {
      key: "ExperienceMatch",
      label: "Experience",
      weight: String(SCORING_WEIGHTS.ExperienceMatch),
      color: "bg-chart-2",
    },
    {
      key: "TitleMatch",
      label: "Title Match",
      weight: String(SCORING_WEIGHTS.TitleMatch),
      color: "bg-chart-3",
    },
    {
      key: "SoftSkillMatch",
      label: "Soft Skills",
      weight: String(SCORING_WEIGHTS.SoftSkillMatch),
      color: "bg-chart-5",
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
    if ((loading && !refining) || analysisRetrying) {
      setBarsPlayedOnce(false);
      setAnimateBars(false);
      setAnimateMain(false);
      setShowMetrics(false);
    }
  }, [loading, refining, analysisRetrying]);

  const isLoadingScore =
    (!analysisComplete || analysisRetrying) &&
    !refining &&
    (loading || streamingStarted || analysisRetrying);

  const getScoreColor = (score: number) => {
    if (score > MATCH_LEVELS.high) return "text-[#34d399]";
    if (score > MATCH_LEVELS.mid) return "text-[#fbbf24]";
    return "text-[#f87171]";
  };

  const getScoreBarColor = (score: number) => {
    if (score > MATCH_LEVELS.high) return "bg-[#34d399]";
    if (score > MATCH_LEVELS.mid) return "bg-[#fbbf24]";
    return "bg-[#f87171]";
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full">
      {/* Regenerate Button */}
      <button
        onClick={regenerate}
        disabled={loading || !!streamingStarted}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/30 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin text-primary" />
            <span>Regenerating...</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} className="text-primary" />
            <span>Regenerate Analysis</span>
          </>
        )}
      </button>

      {/* Job Score Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden w-full">
        <div className="p-6 md:p-8">
          {isLoadingScore ? (
            <div className="space-y-4">
              <Skeleton className="h-20 md:h-24 rounded-lg mx-auto w-36" shimmer />
              <Skeleton className="h-4 rounded w-44 mx-auto" shimmer />
              <Skeleton className="h-2 rounded-full w-full max-w-xs mx-auto" shimmer />
            </div>
          ) : (
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center mb-2">
                <div
                  className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight ${getScoreColor(results.analysis.atsScore ?? 0)}`}
                >
                  {results.analysis.atsScore}
                </div>
              </div>
              <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                Job Compatibility Score
              </div>
              <div className="mx-auto h-2 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-700 ease-out ${getScoreBarColor(results.analysis.atsScore ?? 0)}`}
                  style={{
                    width: animateMain ? `${results.analysis.atsScore}%` : "0%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Show Metrics Button */}
          {hasDetailedScoring && !isLoadingScore && (
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="mt-6 flex items-center justify-center gap-2 mx-auto text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer group"
            >
              <BarChart3 size={14} className="group-hover:text-primary" />
              <span>{showMetrics ? "Hide" : "Show"} Detailed Metrics</span>
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
                ? "duration-300 max-h-[800px] opacity-100 py-5 md:py-6"
                : "duration-150 max-h-0 opacity-0 py-0"
            }`}
          >
            <div className="px-5 md:px-6 space-y-4">
              {metrics.map((m, idx) => {
                const value = (results.analysis as Record<string, unknown>)[m.key] as number;
                return (
                  <div className="space-y-2" key={m.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-muted-foreground">
                        {m.label}
                        <span className="ml-2 text-muted-foreground/60">
                          Weight: {m.weight}
                        </span>
                      </span>
                      <span className="font-bold text-foreground tabular-nums">
                        {value}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${m.color} ${
                          barsPlayedOnce ? "" : "transition-all duration-500"
                        }`}
                        style={{
                          width: barsPlayedOnce
                            ? `${value}%`
                            : animateBars
                              ? `${value}%`
                              : "0%",
                          transitionDelay:
                            !barsPlayedOnce && animateBars
                              ? `${idx * 100}ms`
                              : undefined,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Key Skills */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Target size={16} className="text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Skills Required
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 rounded-full w-20" shimmer />
            <Skeleton className="h-7 rounded-full w-24" shimmer />
            <Skeleton className="h-7 rounded-full w-16" shimmer />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-medium text-primary animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Improvements */}
      <div className="rounded-xl border border-border bg-card p-5 md:p-6 w-full">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Optimizations Applied
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="space-y-3">
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
          <div className="flex flex-col gap-2.5">
            {results.analysis.improvements.map((improvement, i) => (
              <div
                key={i}
                className="flex gap-2.5 text-xs md:text-sm animate-fade-in"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="h-5 w-5 rounded-full bg-[#34d399]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={12} className="text-[#34d399]" />
                </div>
                <span className="text-muted-foreground leading-relaxed">{improvement}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strengths */}
      {results.originalProvided &&
        results.analysis.matchingStrengths.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6 w-full">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Strengths
              </h3>
            </div>
            <div className="flex flex-col gap-2.5">
              {results.analysis.matchingStrengths.map((strength, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 text-xs md:text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="h-5 w-5 rounded-full bg-[#34d399]/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} className="text-[#34d399]" />
                  </div>
                  <span className="text-muted-foreground leading-relaxed">{strength}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Gaps */}
      {results.analysis.gaps.length > 0 &&
        results.analysis.gaps[0] !== "Resume required" && (
          <div className="rounded-xl border border-border bg-card p-5 md:p-6 w-full">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Areas to Enhance
            </h3>
            <div className="flex flex-col gap-2.5">
              {results.analysis.gaps.map((gap, i) => (
                <div
                  key={i}
                  className="flex gap-2.5 text-xs md:text-sm animate-fade-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="h-2 w-2 rounded-full bg-[#fbbf24] shrink-0 mt-2" />
                  <span className="text-muted-foreground leading-relaxed">{gap}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
