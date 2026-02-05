"use client";
import React, { useState, useEffect } from "react";
import {
  Check,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Zap,
  Target,
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
      color: "bg-chart-1",
    },
    {
      key: "ExperienceMatch",
      label: "Experience",
      weight: String(SCORING_WEIGHTS.ExperienceMatch),
      color: "bg-chart-3",
    },
    {
      key: "TitleMatch",
      label: "Title Match",
      weight: String(SCORING_WEIGHTS.TitleMatch),
      color: "bg-chart-4",
    },
    {
      key: "SoftSkillMatch",
      label: "Soft Skills",
      weight: String(SCORING_WEIGHTS.SoftSkillMatch),
      color: "bg-chart-2",
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

  const scoreColor = (score: number) => {
    if (score > MATCH_LEVELS.high) return "text-success";
    if (score > MATCH_LEVELS.mid) return "text-accent";
    return "text-destructive";
  };

  const scoreBgColor = (score: number) => {
    if (score > MATCH_LEVELS.high) return "bg-success";
    if (score > MATCH_LEVELS.mid) return "bg-accent";
    return "bg-destructive";
  };

  return (
    <div className="space-y-4 w-full">
      {/* Regenerate Button */}
      <button
        onClick={regenerate}
        disabled={loading || !!streamingStarted}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-border/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Regenerating...
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            Regenerate Analysis
          </>
        )}
      </button>

      {/* Job Score Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 md:p-6">
          {isLoadingScore ? (
            <div className="space-y-4">
              <Skeleton className="h-20 rounded-lg mx-auto w-28" shimmer />
              <Skeleton className="h-3 rounded w-32 mx-auto" shimmer />
              <Skeleton className="h-2 rounded-full w-full max-w-[200px] mx-auto" shimmer />
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className={`text-5xl md:text-6xl font-semibold tabular-nums ${scoreColor(results.analysis.atsScore ?? 0)}`}>
                  {results.analysis.atsScore}
                </span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Compatibility Score
              </p>
              <div className="mt-4 h-1.5 w-full max-w-[200px] mx-auto overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full transition-all duration-700 ease-out ${scoreBgColor(results.analysis.atsScore ?? 0)}`}
                  style={{
                    width: animateMain ? `${results.analysis.atsScore}%` : "0%",
                  }}
                />
              </div>
            </div>
          )}

          {/* Show Metrics Toggle */}
          {hasDetailedScoring && !isLoadingScore && (
            <button
              onClick={() => setShowMetrics(!showMetrics)}
              className="mt-4 flex items-center justify-center gap-1.5 mx-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showMetrics ? "Hide" : "View"} breakdown
              {showMetrics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {/* Detailed Metrics */}
        {hasDetailedScoring && (
          <div
            className={`border-t border-border bg-muted/30 overflow-hidden transition-all ease-out ${
              showMetrics
                ? "duration-300 max-h-[600px] opacity-100"
                : "duration-200 max-h-0 opacity-0"
            }`}
          >
            <div className="p-5 space-y-4">
              {metrics.map((m, idx) => {
                const value = (results.analysis as Record<string, number>)[m.key];
                return (
                  <div key={m.key} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {m.label}
                        <span className="text-muted-foreground/60 ml-1">({m.weight}x)</span>
                      </span>
                      <span className="font-medium text-foreground tabular-nums">{value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${m.color} ${barsPlayedOnce ? "" : "transition-all duration-500"}`}
                        style={{
                          width: barsPlayedOnce ? `${value}%` : animateBars ? `${value}%` : "0%",
                          transitionDelay: !barsPlayedOnce && animateBars ? `${idx * 100}ms` : undefined,
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
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Target size={14} className="text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Key Skills Required
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 rounded-full w-16" shimmer />
            <Skeleton className="h-7 rounded-full w-20" shimmer />
            <Skeleton className="h-7 rounded-full w-14" shimmer />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {results.analysis.keySkills.map((skill, i) => (
              <span
                key={i}
                className="inline-flex rounded-full bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary animate-fade-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Improvements */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-muted-foreground" />
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Optimizations Applied
          </h3>
        </div>
        {isLoadingScore ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded shrink-0" shimmer />
              <Skeleton className="h-4 rounded flex-1" shimmer />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-4 w-4 rounded shrink-0" shimmer />
              <Skeleton className="h-4 rounded flex-1" shimmer />
            </div>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {results.analysis.improvements.map((improvement, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <span className="text-foreground/90 leading-relaxed">{improvement}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Strengths */}
      {results.originalProvided && results.analysis.matchingStrengths.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Your Strengths
            </h3>
          </div>
          <ul className="space-y-2.5">
            {results.analysis.matchingStrengths.map((strength, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Check size={16} className="mt-0.5 shrink-0 text-success" />
                <span className="text-foreground/90 leading-relaxed">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {results.analysis.gaps.length > 0 && results.analysis.gaps[0] !== "Resume required" && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={14} className="text-muted-foreground" />
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Areas to Enhance
            </h3>
          </div>
          <ul className="space-y-2.5">
            {results.analysis.gaps.map((gap, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-sm animate-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="text-foreground/90 leading-relaxed">{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
