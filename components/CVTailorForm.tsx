"use client";

import React, { useState } from "react";
import {
  Upload,
  X,
  Loader2,
  ArrowRight,
  FileText,
  Briefcase,
  Sparkles,
  Target,
  Zap,
  AlertCircle,
} from "lucide-react";

type CVTailorFormProps = {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  error: string;
  loading: boolean;
  isParsing: boolean;
  handleSubmit: () => void;
};

export function CVTailorForm({
  resumeText,
  setResumeText,
  resumeFile,
  handleFileUpload,
  jobDescription,
  setJobDescription,
  error,
  loading,
  isParsing,
  handleSubmit,
}: CVTailorFormProps) {
  const [resumeError, setResumeError] = useState("");
  const [jobDescError, setJobDescError] = useState("");

  const handleFormSubmit = () => {
    setResumeError("");
    setJobDescError("");

    // Validation
    let hasError = false;

    if (!resumeText.trim() && !resumeFile) {
      setResumeError("Please paste resume text or upload a file");
      hasError = true;
    }

    if (!jobDescription.trim()) {
      setJobDescError("Please paste the job description");
      hasError = true;
    }

    if (!hasError) {
      handleSubmit();
    }
  };
  const isFatalError =
    error &&
    !error.includes("Please enter") &&
    !error.includes("Please provide") &&
    !error.includes("Please paste");
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col relative">
      {/* Hero Section */}
      <section className="relative z-10 py-8 px-4 md:px-6">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
            AI-Powered Resume Optimization
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            <span className="gradient-text">Land more interviews</span>
            <br />
            <span className="text-foreground">with a tailored resume</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-12">
            Our AI Agent analyzes the match, identifies gaps, and generates an
            ATS optimized version in seconds.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="relative z-10 flex-1 px-4 md:px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Steps Container */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 lg:items-start">
            {/* Step 1: Resume */}
            <div className="relative flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Your Resume
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Paste text or upload a file
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl border ${resumeError ? "border-destructive" : "border-border"} bg-card overflow-hidden flex-1 flex flex-col`}
              >
                {/* Textarea */}
                <div className="p-4 border-b border-border flex-1 relative">
                  {resumeError && (
                    <div className="absolute inset-0 p-4 flex items-start gap-2 text-sm text-destructive pointer-events-none">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{resumeError}</span>
                    </div>
                  )}
                  <textarea
                    value={resumeText}
                    onChange={(e) => {
                      setResumeText(e.target.value);
                      if (resumeError) setResumeError("");
                    }}
                    placeholder={
                      resumeError
                        ? ""
                        : "Paste your current resume text here..."
                    }
                    className="h-full min-h-[280px] w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none relative z-10"
                  />
                </div>

                {/* File Upload */}
                <div
                  className={`relative cursor-pointer p-6 transition-all ${
                    resumeFile ? "bg-primary/5" : "hover:bg-accent/50"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add("bg-primary/5");
                  }}
                  onDragLeave={(e) => {
                    e.currentTarget.classList.remove("bg-primary/5");
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove("bg-primary/5");
                    const file = e.dataTransfer.files[0];
                    if (file) {
                      const input = document.createElement("input");
                      input.type = "file";
                      const dataTransfer = new DataTransfer();
                      dataTransfer.items.add(file);
                      input.files = dataTransfer.files;
                      handleFileUpload({
                        target: input,
                      } as unknown as React.ChangeEvent<HTMLInputElement>);
                    }
                  }}
                >
                  <input
                    type="file"
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                  {resumeFile ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          File uploaded successfully
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <Upload className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Drop a file or click to upload
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF, TXT, or image files
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Job Description */}
            <div className="flex flex-col h-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Job Description
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Paste the full job posting
                  </p>
                </div>
              </div>

              <div
                className={`rounded-2xl border ${jobDescError ? "border-destructive" : "border-border"} bg-card overflow-hidden flex-1 flex flex-col`}
              >
                <div className="p-4 flex-1 relative">
                  {jobDescError && (
                    <div className="absolute inset-0 p-4 flex items-start gap-2 text-sm text-destructive pointer-events-none">
                      <AlertCircle size={16} className="shrink-0 mt-0.5" />
                      <span>{jobDescError}</span>
                    </div>
                  )}
                  <textarea
                    value={jobDescription}
                    onChange={(e) => {
                      setJobDescription(e.target.value);
                      if (jobDescError) setJobDescError("");
                    }}
                    placeholder={
                      jobDescError
                        ? ""
                        : "Paste the complete job description here including requirements, responsibilities, and qualifications..."
                    }
                    className="h-full min-h-[340px] w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message - Only show for fatal/backend errors */}
          {isFatalError && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleFormSubmit}
              disabled={loading || isParsing}
              className="group relative w-full flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/10 to-transparent" />

              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Analyzing your resume</span>
                </>
              ) : isParsing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Processing file</span>
                </>
              ) : (
                <>
                  <span>Analyze & Optimize Resume</span>
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
                <Target className="h-4 w-4 text-chart-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Smart Analysis
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI compares skills against job requirements
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Instant Tailoring
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get an optimized resume in seconds
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                <Briefcase className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">
                  Chat Refinement
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Fine-tune results with AI conversation
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
