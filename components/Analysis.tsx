"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  AlertCircle,
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
  htmlComplete?: boolean;
};

export function Analysis({
  results,
  regenerate,
  loading,
  streamingStarted,
  refining = false,
  analysisComplete = false,
  analysisRetrying = false,
  htmlComplete = false,
}: AnalysisProps) {
  const [showDetails, setShowDetails] = useState(false);
  const scoreRef = useRef<SVGCircleElement>(null);

  const hasDetailedScoring =
    results.analysis.SkillMatch !== undefined &&
    results.analysis.ExperienceMatch !== undefined &&
    results.analysis.TitleMatch !== undefined &&
    results.analysis.SoftSkillMatch !== undefined;

  const metrics = [
    {
      key: "SkillMatch",
      label: "Technical Skills",
      weight: SCORING_WEIGHTS.SkillMatch,
    },
    {
      key: "ExperienceMatch",
      label: "Experience",
      weight: SCORING_WEIGHTS.ExperienceMatch,
    },
    {
      key: "TitleMatch",
      label: "Role Alignment",
      weight: SCORING_WEIGHTS.TitleMatch,
    },
    {
      key: "SoftSkillMatch",
      label: "Soft Skills",
      weight: SCORING_WEIGHTS.SoftSkillMatch,
    },
  ];

  const isLoadingScore =
    (!analysisComplete || analysisRetrying) &&
    !refining &&
    (loading || streamingStarted || analysisRetrying);

  const isLoadingOptimizations =
    !htmlComplete && !refining && (loading || streamingStarted);

  const score = results.analysis?.atsScore ?? 0;

  const getScoreColor = (s: number) => {
    if (s >= MATCH_LEVELS.high) return "#22c55e";
    if (s >= MATCH_LEVELS.mid) return "#f59e0b";
    return "#ef4444";
  };

  const getScoreLabel = (s: number) => {
    if (s >= MATCH_LEVELS.high) return "Excellent Match";
    if (s >= MATCH_LEVELS.mid) return "Good Match";
    if (s >= MATCH_LEVELS.low) return "Moderate Match";
    else return "Needs Work";
    return "Needs Work";
  };

  const [animatedScore, setAnimatedScore] = useState(0);
  useEffect(() => {
    if (!isLoadingScore && score > 0) {
      setAnimatedScore(0);
      const timer = setTimeout(() => setAnimatedScore(score), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoadingScore, score]);

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset =
    circumference - (animatedScore / 100) * circumference;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-6">
          {isLoadingScore ? (
            <div className="flex flex-col items-center py-4">
              <Skeleton className="h-28 w-28 rounded-full mb-4" shimmer />
              <Skeleton className="h-4 w-24 rounded mb-2" shimmer />
              <Skeleton className="h-3 w-32 rounded" shimmer />
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {/* Circular Score */}
              <div className="relative w-28 h-28 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="6"
                    className="text-muted"
                  />
                  {/* Score circle */}
                  <circle
                    ref={scoreRef}
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getScoreColor(score)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                {/* Score number */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="text-3xl font-bold tabular-nums"
                    style={{ color: getScoreColor(score) }}
                  >
                    {animatedScore}
                  </span>
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm font-medium text-foreground mb-1">
                  {getScoreLabel(score)}
                </div>
                <div className="text-xs text-muted-foreground">
                  Job Compatibility Score
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metrics Toggle */}
        {hasDetailedScoring && !isLoadingScore && (
          <>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-center gap-2 py-3 border-t border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <span>{showDetails ? "Hide" : "Show"} breakdown</span>
              {showDetails ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}
            </button>

            {/* Metrics Breakdown */}
            <div
              className={`overflow-hidden transition-all duration-300 ${
                showDetails ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 py-4 space-y-4 border-t border-border bg-muted/30">
                {metrics.map((m, index) => {
                  const value =
                    (results.analysis as unknown as Record<string, number>)[
                      m.key
                    ] ?? 0;
                  return (
                    <div key={m.key} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {value}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: showDetails ? `${value}%` : "0%",
                            backgroundColor: getScoreColor(value),
                            transition: showDetails
                              ? `width 800ms ease-out ${index * 100}ms`
                              : "none",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Regenerate Button */}
      <button
        onClick={regenerate}
        disabled={loading || !!streamingStarted}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 text-sm font-medium text-foreground hover:bg-accent hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin text-primary" />
            <span>Generating</span>
          </>
        ) : (
          <>
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </>
        )}
      </button>

      {/* Key Skills */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target size={14} className="text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Key Skills Required
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" shimmer />
            <Skeleton className="h-6 w-20 rounded-full" shimmer />
            <Skeleton className="h-6 w-14 rounded-full" shimmer />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium animate-stagger-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Improvements Applied */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Check size={14} className="text-chart-5" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Optimizations Made
          </h3>
        </div>
        {isLoadingOptimizations ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" shimmer />
            <Skeleton className="h-4 w-5/6 rounded" shimmer />
          </div>
        ) : (
          <ul className="space-y-2">
            {results.analysis.improvements.map((item, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-xs text-muted-foreground animate-stagger-in"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <div className="h-4 w-4 rounded-full bg-chart-5/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={10} className="text-chart-5" />
                </div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Strengths */}
      {isLoadingScore && results.originalProvided ? (
        <div className="hidden xl:block rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-chart-5" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Strengths
            </h3>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" shimmer />
            <Skeleton className="h-4 w-5/6 rounded" shimmer />
          </div>
        </div>
      ) : (
        results.originalProvided &&
        results.analysis.matchingStrengths.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-chart-5" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Strengths
              </h3>
            </div>
            <ul className="space-y-2">
              {results.analysis.matchingStrengths.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-xs text-muted-foreground animate-stagger-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="h-4 w-4 rounded-full bg-chart-5/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={10} className="text-chart-5" />
                  </div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* Gaps */}
      {isLoadingScore ? (
        <div className="hidden xl:block rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={14} className="text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Areas to Strengthen
            </h3>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" shimmer />
            <Skeleton className="h-4 w-5/6 rounded" shimmer />
          </div>
        </div>
      ) : (
        results.analysis.gaps.length > 0 &&
        results.analysis.gaps[0] !== "Resume required" && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={14} className="text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Areas to Strengthen
              </h3>
            </div>
            <ul className="space-y-2">
              {results.analysis.gaps.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-2.5 text-xs text-muted-foreground animate-stagger-in"
                  style={{ animationDelay: `${i * 75}ms` }}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
