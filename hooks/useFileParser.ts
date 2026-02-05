"use client";

import { useState } from "react";
import { resizeImage } from "@/lib/image";
import { PersistentLRUCache } from "@/lib/persistent-lru-cache";

type FileParserProps = {
  setText: (text: string) => void;
  setError: (error: string) => void;
  cacheType: "resume" | "jd";
};

const resumeImageCache = new PersistentLRUCache<string, string>(
  "resume-image-cache",
  6,
);
const jdImageCache = new PersistentLRUCache<string, string>(
  "jd-image-cache",
  4,
);

const caches = {
  resume: resumeImageCache,
  jd: jdImageCache,
};

function generateFileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

export function useFileParser({
  setText,
  setError,
  cacheType,
}: FileParserProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const imageCache = caches[cacheType];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setFile(file);
    setError("");
    setIsParsing(true);

    try {
      if (file.type === "text/plain") {
        const text = await file.text();
        setText(text);
      } else if (file.type === "application/pdf") {
        try {
          setText(`[PDF: ${file.name}] - Parsing, please wait...`);
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
            const annotations = await page.getAnnotations();
            const linkAnnotations = annotations.filter(
              (annotation: any) => annotation.subtype === "Link" && annotation.url,
            );
            let linksText = "";
            if (linkAnnotations.length > 0) {
              const urls = linkAnnotations.map((link: any) => link.url);
              linksText = "\n\nLinks on this page:\n- " + urls.join("\n- ");
            }
            fullText += pageText + linksText + "\n\n";
          }

          const trimmed = fullText.trim();
          setText(trimmed);
        } catch (pdfError) {
          console.error("[v0] PDF parsing error:", pdfError);
          setError("Failed to parse PDF. Please try pasting the text instead.");
          setText("");
        }
      } else if (file.type.startsWith("image/")) {
        const fileKey = generateFileKey(file);

        const primaryCache = caches[cacheType];
        const secondaryCache =
          cacheType === "resume" ? caches.jd : caches.resume;

        // 1. Check primary cache
        if (primaryCache.has(fileKey)) {
          setText(`[Image: ${file.name}] - Text restored from cache.`);
          const cachedText = primaryCache.get(fileKey)!;
          setText(cachedText);
          setIsParsing(false);
          return;
        }

        // 2. Check secondary cache
        if (secondaryCache.has(fileKey)) {
          setText(`[Image: ${file.name}] - Text restored from other cache.`);
          const cachedText = secondaryCache.get(fileKey)!;

          // Promote to primary cache
          primaryCache.set(fileKey, cachedText);

          setText(cachedText);
          setIsParsing(false);
          return;
        }

        setText(`[Image: ${file.name}] - Extracting text...`);

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
            primaryCache.set(fileKey, result.text);
            setText(result.text);
          } else {
            throw new Error("No text found in image.");
          }
        } catch (imgError) {
          console.error("Image processing error:", imgError);
          setError(
            "Failed to process image. Please try pasting the text instead.",
          );
          setText("");
        }
      }
    } finally {
      setIsParsing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setIsParsing(false);
  };

  return {
    file,
    isParsing,
    handleFileUpload,
    reset,
  };
}
