import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import fs from "fs";
import path from "path";
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

    // Generate print-ready HTML with all styles inline
    const printHtml = generatePrintHtml(html, profilePhotoDataUrl, theme);

    // Runtime diagnostics: check whether the package `bin` exists in deployed code
    try {
      const pkgJson = require.resolve("@sparticuz/chromium/package.json");
      const pkgDir = path.dirname(pkgJson);
      const binDir = path.join(pkgDir, "bin");
      console.log("chromium pkgDir", pkgDir);
      console.log("chromium bin exists", fs.existsSync(binDir));
      if (fs.existsSync(binDir)) {
        try {
          const files = fs.readdirSync(binDir).slice(0, 20);
          console.log("chromium bin files (sample)", files);
        } catch (e) {
          console.log("error listing bin files", String(e));
        }
      }
    } catch (e) {
      console.log("chromium package resolve failed at runtime", String(e));
    }

    // Launch headless browser
    const executablePath = await chromium.executablePath();
    const browser = await puppeteer.launch({
      args: puppeteer.defaultArgs({ args: chromium.args, headless: "shell" }),
      executablePath,
      headless: "shell",
      defaultViewport: { width: 1920, height: 1080 },
    });

    const page = await browser.newPage();

    // Set content and wait for all resources to load
    await page.setContent(printHtml, {
      waitUntil: ["networkidle0", "domcontentloaded"],
    });

    // Generate PDF with print-optimized settings
    const pdf = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: {
        top: "0.3in",
        bottom: "0.4in",
        left: "0.4in",
        right: "0.4in",
      },
      preferCSSPageSize: false,
    });

    await browser.close();

    // Return PDF as response
    return new NextResponse(Buffer.from(pdf), {
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
