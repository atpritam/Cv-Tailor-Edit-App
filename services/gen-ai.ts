import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

//  models
const MODELS = {
  primary: "gemini-2.0-flash",
  fallback: "gemini-3-flash-preview",
};

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

export const model = genAI.getGenerativeModel({
  model: MODELS.primary,
  generationConfig,
});
