import "server-only";
import { getDbAsync } from "@/drizzle/db.server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { status as elysiaStatus } from "elysia";
import { verifySession } from "@/dal/verifySession";
import { processImage, embedText, imageUrlToBase64 } from "@/lib/cloudflareAI";

// Types for Vectorize metadata
interface VectorMetadata {
  questionId: string;
  type: "question" | "answer";
  imageIndex: number;
  imagePath: string;
  extractedText?: string;
}

// Response types
interface SearchResult {
  questionId: string;
  score: number;
  type: "question" | "answer";
  question: {
    id: string;
    year: number;
    season: string;
    paperType: number;
    questionImages: string[];
    answers: string[];
  } | null;
}

interface IndexProgress {
  indexed: number;
  failed: number;
  skipped: number;
  total: number;
}

/**
 * Index all questions into the vector database
 * Admin-only endpoint that processes question/answer images using OCR + text embedding
 */
export async function indexQuestions({
  status,
  query,
}: {
  status: typeof elysiaStatus;
  query: { limit: number; offset: number };
}) {
  const { limit, offset } = query;

  // Verify admin session
  const session = await verifySession();
  if (!session?.session || session.user.role !== "admin") {
    return status(HTTP_STATUS.UNAUTHORIZED, {
      error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }

  const { env } = await getCloudflareContext({ async: true });

  const db = await getDbAsync();

  // Fetch questions with pagination
  const questions = await db.query.question.findMany({
    columns: {
      id: true,
      questionImages: true,
      answers: true,
    },
    limit,
    offset,
  });

  const progress: IndexProgress = {
    indexed: 0,
    failed: 0,
    skipped: 0,
    total: questions.length,
  };

  const vectorsToUpsert: Array<{
    id: string;
    values: number[];
    metadata: VectorMetadata;
  }> = [];

  // Process each question
  for (const q of questions) {
    const questionImages: string[] = JSON.parse(q.questionImages ?? "[]");
    const answerImages: string[] = JSON.parse(q.answers ?? "[]");

    // Process question images
    for (let i = 0; i < questionImages.length; i++) {
      try {
        const imagePath = questionImages[i];
        if (!imagePath) continue;

        const imageBase64 = await imageUrlToBase64(imagePath);
        const { text, embedding } = await processImage(imageBase64, env.AI);

        vectorsToUpsert.push({
          id: `${q.id}_question_${i}`,
          values: embedding,
          metadata: {
            questionId: q.id,
            type: "question",
            imageIndex: i,
            imagePath: imagePath,
            extractedText: text.slice(0, 500), // Store truncated text for debugging
          },
        });
        progress.indexed++;
      } catch (error) {
        console.error(`Failed to index question image ${q.id}_${i}:`, error);
        progress.failed++;
      }
    }

    // Process answer images (skip text-only answers)
    for (let i = 0; i < answerImages.length; i++) {
      try {
        const imagePath = answerImages[i];
        if (!imagePath) continue;

        // Skip if not an image URL (text answers)
        const isImageUrl = /\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i.test(
          imagePath
        );
        if (!isImageUrl) {
          console.log(
            `Skipping non-image answer: ${imagePath.slice(0, 50)}...`
          );
          progress.skipped++;
          continue;
        }

        const imageBase64 = await imageUrlToBase64(imagePath);
        const { text, embedding } = await processImage(imageBase64, env.AI);

        vectorsToUpsert.push({
          id: `${q.id}_answer_${i}`,
          values: embedding,
          metadata: {
            questionId: q.id,
            type: "answer",
            imageIndex: i,
            imagePath: imagePath,
            extractedText: text.slice(0, 500),
          },
        });
        progress.indexed++;
      } catch (error) {
        console.error(`Failed to index answer image ${q.id}_${i}:`, error);
        progress.failed++;
      }
    }
  }

  // Upsert vectors to Vectorize in batches
  if (vectorsToUpsert.length > 0) {
    try {
      // Vectorize has a limit of 1000 vectors per upsert
      const batchSize = 100;
      for (let i = 0; i < vectorsToUpsert.length; i += batchSize) {
        const batch = vectorsToUpsert.slice(i, i + batchSize);
        // Cast to VectorizeVector[] for type compatibility
        await env.QUESTION_SEARCH.upsert(batch as unknown as VectorizeVector[]);
      }
    } catch (error) {
      console.error("Failed to upsert vectors:", error);
      return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
        error: "Failed to store vectors in database",
        code: ERROR_CODES.INTERNAL_SERVER_ERROR,
        progress,
      });
    }
  }

  return {
    success: true,
    progress,
    message: `Indexed ${progress.indexed} images from ${questions.length} questions (${progress.skipped} skipped, ${progress.failed} failed)`,
  };
}

/**
 * Search for matching questions by uploading an image
 * Uses OCR to extract text, then searches by text embedding
 */
export async function searchByImage({
  body,
  status,
}: {
  body: { imageBase64: string; topK?: number };
  status: typeof elysiaStatus;
}) {
  const { imageBase64, topK = 5 } = body;
  const { env } = await getCloudflareContext({ async: true });

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
    matches = await env.QUESTION_SEARCH.query(queryEmbedding, {
      topK,
      returnMetadata: "all",
    });
  } catch (error) {
    console.error("Failed to query Vectorize:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to search vector database",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Extract unique question IDs from matches
  const questionIds = new Set<string>();
  const matchDetails: Array<{
    questionId: string;
    score: number;
    type: string;
  }> = [];

  for (const match of matches.matches) {
    const metadata = match.metadata as unknown as VectorMetadata;
    if (metadata?.questionId) {
      questionIds.add(metadata.questionId);
      matchDetails.push({
        questionId: metadata.questionId,
        score: match.score,
        type: metadata.type,
      });
    }
  }

  // Fetch full question data from D1
  const db = await getDbAsync();
  const results: SearchResult[] = [];

  for (const detail of matchDetails) {
    // Skip if we already have this question in results
    if (results.some((r) => r.questionId === detail.questionId)) continue;

    const questionData = await db.query.question.findFirst({
      where: (q, { eq }) => eq(q.id, detail.questionId),
      columns: {
        id: true,
        year: true,
        season: true,
        paperType: true,
        questionImages: true,
        answers: true,
      },
    });

    results.push({
      questionId: detail.questionId,
      score: detail.score,
      type: detail.type as "question" | "answer",
      question: questionData
        ? {
            ...questionData,
            questionImages: JSON.parse(questionData.questionImages ?? "[]"),
            answers: JSON.parse(questionData.answers ?? "[]"),
          }
        : null,
    });
  }

  return {
    success: true,
    results,
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
  body: { query: string; topK?: number };
  status: typeof elysiaStatus;
}) {
  const { query, topK = 5 } = body;
  const { env } = await getCloudflareContext({ async: true });

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
    matches = await env.QUESTION_SEARCH.query(queryEmbedding, {
      topK,
      returnMetadata: "all",
    });
  } catch (error) {
    console.error("Failed to query Vectorize:", error);
    return status(HTTP_STATUS.INTERNAL_SERVER_ERROR, {
      error: "Failed to search vector database",
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
  }

  // Extract unique question IDs from matches
  const matchDetails: Array<{
    questionId: string;
    score: number;
    type: string;
  }> = [];

  for (const match of matches.matches) {
    const metadata = match.metadata as unknown as VectorMetadata;
    if (metadata?.questionId) {
      matchDetails.push({
        questionId: metadata.questionId,
        score: match.score,
        type: metadata.type,
      });
    }
  }

  // Fetch full question data from D1
  const db = await getDbAsync();
  const results: SearchResult[] = [];

  for (const detail of matchDetails) {
    if (results.some((r) => r.questionId === detail.questionId)) continue;

    const questionData = await db.query.question.findFirst({
      where: (q, { eq }) => eq(q.id, detail.questionId),
      columns: {
        id: true,
        year: true,
        season: true,
        paperType: true,
        questionImages: true,
        answers: true,
      },
    });

    results.push({
      questionId: detail.questionId,
      score: detail.score,
      type: detail.type as "question" | "answer",
      question: questionData
        ? {
            ...questionData,
            questionImages: JSON.parse(questionData.questionImages ?? "[]"),
            answers: JSON.parse(questionData.answers ?? "[]"),
          }
        : null,
    });
  }

  return {
    success: true,
    results,
    totalMatches: matches.matches.length,
  };
}
