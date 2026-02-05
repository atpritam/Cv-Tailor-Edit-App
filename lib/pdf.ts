export type ColorTheme = {
  name: string;
  primary: string;
  h2: string;
  border: string;
  link: string;
  tech: string;
};

import { generatePrintHtml } from "./print-content";

export const downloadPDF = async (
  element: HTMLElement,
  profilePhotoDataUrl: string | null,
  theme: ColorTheme,
) => {
  const htmlContent = element.innerHTML;

  try {
    const response = await fetch("/api/generate-pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: htmlContent,
        profilePhotoDataUrl,
        theme,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate PDF");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resume.pdf";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading PDF:", error);
    alert("Failed to generate PDF. Please try the print option instead.");
  }
};

export const printPDF = (
  element: HTMLElement,
  profilePhotoDataUrl: string | null,
  theme: ColorTheme,
) => {
  const htmlContent = element.innerHTML;

  const printHtml = generatePrintHtml(htmlContent, profilePhotoDataUrl, theme, {
    includePrintScript: false,
    title: "Tailored Resume",
  });

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    console.error("Could not access iframe document");
    document.body.removeChild(iframe);
    return;
  }

  doc.open();
  doc.write(printHtml);
  doc.close();

  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 500);
};
