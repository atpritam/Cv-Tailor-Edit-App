import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium-min";
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

    // - CHROMIUM_PACK_URL=https://my-bucket/chromium-pack.tar
    // - CHROMIUM_PACK_DIR=/opt/chromium
    const chromiumPackLocation =
      process.env.CHROMIUM_PACK_URL || process.env.CHROMIUM_PACK_DIR;

    // Debug/logging to help diagnose missing pack issues in deployments
    try {
      console.log("CHROMIUM_PACK_URL", process.env.CHROMIUM_PACK_URL);
      console.log("CHROMIUM_PACK_DIR", process.env.CHROMIUM_PACK_DIR);

      // Attempt to locate the installed package bin folder for extra visibility
      try {
        const pkgJson = require.resolve("@sparticuz/chromium-min/package.json");
        const pkgDir = path.dirname(pkgJson);
        const binDir = path.join(pkgDir, "bin");
        console.log("chromium-min package dir", pkgDir);
        console.log("chromium-min bin exists", fs.existsSync(binDir));
      } catch (err) {
        console.log("chromium-min package resolve failed", String(err));
      }
    } catch (err) {
      console.log("Error logging chromium env/info", String(err));
    }

    const executablePath = chromiumPackLocation
      ? await chromium.executablePath(chromiumPackLocation)
      : await chromium.executablePath();

    // Launch headless browser. Use puppeteer's defaultArgs merged with chromium args
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
