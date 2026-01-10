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
import { NUMBER_OF_RETURN_QUESTIONS_FROM_VECTORIZE } from "@/features/topical/constants/constants";
import {
  MAX_IMAGE_UPLOAD_SIZE,
  MAX_QUERY_LENGTH,
} from "@/features/search/constants/constants";
import { PhotonImage } from "@cf-wasm/photon";
import { hashUltil } from "@/features/topical/lib/utils";
import { checkRateLimit, incrementSearchCount } from "./rate-limit";

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
  const {
    imageBase64,
    topK = NUMBER_OF_RETURN_QUESTIONS_FROM_VECTORIZE,
    filter,
  } = body;
  const { env } = await getCloudflareContext({ async: true });

  // Validate image data exists
  if (!imageBase64 || imageBase64.trim().length === 0) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: "Image data is required",
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Decode base64 to bytes and validate using PhotonImage
  let imageBytes: Uint8Array;
  try {
    // Decode base64 string to binary
    const binaryString = atob(imageBase64);
    imageBytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      imageBytes[i] = binaryString.charCodeAt(i);
    }

    // Validate actual image size
    if (imageBytes.byteLength > MAX_IMAGE_UPLOAD_SIZE) {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: `Image size exceeds ${
          MAX_IMAGE_UPLOAD_SIZE / (1024 * 1024)
        }MB limit`,
        code: ERROR_CODES.BAD_REQUEST,
      });
    }

    // Validate that it's a valid image by trying to decode it with PhotonImage
    const photonImage = PhotonImage.new_from_byteslice(imageBytes);
    photonImage.free();
  } catch (error) {
    console.error("Failed to validate image:", error);
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: "Invalid image format or corrupted image data",
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Validate filters using the same validation as getTopicalQuestions
  const validationError = validateSearchFilters(filter, status);
  if (validationError) return validationError;

  // Create cache key from query parameters
  const currentQuery = {
    imageBase64,
    topK,
    filter,
  };
  const queryString = JSON.stringify(currentQuery);
  const hashedKey = await hashUltil(queryString);

  // Check cache for existing results
  const cachedResult = await env.SEMANTIC_SEARCH_CACHE.get(hashedKey);

  if (cachedResult !== null) {
    const parsedResult = JSON.parse(cachedResult);
    return {
      success: true,
      data: parsedResult.data,
    };
  }

  // Check global rate limit
  const rateLimitError = await checkRateLimit("image", status);
  if (rateLimitError) return rateLimitError;

  // Extract text from uploaded image using OCR, then embed
  let queryEmbedding: number[];
  try {
    const result = await processImage(imageBase64, env.AI);
    queryEmbedding = result.embedding;
  } catch (error) {
    console.error("Failed to process image:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to process image.",
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
      error: "Database unavailable.",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Fetch full question data from D1
  const results = await fetchQuestionResults(matches);

  const responseData = {
    success: true,
    data: results,
  };

  await Promise.all([
    env.SEMANTIC_SEARCH_CACHE.put(hashedKey, JSON.stringify(responseData), {
      expirationTtl: 60 * 60 * 24 * 3, // 3 day
    }),
    incrementSearchCount("image"),
  ]);

  return responseData;
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
  const {
    query,
    topK = NUMBER_OF_RETURN_QUESTIONS_FROM_VECTORIZE,
    filter,
  } = body;
  const { env } = await getCloudflareContext({ async: true });

  // Validate filters using the same validation as getTopicalQuestions
  const validationError = validateSearchFilters(filter, status);
  if (validationError) return validationError;

  // Validate query text
  if (!query || query.trim().length === 0) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: "Query text is required",
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: `Query text exceeds maximum length of ${MAX_QUERY_LENGTH} characters`,
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Create cache key from query parameters
  const currentQuery = {
    query,
    topK,
    filter,
  };
  const queryString = JSON.stringify(currentQuery);
  const hashedKey = await hashUltil(queryString);

  // Check cache for existing results
  const cachedResult = await env.SEMANTIC_SEARCH_CACHE.get(hashedKey);

  if (cachedResult !== null) {
    const parsedResult = JSON.parse(cachedResult);
    return {
      success: true,
      data: parsedResult.data,
    };
  }

  // Check global rate limit
  const rateLimitError = await checkRateLimit("text", status);
  if (rateLimitError) return rateLimitError;

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
      error: "Database unavailable.",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Fetch full question data from D1
  const results = await fetchQuestionResults(matches);

  const responseData = {
    success: true,
    data: results,
  };

  // Cache the results and increment search count in parallel
  await Promise.all([
    env.SEMANTIC_SEARCH_CACHE.put(hashedKey, JSON.stringify(responseData), {
      expirationTtl: 60 * 60 * 24 * 3, // 3 day
    }),
    incrementSearchCount("text"),
  ]);

  return responseData;
}
