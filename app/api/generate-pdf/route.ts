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
    const token = process.env.BROWSERLESS_API_TOKEN;

    if (!token) {
      throw new Error("BROWSERLESS_API_TOKEN not set");
    }

    // Prepare payload
    const payload = {
      html: printHtml,
      options: {
        format: "Letter",
        printBackground: true,
        margin: {
          top: "0.3in",
          bottom: "0.1in",
          left: "0.4in",
          right: "0.4in",
        },
      },
    };

    const response = await fetch(
      `${browserlessUrl}?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Browserless failed: ${response.status} ${text}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 },
    );
  }
}
