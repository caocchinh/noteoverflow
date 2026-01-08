import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HTTP_STATUS, ERROR_CODES } from "@/lib/errors";
import { status as elysiaStatus } from "elysia";
import { processImage, embedText } from "@/lib/cloudflareAI";
import {
  executeVectorSearch,
  fetchQuestionResults,
  SearchFilter,
  validateSearchFilters,
} from "./utils";

/**
 * Search for matching questions by uploading an image
 * Uses OCR to extract text, then searches by text embedding
 */
export async function searchByImage({
  body,
  status,
}: {
  body: {
    imageBase64: string;
    topK?: number;
    filter?: SearchFilter;
  };
  status: typeof elysiaStatus;
}) {
  const { imageBase64, topK = 5, filter } = body;
  const { env } = await getCloudflareContext({ async: true });

  // Validate filters using the same validation as getTopicalQuestions
  const validationError = validateSearchFilters(filter, status);
  if (validationError) return validationError;

  // Extract text from uploaded image using OCR, then embed
  let queryEmbedding: number[];
  let extractedText: string;
  try {
    const result = await processImage(imageBase64, env.AI);
    queryEmbedding = result.embedding;
    extractedText = result.text;
  } catch (error) {
    console.error("Failed to process image:", error);
    return status(HTTP_STATUS.BAD_REQUEST, {
      error:
        "Failed to extract text from image. The image may not contain readable text.",
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Query Vectorize for nearest neighbors
  let matches;
  try {
    matches = await executeVectorSearch(
      queryEmbedding,
      topK,
      filter,
      env.QUESTION_SEMANTIC_SEARCH_VECTORIZE
    );
  } catch (error) {
    console.error("Failed to query Vectorize:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to search vector database",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Fetch full question data from D1
  const results = await fetchQuestionResults(matches);

  return {
    success: true,
    data: results,
    totalMatches: matches.matches.length,
    extractedText: extractedText.slice(0, 200), // Return preview of extracted text
  };
}

/**
 * Search for matching questions by text query
 * Direct text search without OCR step
 */
export async function searchByText({
  body,
  status,
}: {
  body: {
    query: string;
    topK?: number;
    filter?: SearchFilter;
  };
  status: typeof elysiaStatus;
}) {
  const { query, topK = 5, filter } = body;
  const { env } = await getCloudflareContext({ async: true });

  // Validate filters using the same validation as getTopicalQuestions
  const validationError = validateSearchFilters(filter, status);
  if (validationError) return validationError;

  if (!query || query.trim().length === 0) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: "Query text is required",
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Generate embedding for the text query
  let queryEmbedding: number[];
  try {
    queryEmbedding = await embedText(query, env.AI);
  } catch (error) {
    console.error("Failed to generate embedding:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to process query",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Query Vectorize for nearest neighbors
  let matches;
  try {
    matches = await executeVectorSearch(
      queryEmbedding,
      topK,
      filter,
      env.QUESTION_SEMANTIC_SEARCH_VECTORIZE
    );
  } catch (error) {
    console.error("Failed to query Vectorize:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to search vector database",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Fetch full question data from D1
  const results = await fetchQuestionResults(matches);

  return {
    success: true,
    data: results,
    totalMatches: matches.matches.length,
  };
}
