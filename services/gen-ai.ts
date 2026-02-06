import { GoogleGenAI } from "@google/genai";
import type { Content, Part, GenerateContentConfig } from "@google/genai/types";
import { ChatMessage } from "@/lib/types";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_API_KEY || "",
});

const generationConfig: GenerateContentConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  thinkingConfig: {
    thinkingBudget: 0,
  },
};

const MODELS = {
  primary: "gemini-2.5-flash",
  refine: "gemini-2.5-flash-lite",
  fallback: "gemini-3-flash-preview",
};

const mapToGoogleHistory = (history: ChatMessage[]): Content[] => {
  let historyWithoutLast = history.slice(0, -1);

  const firstUserIndex = historyWithoutLast.findIndex(
    (msg) => msg.role === "user",
  );

  if (firstUserIndex === -1) {
    return [];
  }

  if (firstUserIndex > 0) {
    historyWithoutLast = historyWithoutLast.slice(firstUserIndex);
  }

  return historyWithoutLast.map((msg) => {
    const role = msg.role === "assistant" ? "model" : msg.role;
    const parts: Part[] = msg.parts.map((part) => ({ text: part.text }));
    return { role, parts };
  });
};

export async function generateTextFromImage(
  prompt: string,
  image: { mimeType: string; data: string },
): Promise<string> {
  const imagePart: Part = {
    inlineData: {
      mimeType: image.mimeType,
      data: image.data,
    },
  };

  const textPart: Part = {
    text: prompt,
  };

  const imageConfig: GenerateContentConfig = {
    temperature: 0.2,
    topK: 32,
    topP: 1,
    maxOutputTokens: 4096,
    responseMimeType: "text/plain",
  };

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Image processing timeout")), 30000),
    );

    const result = await Promise.race([
      ai.models.generateContent({
        model: MODELS.refine, // gemini-2.5-flash-lite
        contents: [{ role: "user", parts: [textPart, imagePart] }],
        config: imageConfig,
      }),
      timeoutPromise,
    ]);

    const res: any = result as any;
    return res?.text || "";
  } catch (err) {
    console.error("Image generation failed:", err);
    throw new Error("Failed to extract text from image.");
  }
}

/**
 * Standard generation with retry
 */
export async function generateContentWithRetry(
  prompt: string,
  history: ChatMessage[] = [],
  maxAttempts = 2,
  refine = false,
): Promise<string> {
  const modelsToTry = [MODELS.primary, MODELS.fallback];
  if (refine) {
    modelsToTry.unshift(MODELS.refine);
  }
  let lastError: unknown = null;

  const googleHistory = mapToGoogleHistory(history);
  const useChat = googleHistory.length > 0;

  for (const modelName of modelsToTry) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let result: any;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000),
        );

        if (useChat) {
          const chat = ai.chats.create({
            model: modelName,
            config: generationConfig,
            history: googleHistory,
          });
          result = await Promise.race([
            chat.sendMessage({ message: prompt }),
            timeoutPromise,
          ]);
        } else {
          result = await Promise.race([
            ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: generationConfig,
            }),
            timeoutPromise,
          ]);
        }

        const res: any = result as any;
        return res?.text || "";
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit = /429|quota|exhausted|Too Many Requests/i.test(
          String(err),
        );

        if (isRateLimit) {
          // Exponential backoff for rate limits: 1s, 2s, 4s, etc.
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
          console.log(`Rate limit hit, waiting ${backoffMs}ms before retry...`);
          await new Promise((r) => setTimeout(r, backoffMs));

          // For rate limits, retry with same model before falling back
          if (attempt < maxAttempts) {
            continue;
          }
          // If all retries exhausted, try fallback model
          break;
        }

        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 500));
        }
      }
    }
  }

  throw lastError || new Error("All models failed");
}

/**
 * Streaming generation with progressive callbacks
 * Calls onChunk for each piece of content as it arrives
 */
export async function generateContentStreaming(
  prompt: string,
  onChunk: (chunk: string, accumulated: string) => void,
  onComplete?: (fullText: string) => void,
  maxAttempts = 3,
): Promise<string> {
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const streamConfig: GenerateContentConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
        thinkingConfig: {
          thinkingBudget: 0,
        },
      };

      const result = await ai.models.generateContentStream({
        model: MODELS.primary,
        contents: prompt,
        config: streamConfig,
      });

      let accumulated = "";

      for await (const chunk of result) {
        const chunkText = chunk.text || "";
        accumulated += chunkText;
        onChunk(chunkText, accumulated);
      }

      if (onComplete) {
        onComplete(accumulated);
      }

      return accumulated;
    } catch (err) {
      lastError = err;
      const isRateLimit = /429|quota|exhausted|Too Many Requests/i.test(
        String(err),
      );

      if (isRateLimit && attempt < maxAttempts) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.log(
          `Streaming rate limit hit, waiting ${backoffMs}ms before retry...`,
        );
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      console.error("Streaming failed:", err);
      // Fallback to non-streaming only on final attempt
      if (attempt === maxAttempts) {
        const text = await generateContentWithRetry(prompt, [], 1);
        if (onComplete) {
          onComplete(text);
        }
        return text;
      }
    }
  }

  throw lastError || new Error("Streaming failed after retries");
}
