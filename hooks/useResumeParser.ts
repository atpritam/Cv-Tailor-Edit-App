"use client";

import { useState } from "react";

type ResumeParserProps = {
  setResumeText: (text: string) => void;
  setLinkedin: (url: string) => void;
  setGithub: (url: string) => void;
  setError: (error: string) => void;
  linkedin: string;
  github: string;
};

export function useResumeParser({
  setResumeText,
  setLinkedin,
  setGithub,
  setError,
  linkedin,
  github,
}: ResumeParserProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const extractLinksFromText = (text: string) => {
    if (!text) return;

    if (!linkedin) {
      const lkMatch =
        text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[\S)]+/i) ||
        text.match(/(?:www\.)?linkedin\.com\/[\S)]+/i);
      if (lkMatch) {
        const url = lkMatch[0].startsWith("http")
          ? lkMatch[0]
          : `https://${lkMatch[0]}`;
        setLinkedin(url.trim());
      }
    }

    if (!github) {
      const ghMatch =
        text.match(/https?:\/\/(?:www\.)?github\.com\/[\S)]+/i) ||
        text.match(/(?:www\.)?github\.com\/[\S)]+/i);
      if (ghMatch) {
        const url = ghMatch[0].startsWith("http")
          ? ghMatch[0]
          : `https://${ghMatch[0]}`;
        setGithub(url.trim());
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setError("");

    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      extractLinksFromText(text);
    } else if (file.type === "application/pdf") {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import("pdfjs-dist/webpack");

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ("str" in item ? item.str : ""))
            .join(" ");
          fullText += pageText + "\n\n";
        }

        const trimmed = fullText.trim();
        setResumeText(trimmed);
        extractLinksFromText(trimmed);
      } catch (pdfError) {
        console.error("[v0] PDF parsing error:", pdfError);
        setError(
          "Failed to parse PDF. Please try pasting your resume text instead.",
        );
        setResumeText("");
      }
    } else if (file.type.startsWith("image/")) {
      setResumeText(
        `[Image File: ${file.name}] - Note: Image parsing is not yet supported. Please paste the text content of your resume instead.`,
      );
    }
  };

  const reset = () => {
    setResumeFile(null);
  };

  return {
    resumeFile,
    handleFileUpload,
    reset,
    extractLinksFromText,
  };
}
