import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

const generationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const models = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
];

export const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig,
});

export async function generateContentWithRetry(
  prompt: string,
  maxAttemptsPerModel = 2,
): Promise<string> {
  let lastErr: any = null;

  // Try each model in the `models` list. For each model, attempt up to
  // `maxAttemptsPerModel` times (default 2): the initial try and one retry.
  for (const modelName of models) {
    const localModel = genAI.getGenerativeModel({
      model: modelName,
      generationConfig,
    });

    for (let attempt = 1; attempt <= maxAttemptsPerModel; attempt++) {
      try {
        const result = await localModel.generateContent(prompt);
        return result.response.text();
      } catch (err: any) {
        lastErr = err;
        const status = err?.status || err?.response?.status;
        const isRateLimit =
          status === 429 ||
          /429|Too Many Requests|Resource exhausted/i.test(String(err));

        if (attempt < maxAttemptsPerModel) {
          // Always retry once with the same model (per request). Back off on retry.
          const delay = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms...
          console.warn(
            `generateContent attempt ${attempt} for model ${modelName} failed${isRateLimit ? " (rate limit)" : ""}, retrying after ${delay}ms`,
          );
          await new Promise((res) => setTimeout(res, delay));
          continue;
        }

        // If we've exhausted attempts for this model, move to the next model.
        console.warn(
          `model ${modelName} failed after ${attempt} attempts — switching to next model`,
        );
      }
    }
  }

  throw lastErr ?? new Error("generateContent failed for all models");
}
