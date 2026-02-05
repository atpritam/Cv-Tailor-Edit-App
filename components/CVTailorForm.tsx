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
    <div className="animate-fade-in">
      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-14">
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground text-balance">
          Optimize your resume for any job
        </h2>
        <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
          Upload your resume and paste a job description. Our AI will tailor your experience 
          to highlight the most relevant skills and achievements.
        </p>
      </div>

      <div className="grid gap-8 lg:gap-10">
        {/* Resume Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Your Resume</h3>
              <p className="text-xs text-muted-foreground">Paste content or upload a file</p>
            </div>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full min-h-[240px] resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="md:col-span-2">
              <div
                className={`relative h-full min-h-[240px] rounded-xl border-2 border-dashed transition-all ${
                  resumeFile
                    ? "border-primary/40 bg-primary/5"
                    : "border-border hover:border-primary/40 hover:bg-muted/50"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add("border-primary/40", "bg-primary/5");
                }}
                onDragLeave={(e) => {
                  e.currentTarget.classList.remove("border-primary/40", "bg-primary/5");
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove("border-primary/40", "bg-primary/5");
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
                
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  {resumeFile ? (
                    <div className="space-y-2">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <FileText size={20} className="text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground truncate max-w-full">
                        {resumeFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Click or drag to replace
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Upload size={20} className="text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Drop your file here
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          or click to browse
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground/70">
                        PDF, TXT, or images
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Description Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/20 text-accent-foreground">
              <Briefcase size={16} />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Job Description</h3>
              <p className="text-xs text-muted-foreground">Paste the full job posting</p>
            </div>
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here. Include the title, responsibilities, requirements, and any other relevant details..."
            className="w-full min-h-[280px] resize-y rounded-xl border border-border bg-card p-4 text-sm leading-relaxed placeholder:text-muted-foreground/60 outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          />
        </section>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10">
            <X size={12} className="text-destructive" />
          </div>
          <p className="text-sm text-destructive leading-relaxed">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 md:mt-10">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="group relative w-full overflow-hidden rounded-xl bg-primary px-6 py-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Analyzing your resume...</span>
              </>
            ) : (
              <>
                <span>Analyze and Tailor Resume</span>
                <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </span>
        </button>
        
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Your data is processed securely and never stored
        </p>
      </div>
    </div>
  );
}
