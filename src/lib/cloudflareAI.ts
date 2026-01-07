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

type VisionModelInput = {
  messages: Array<{
    role: string;
    content: Array<
      | { type: "image_url"; image_url: { url: string } }
      | { type: "text"; text: string }
    >;
  }>;
  max_tokens: number;
};

type EmbeddingModelInput = {
  text: string[];
};

async function callCloudflareAI<T>(
  model:
    | "@cf/meta/llama-4-scout-17b-16e-instruct"
    | "@cf/baai/bge-large-en-v1.5",
  inputs: VisionModelInput | EmbeddingModelInput,
  aiBinding?: Ai
): Promise<T> {
  if (process.env.NODE_ENV === "production" && aiBinding) {
    console.log(`Using Cloudflare AI Binding for ${model}`);
    try {
      const result = await aiBinding.run(model, inputs);
      return result as T;
    } catch (error) {
      console.error("Cloudflare AI Binding error:", error);
      throw error;
    }
  }

  let lastError: Error | null = null;
  const TIMEOUT_MS = 120000; // 120 seconds timeout per request

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      // Log approximate payload size for debugging
      const payload = JSON.stringify(inputs);
      const payloadSize = new TextEncoder().encode(payload).length;
      console.log(
        `Cloudflare AI request to ${model} (attempt ${
          attempt + 1
        }/${MAX_RETRIES}) - Payload size: ${(payloadSize / 1024).toFixed(2)} KB`
      );

      const response = await fetch(`${CLOUDFLARE_AI_BASE_URL}/${model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_AI_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId); // Ensure timeout is cleared on error too
      lastError = err instanceof Error ? err : new Error(String(err));

      // Handle abort errors specifically
      if (lastError.name === "AbortError") {
        lastError = new Error(`Request timed out after ${TIMEOUT_MS}ms`);
      }

      // Only retry on network errors, timeouts, or specific retryable errors
      if (
        attempt < MAX_RETRIES - 1 &&
        (lastError.message.includes("408") ||
          lastError.message.includes("timeout") ||
          lastError.message.includes("timed out") ||
          lastError.message.includes("ECONNRESET"))
      ) {
        console.log(
          `Cloudflare AI error (${lastError.message}), retrying in ${
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

const fewShotMessages = [
  {
    role: "system",
    content:
      "You are a strict OCR engine. Output only raw text. Flatten vertical fractions to (a)/(b). Use 'ms^-1' for units. Remove all dotted lines and LaTeX formatting.",
  },
  {
    role: "user",
    content:
      "Extract this text: Calculate the acceleration. acceleration = ........................ ms^(-2) [2]",
  },
  {
    role: "assistant",
    content: "Calculate the acceleration.\nacceleration = ms^(-2)",
  },
];

/**
 * Extract text from an image using LLaVA vision model
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(
  imageBase64: string,
  aiBinding?: Ai
): Promise<string> {
  console.log("Extracting text from image...");
  const response = await callCloudflareAI<{
    response?: string;
    description?: string;
  }>(
    "@cf/meta/llama-4-scout-17b-16e-instruct",
    {
      messages: [
        ...fewShotMessages,
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: 'Act as a raw text transcription engine, not an AI assistant. Output only the exact text physically visible in the image verbatim, strictly preserving the original order. Do not add organizational headers (like "Objective", "Question", "Answer"), do not use Markdown formatting (no bold ** or headers ##), and do not include any meta-comments (like "The answer is not provided"). Strictly do not use LaTeX formatting, dollar signs $, backslashes , or commands like \frac. Instead, flatten all vertical fractions into horizontal plain text using parentheses and a forward slash (e.g., transcribe a vertical fraction as (numerator)/(denominator)). Represent variables and formulas using standard plain text. Transcribe Greek symbols as full English words (e.g., "theta") and use standard text (e.g., "sqrt(x+1)" for roots, "x^2" for exponents, and "(a+b)/c" for fractions). Ignore answer dotted lines. If and only if a visual diagram is present, append a description at the very end starting with "Diagrams explanation: " describing it objectively without context; otherwise, stop immediately after the last extracted word.',
            },
          ],
        },
      ],
      max_tokens: 6700,
    } as VisionModelInput,
    aiBinding
  );
  console.log(
    "Extracted text from image:",
    response.response || response.description || ""
  );
  return response.response || response.description || "";
}

/**
 * Generate text embedding using BGE-large model
 * @param text - Text to embed
 * @returns 1024-dimensional embedding vector
 */
export async function embedText(
  text: string,
  aiBinding?: Ai
): Promise<number[]> {
  const response = await callCloudflareAI<{ data: number[][] }>(
    "@cf/baai/bge-large-en-v1.5",
    { text: [text] },
    aiBinding
  );

  return response.data[0];
}

/**
 * Extract text and generate embedding for an image in one step
 * @param imageBase64 - Base64 encoded image
 * @returns Object with extracted text and embedding
 */
export async function processImage(
  imageBase64: string,
  aiBinding?: Ai
): Promise<{ text: string; embedding: number[] }> {
  const text = await extractTextFromImage(imageBase64, aiBinding);

  if (!text || text.trim().length === 0) {
    throw new Error("No text could be extracted from the image");
  }

  const embedding = await embedText(text, aiBinding);
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
