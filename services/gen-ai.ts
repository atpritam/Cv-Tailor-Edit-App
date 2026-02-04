import { GoogleGenerativeAI, Content, Part } from "@google/generative-ai";
import { ChatMessage } from "@/lib/types";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const MODELS = {
  primary: "gemini-2.0-flash",
  refine: "gemini-2.0-flash-lite",
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
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        let result: any;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 30000),
        );

        if (useChat) {
          const chat = model.startChat({ history: googleHistory });
          result = await Promise.race([
            chat.sendMessage(prompt),
            timeoutPromise,
          ]);
        } else {
          result = await Promise.race([
            model.generateContent(prompt),
            timeoutPromise,
          ]);
        }

        return result.response.text();
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
    const model = genAI.getGenerativeModel({
      model: MODELS.primary,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
    });

    try {
      const result = await model.generateContentStream(prompt);
      let accumulated = "";

      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
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
