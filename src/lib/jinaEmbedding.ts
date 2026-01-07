import "server-only";

const JINA_API_URL = "https://api.jina.ai/v1/embeddings";

interface JinaEmbeddingResponse {
  model: string;
  object: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
  };
  data: Array<{
    object: string;
    index: number;
    embedding: number[];
  }>;
}

/**
 * Generate embedding for an image using Jina CLIP v2
 * @param imageBase64 - Base64 encoded image (without data URL prefix)
 * @param apiKey - Jina API key
 * @returns 1024-dimensional embedding vector
 */
export async function embedImage(
  imageBase64: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch(JINA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "jina-clip-v2",
      dimensions: 1024,
      normalized: true,
      embedding_type: "float",
      input: [
        {
          image: imageBase64,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina API error: ${response.status} - ${error}`);
  }

  const result: JinaEmbeddingResponse = await response.json();
  return result.data[0].embedding;
}

/**
 * Generate embedding for text using Jina CLIP v2
 * @param text - Text to embed
 * @param apiKey - Jina API key
 * @returns 1024-dimensional embedding vector
 */
export async function embedText(
  text: string,
  apiKey: string
): Promise<number[]> {
  const response = await fetch(JINA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "jina-clip-v2",
      dimensions: 1024,
      normalized: true,
      embedding_type: "float",
      input: [
        {
          text: text,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina API error: ${response.status} - ${error}`);
  }

  const result: JinaEmbeddingResponse = await response.json();
  return result.data[0].embedding;
}

/**
 * Generate embeddings for multiple images in a batch
 * @param imageBase64s - Array of base64 encoded images
 * @param apiKey - Jina API key
 * @returns Array of 1024-dimensional embedding vectors
 */
export async function embedImageBatch(
  imageBase64s: string[],
  apiKey: string
): Promise<number[][]> {
  const response = await fetch(JINA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "jina-clip-v2",
      dimensions: 1024,
      normalized: true,
      embedding_type: "float",
      input: imageBase64s.map((img) => ({ image: img })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jina API error: ${response.status} - ${error}`);
  }

  const result: JinaEmbeddingResponse = await response.json();
  return result.data.map((d) => d.embedding);
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
