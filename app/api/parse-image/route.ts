import { NextRequest, NextResponse } from "next/server";
import { generateTextFromImage } from "@/services/gen-ai";

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mimeType are required" },
        { status: 400 },
      );
    }

    const prompt =
      "Extract all text from this resume image. Preserve the formatting as much as possible, including spacing and line breaks. The output should be only the text from the image.";

    const text = await generateTextFromImage(prompt, {
      mimeType,
      data: image,
    });

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("[API/parse-image] Error:", error);
    return NextResponse.json(
      { error: "Failed to process image." },
      { status: 500 },
    );
  }
}
