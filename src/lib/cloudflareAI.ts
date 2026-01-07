import "server-only";

/**
 * Cloudflare Workers AI helper functions for OCR and text embedding
 * Uses REST API for local development compatibility
 * Uses LLaVA for OCR and BGE for text embeddings
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_AI_API_TOKEN = process.env.CLOUDFLARE_AI_API_TOKEN;
const CLOUDFLARE_AI_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

/**
 * Call Cloudflare AI REST API
 */
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff in ms

async function callCloudflareAI<T>(
  model: string,
  inputs: Record<string, unknown>
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${CLOUDFLARE_AI_BASE_URL}/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        const error = await response.text();
        const statusCode = response.status;

        // Retry on timeout (408) or server errors (5xx)
        if (statusCode === 408 || statusCode >= 500) {
          lastError = new Error(
            `Cloudflare AI API error: ${statusCode} - ${error}`
          );
          if (attempt < MAX_RETRIES - 1) {
            console.log(
              `Cloudflare AI timeout/error, retrying in ${
                RETRY_DELAYS[attempt]
              }ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAYS[attempt])
            );
            continue;
          }
          throw lastError;
        }

        throw new Error(
          `Cloudflare AI API error: ${response.status} - ${error}`
        );
      }

      const data = (await response.json()) as {
        success: boolean;
        result: T;
        errors?: unknown[];
      };

      // Cloudflare API wraps response in { success: boolean, result: T }
      if (data.success === false) {
        throw new Error(`Cloudflare AI error: ${JSON.stringify(data.errors)}`);
      }

      return data.result as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Only retry on network errors or specific retryable errors
      if (
        attempt < MAX_RETRIES - 1 &&
        (lastError.message.includes("408") ||
          lastError.message.includes("timeout") ||
          lastError.message.includes("ECONNRESET"))
      ) {
        console.log(
          `Cloudflare AI error, retrying in ${
            RETRY_DELAYS[attempt]
          }ms (attempt ${attempt + 1}/${MAX_RETRIES})...`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_DELAYS[attempt])
        );
        continue;
      }
      throw lastError;
    }
  }

  throw lastError || new Error("Cloudflare AI request failed after retries");
}

/**
 * Extract text from an image using LLaVA vision model
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(
  imageBase64: string
): Promise<string> {
  const response = await callCloudflareAI<{
    response?: string;
    description?: string;
  }>("@cf/llava-hf/llava-1.5-7b-hf", {
    image: Array.from(
      Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0))
    ),
    prompt:
      "Extract all text from this image verbatim. Include all equations, numbers, formulas, and formatting. If this is an exam question or answer, preserve the structure. Only output the extracted text, nothing else.",
    max_tokens: 6700,
  });

  return response.response || response.description || "";
}

/**
 * Generate text embedding using BGE-large model
 * @param text - Text to embed
 * @returns 1024-dimensional embedding vector
 */
export async function embedText(text: string): Promise<number[]> {
  const response = await callCloudflareAI<{ data: number[][] }>(
    "@cf/baai/bge-large-en-v1.5",
    { text: [text] }
  );

  return response.data[0];
}

/**
 * Extract text and generate embedding for an image in one step
 * @param imageBase64 - Base64 encoded image
 * @returns Object with extracted text and embedding
 */
export async function processImage(
  imageBase64: string
): Promise<{ text: string; embedding: number[] }> {
  const text = await extractTextFromImage(imageBase64);

  if (!text || text.trim().length === 0) {
    throw new Error("No text could be extracted from the image");
  }

  const embedding = await embedText(text);
  return { text, embedding };
}

/**
 * Fetch image from URL and convert to base64
 */
export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert to base64
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}
