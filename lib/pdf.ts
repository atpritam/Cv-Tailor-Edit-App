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
    includePrintScript: true,
    title: "Tailored Resume",
  });

  const blob = new Blob([printHtml], {
    type: "text/html; charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const printTab = window.open(url, "_blank");

  if (!printTab) {
    alert("Please allow popups to print the PDF");
    URL.revokeObjectURL(url);
    return;
  }

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
