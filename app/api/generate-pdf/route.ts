import { NextRequest, NextResponse } from "next/server";
import { generatePrintHtml } from "../../../lib/print-content";

export async function POST(request: NextRequest) {
  try {
    const { html, profilePhotoDataUrl, theme } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 },
      );
    }

    // Generate print-ready HTML
    const printHtml = generatePrintHtml(html, profilePhotoDataUrl, theme);

    const browserlessUrl = "https://chrome.browserless.io/pdf";
    const browserlessToken = process.env.BROWSERLESS_API_TOKEN;
    const customjsUrl = "https://e.customjs.io/html2pdf";
    const customjsKey = process.env.CUSTOMJS_API_KEY;

    if (!browserlessToken && !customjsKey) {
      throw new Error("Missing API keys for PDF services");
    }

    // Common options
    const options = {
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.3in",
        bottom: "0.1in",
        left: "0.4in",
        right: "0.4in",
      },
    };

    // Browserless first
    if (browserlessToken) {
      try {
        const browserlessResponse = await fetch(
          `${browserlessUrl}?token=${encodeURIComponent(browserlessToken)}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: printHtml, options }),
          },
        );

        if (browserlessResponse.ok) {
          const buffer = Buffer.from(await browserlessResponse.arrayBuffer());
          return new NextResponse(buffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": 'attachment; filename="resume.pdf"',
            },
          });
        } else {
          const text = await browserlessResponse.text().catch(() => "");
          console.warn(
            `Browserless failed: ${browserlessResponse.status} ${text} - Falling back to CustomJS`,
          );
        }
      } catch (browserlessError) {
        console.warn(
          `Browserless error: ${browserlessError} - Falling back to CustomJS`,
        );
      }
    }

    // Fallback to CustomJS
    if (customjsKey) {
      const customjsResponse = await fetch(customjsUrl, {
        method: "POST",
        headers: {
          "x-api-key": customjsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            html: printHtml,
            ...options,
          },
        }),
      });

      if (!customjsResponse.ok) {
        const text = await customjsResponse.text().catch(() => "");
        throw new Error(`CustomJS failed: ${customjsResponse.status} ${text}`);
      }

      const buffer = Buffer.from(await customjsResponse.arrayBuffer());

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="resume.pdf"',
        },
      });
    }

    throw new Error("No working PDF provider available");
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try the print option instead." },
      { status: 500 },
    );
  }
}
