"use client";

import React from "react";
import { Upload, X, Loader2, ArrowRight, FileText, Briefcase, Sparkles, Target, Zap } from "lucide-react";

type CVTailorFormProps = {
  resumeText: string;
  setResumeText: (text: string) => void;
  resumeFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  error: string;
  loading: boolean;
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
  handleSubmit,
}: CVTailorFormProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 lg:py-32 px-4 md:px-6 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-chart-2/5 rounded-full blur-3xl" />
        </div>
        
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Resume Optimization
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
            <span className="gradient-text">Land more interviews</span>
            <br />
            <span className="text-foreground">with a tailored resume</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-12">
            Paste your resume and job description. Our AI analyzes the match, identifies gaps, 
            and generates an optimized version in seconds.
          </p>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-score-high" />
              <span>ATS-Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Keyword Matching</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-chart-2" />
              <span>Instant Results</span>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="flex-1 px-4 md:px-6 pb-16 md:pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Steps Container */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Step 1: Resume */}
            <div className="relative">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Your Resume</h2>
                  <p className="text-sm text-muted-foreground">Paste text or upload a file</p>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                {/* Textarea */}
                <div className="p-4 border-b border-border">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your current resume text here..."
                    className="min-h-[280px] w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
                
                {/* File Upload */}
                <div
                  className={`relative cursor-pointer p-6 transition-all ${
                    resumeFile
                      ? "bg-primary/5"
                      : "hover:bg-accent/50"
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
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Job Description</h2>
                  <p className="text-sm text-muted-foreground">Paste the full job posting</p>
                </div>
              </div>
              
              <div className="rounded-2xl border border-border bg-card overflow-hidden h-[calc(100%-52px)]">
                <div className="p-4 h-full">
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here including requirements, responsibilities, and qualifications..."
                    className="min-h-[340px] h-full w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
              <X size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Analyzing your resume...</span>
                </>
              ) : (
                <>
                  <span>Analyze & Optimize Resume</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border card-hover">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-5/10">
                <Target className="h-4 w-4 text-chart-5" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Smart Analysis</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI compares your skills against job requirements
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border card-hover">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Instant Tailoring</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get an optimized resume in seconds
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border card-hover">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-chart-2/10">
                <Briefcase className="h-4 w-4 text-chart-2" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Chat Refinement</h3>
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
