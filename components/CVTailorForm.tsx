"use client";

import React from "react";
import { Upload, X, Loader2, ArrowRight } from "lucide-react";

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
  // photo upload and social inputs removed from initial form

  return (
    <>
      {/* Resume Upload Section */}
      <section className="mb-12">
        <label className="mb-3 block text-sm font-medium uppercase tracking-wide">
          Your Resume*
        </label>

        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-3/5 w-full">
            <textarea
              value={resumeText}
              onChange={(e) => {
                setResumeText(e.target.value);
              }}
              placeholder="Paste your current resume text here for personalized optimization..."
              className="min-h-50 w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="md:w-2/5 w-full">
            <div
              className={`relative cursor-pointer rounded-lg border-2 min-h-50 w-full p-4 transition-colors ${
                resumeFile
                  ? "border-border text-left"
                  : "border-dashed border-border text-center hover:border-primary hover:bg-muted/30 flex items-center justify-center flex-col"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add("border-primary", "bg-muted/30");
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-muted/30",
                );
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove(
                  "border-primary",
                  "bg-muted/30",
                );
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
                <div className="flex items-center">
                  <p className="mb-0 text-sm font-medium truncate">
                    {resumeFile.name}
                  </p>
                </div>
              ) : (
                <>
                  <Upload
                    size={32}
                    className="mx-auto mb-3 text-muted-foreground"
                  />
                  <p className="mb-1 text-sm font-medium">
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

      {/* Contact/social/photo inputs removed from initial form per request */}

      {/* Job Description Input */}
      <section className="mb-12">
        <label className="mb-3 block text-sm font-medium uppercase tracking-wide">
          Job Description*
        </label>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          className="min-h-75 w-full resize-y rounded-lg border border-border bg-background p-4 text-sm leading-relaxed outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </section>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
          <X size={16} />
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analyzing Resume...
          </>
        ) : (
          <>
            Analyze & Tailor Resume
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </>
  );
}
