import "server-only";
import { retryAI } from "@/dal/retry";

/**
 * Cloudflare Workers AI helper functions for OCR and text embedding
 * Uses REST API for local development compatibility
 * Uses LLaVA for OCR and BGE for text embeddings
 */

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_AI_API_TOKEN = process.env.CLOUDFLARE_AI_API_TOKEN;
const CLOUDFLARE_AI_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run`;

const REQUEST_TIMEOUT_MS = 122222; // ~120 seconds timeout per request

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

/**
 * Call Cloudflare AI REST API with automatic retries
 */
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

  return retryAI(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      // Log approximate payload size for debugging
      const payload = JSON.stringify(inputs);
      const payloadSize = new TextEncoder().encode(payload).length;
      console.log(
        `Cloudflare AI request to ${model} - Payload size: ${(
          payloadSize / 1024
        ).toFixed(2)} KB`
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
      const error = err instanceof Error ? err : new Error(String(err));

      // Convert abort errors to a more descriptive message
      if (error.name === "AbortError") {
        throw new Error(`Request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      }

      throw error;
    }
  }, `Cloudflare AI ${model}`);
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
      "Extract this text: Calculate the acceleration. acceleration =  ms^(-2) [2]",
  },
  {
    role: "assistant",
    content: "Calculate the acceleration.\nacceleration = ms^(-2)",
  },
  // EXAMPLE 2: Chemistry (Teaching formulas and arrows)
  // We show it an equation like "Mg(s) + 2HCl(aq) -> MgCl2(aq) + H2(g)"
  {
    role: "user",
    content: "Extract this text: Mg(s) + 2HCl(aq) ⟶ MgCl2(aq) + H2(g)",
  },
  {
    role: "assistant",
    // Notice: No LaTeX, just plain text. Arrow becomes "->". Ions like Cu2+ become "Cu^2+".
    content: "Mg(s) + 2HCl(aq) -> MgCl2(aq) + H2(g)",
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
