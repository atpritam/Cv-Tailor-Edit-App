import { GoogleGenerativeAI } from "@google/generative-ai";

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
  fallback: "gemini-3-flash-preview",
};

/**
 * Standard generation with retry
 */
export async function generateContentWithRetry(
  prompt: string,
  maxAttempts = 2,
): Promise<string> {
  const modelsToTry = [MODELS.primary, MODELS.fallback];
  let lastError: unknown = null;

  for (const modelName of modelsToTry) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = (await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 30000),
          ),
        ])) as any;

        return result.response.text();
      } catch (err: unknown) {
        lastError = err;
        const isRateLimit = /429|quota|exhausted/i.test(String(err));
        if (isRateLimit) break;
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
): Promise<string> {
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
    console.error("Streaming failed:", err);
    // Fallback to non-streaming
    const text = await generateContentWithRetry(prompt, 1);
    if (onComplete) {
      onComplete(text);
    }
    return text;
  }
}

/**
 * Parallel streaming - run multiple prompts simultaneously with streaming
 * Returns a promise that resolves when all streams complete
 */
export async function generateParallelStreaming(
  prompts: Array<{
    prompt: string;
    onChunk: (chunk: string, accumulated: string) => void;
    onComplete?: (fullText: string) => void;
  }>,
): Promise<string[]> {
  return Promise.all(
    prompts.map(({ prompt, onChunk, onComplete }) =>
      generateContentStreaming(prompt, onChunk, onComplete),
    ),
  );
}

export const model = genAI.getGenerativeModel({
  model: MODELS.primary,
  generationConfig,
});
