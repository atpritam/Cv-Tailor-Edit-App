"use client";

import { useState } from "react";

type ResumeParserProps = {
  setResumeText: (text: string) => void;
  setError: (error: string) => void;
};

import { resizeImage } from "@/lib/image";

export function useResumeParser({
  setResumeText,
  setError,
}: ResumeParserProps) {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setError("");
    setIsParsing(true);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setResumeText(text);
      } else if (file.type === "application/pdf") {
        try {
          setResumeText(`[PDF: ${file.name}] - Parsing, please wait...`);
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
        } catch (pdfError) {
          console.error("[v0] PDF parsing error:", pdfError);
          setError(
            "Failed to parse PDF. Please try pasting your resume text instead.",
          );
          setResumeText("");
        }
      } else if (file.type.startsWith("image/")) {
        setResumeText(`[Image: ${file.name}] - Extracting Image Text...`);

        try {
          const resizedDataUrl = await resizeImage(file);
          const [dataUrlInfo, base64Image] = resizedDataUrl.split(",");

          if (!dataUrlInfo || !base64Image) {
            throw new Error("Invalid data URL from image resizing");
          }

          const mimeTypeMatch = dataUrlInfo.match(/:(.*?);/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";

          const response = await fetch("/api/parse-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              image: base64Image,
              mimeType: mimeType,
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.text) {
            setResumeText(result.text);
          } else {
            throw new Error("No text found in image.");
          }
        } catch (imgError) {
          console.error("Image processing error:", imgError);
          setError(
            "Failed to process image. Please try pasting your resume text instead.",
          );
          setResumeText("");
        }
      }
    } finally {
      setIsParsing(false);
    }
  };

  const reset = () => {
    setResumeFile(null);
    setIsParsing(false);
  };

  return {
    resumeFile,
    isParsing,
    handleFileUpload,
    reset,
  };
}
