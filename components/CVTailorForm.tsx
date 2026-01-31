"use client";

import React, { useRef } from "react";
import { Upload, X, Loader2, ArrowRight } from "lucide-react";

type CVTailorFormProps = {
  resumeText: string;
  setResumeText: (text: string) => void;
  extractLinksFromText: (text: string) => void;
  resumeFile: File | null;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  profilePhotoDataUrl: string | null;
  handleProfilePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resetProfilePhoto: () => void;
  linkedin: string;
  setLinkedin: (text: string) => void;
  github: string;
  setGithub: (text: string) => void;
  jobDescription: string;
  setJobDescription: (text: string) => void;
  error: string;
  loading: boolean;
  handleSubmit: () => void;
};

export function CVTailorForm({
  resumeText,
  setResumeText,
  extractLinksFromText,
  resumeFile,
  handleFileUpload,
  profilePhotoDataUrl,
  handleProfilePhotoUpload,
  resetProfilePhoto,
  linkedin,
  setLinkedin,
  github,
  setGithub,
  jobDescription,
  setJobDescription,
  error,
  loading,
  handleSubmit,
}: CVTailorFormProps) {
  const photoInputRef = useRef<HTMLInputElement | null>(null);

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
                // attempt to extract links when user pastes text
                extractLinksFromText(e.target.value);
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

      {/* User Contact Inputs (Profile Photo, LinkedIn & GitHub optional) */}
      <section className="mb-6">
        <div className="mt-0 flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
          <div className="flex-1 min-w-0">
            <label className="mb-2 block text-sm font-medium">
              Profile Photo (optional)
            </label>
            <div className="flex items-center gap-3">
              <div
                role="button"
                tabIndex={0}
                onClick={() => photoInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    photoInputRef.current?.click();
                  }
                }}
                className="relative h-24 w-24 overflow-hidden rounded-[14px] bg-muted shrink-0 flex items-center justify-center cursor-pointer"
                aria-label="Upload profile photo"
              >
                {profilePhotoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <>
                    <img
                      src={profilePhotoDataUrl}
                      alt="profile"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetProfilePhoto();
                        if (photoInputRef.current) {
                          try {
                            photoInputRef.current.value = "";
                          } catch (err) {
                            // ignore
                          }
                        }
                      }}
                      className="absolute top-1 right-1 z-10 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-destructive shadow-sm hover:bg-white cursor-pointer"
                      aria-label="Remove profile photo"
                      onKeyDown={(ev) => ev.stopPropagation()}
                    >
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <Upload size={20} className="text-muted-foreground" />
                )}
              </div>
              <input
                ref={(el) => {
                  photoInputRef.current = el;
                }}
                type="file"
                accept="image/*"
                onChange={handleProfilePhotoUpload}
                className="hidden"
                aria-hidden
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="mb-2 block text-sm font-medium">
              LinkedIn (optional)
            </label>
            <input
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="https://www.linkedin.com/in/your-profile"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex-1 min-w-0">
            <label className="mb-2 block text-sm font-medium">
              GitHub (optional)
            </label>
            <input
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="https://github.com/your-username"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </section>

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
