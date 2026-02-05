"use client";

import React from "react";
import { Upload, X, Loader2, ArrowRight, FileText, Briefcase } from "lucide-react";

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
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
          Optimize Your Resume for
          <span className="text-primary block mt-1">Any Job Description</span>
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
          Our AI analyzes your resume against job requirements, identifies gaps, and generates a tailored version that increases your chances of landing interviews.
        </p>
      </div>

      {/* Form Container */}
      <div className="space-y-8">
        {/* Resume Upload Section */}
        <section className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Resume</h3>
              <p className="text-sm text-muted-foreground">Paste your resume text or upload a file</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4">
            <div className="lg:w-3/5 w-full">
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                }}
                placeholder="Paste your current resume text here for personalized optimization..."
                className="min-h-[220px] w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="lg:w-2/5 w-full">
              <div
                className={`relative cursor-pointer rounded-lg border-2 min-h-[220px] w-full p-4 transition-all ${
                  resumeFile
                    ? "border-primary/50 bg-primary/5"
                    : "border-dashed border-border text-center hover:border-primary/50 hover:bg-primary/5 flex items-center justify-center flex-col"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary/50", "bg-primary/5");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-primary/50", "bg-primary/5");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary/50", "bg-primary/5");
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
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground truncate max-w-full px-2">
                      {resumeFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">File uploaded successfully</p>
                  </div>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Click or drag file to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supports PDF and TXT files
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Job Description Input */}
        <section className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Job Description</h3>
              <p className="text-sm text-muted-foreground">Paste the full job posting you want to apply for</p>
            </div>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="min-h-[200px] w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60"
          />
        </section>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
            <X size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Analyzing Resume...
            </>
          ) : (
            <>
              Analyze & Tailor Resume
              <ArrowRight size={20} />
            </>
          )}
        </button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-sm font-bold">1</span>
            </div>
            <p className="text-sm text-muted-foreground">AI-powered analysis</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-sm font-bold">2</span>
            </div>
            <p className="text-sm text-muted-foreground">Keyword optimization</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary text-sm font-bold">3</span>
            </div>
            <p className="text-sm text-muted-foreground">Instant PDF export</p>
          </div>
        </div>
      </div>
    </div>
  );
}
