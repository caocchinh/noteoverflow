import "server-only";

/**
 * Cloudflare Workers AI helper functions for OCR and text embedding
 * Uses LLaVA for OCR and BGE for text embeddings
 */

// Type alias for Cloudflare AI binding
type CloudflareAI = CloudflareEnv["AI"];

/**
 * Extract text from an image using LLaVA vision model
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @param ai - Cloudflare AI binding
 * @returns Extracted text from the image
 */
export async function extractTextFromImage(
  imageBase64: string,
  ai: CloudflareAI
): Promise<string> {
  const response = await ai.run("@cf/llava-hf/llava-1.5-7b-hf", {
    image: Array.from(
      Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0))
    ),
    prompt:
      "Extract all text from this image verbatim. Include all equations, numbers, formulas, and formatting. If this is an exam question or answer, preserve the structure. Only output the extracted text, nothing else.",
    max_tokens: 2048,
  });

  // LLaVA returns { response: string } or { description: string }
  const result = response as { response?: string; description?: string };
  return result.response || result.description || "";
}

/**
 * Generate text embedding using BGE-large model
 * @param text - Text to embed
 * @param ai - Cloudflare AI binding
 * @returns 1024-dimensional embedding vector
 */
export async function embedText(
  text: string,
  ai: CloudflareAI
): Promise<number[]> {
  const response = await ai.run("@cf/baai/bge-large-en-v1.5", {
    text: [text],
  });

  // BGE returns { shape: number[], data: number[][] }
  const result = response as { data: number[][] };
  return result.data[0];
}

/**
 * Extract text and generate embedding for an image in one step
 * @param imageBase64 - Base64 encoded image
 * @param ai - Cloudflare AI binding
 * @returns Object with extracted text and embedding
 */
export async function processImage(
  imageBase64: string,
  ai: CloudflareAI
): Promise<{ text: string; embedding: number[] }> {
  const text = await extractTextFromImage(imageBase64, ai);

  if (!text || text.trim().length === 0) {
    throw new Error("No text could be extracted from the image");
  }

  const embedding = await embedText(text, ai);
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
