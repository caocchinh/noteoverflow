import { status as elysiaStatus } from "elysia";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import {
  validateCurriculum,
  validateSubject,
  validatePartialFilterData,
} from "@/features/topical/lib/utils";
import { queryVectorize } from "@/lib/cloudflareVectorize";
import { QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME } from "@/features/topical/constants/constants";
import { getDbAsync } from "@/drizzle/db.server";
import { VectorizeSelectedQuestion } from "@/features/topical/constants/types";
import { retryDatabase } from "@/dal/retry";
import { inArray } from "drizzle-orm";
import { question } from "@/drizzle/schema";

// Helper to generate deterministic short IDs for Vectorize (max 64 bytes)
export async function generateShortId(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Types for Vectorize metadata
export interface VectorMetadata {
  questionId: string;
  type: "question" | "answer";
  imageIndex: string;
  imagePath: string;
  extractedText: string;
  subject: string;
  curriculum: string;
  year: string;
  season: string;
  paperType: string;
  // Index signature for Cloudflare Vectorize compatibility
  [key: string]: string;
}

// Search filter type used by both searchByText and searchByImage
export interface SearchFilter {
  curriculum?: string;
  subject?: string;
  year?: string[];
  season?: string[];
  paperType?: string[];
}

/**
 * Validate search filters using the reusable validation functions
 */
export function validateSearchFilters(
  filter: SearchFilter | undefined,
  status: typeof elysiaStatus
) {
  if (!filter) return null;

  // Require curriculum and subject when year, season, or paperType filters are used
  const hasDetailFilters =
    (filter.year && filter.year.length > 0) ||
    (filter.season && filter.season.length > 0) ||
    (filter.paperType && filter.paperType.length > 0);

  if (hasDetailFilters && (!filter.curriculum || !filter.subject)) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Validate curriculum if provided
  if (filter.curriculum && !validateCurriculum(filter.curriculum)) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Validate subject if curriculum and subject are provided
  if (
    filter.curriculum &&
    filter.subject &&
    !validateSubject(filter.curriculum, filter.subject)
  ) {
    return status(HTTP_STATUS.BAD_REQUEST, {
      error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
      code: ERROR_CODES.BAD_REQUEST,
    });
  }

  // Validate filter data if curriculum and subject are provided
  if (filter.curriculum && filter.subject) {
    if (
      !validatePartialFilterData({
        data: {
          paperType: filter.paperType,
          year: filter.year,
          season: filter.season,
        },
        curriculum: filter.curriculum,
        subject: filter.subject,
      })
    ) {
      return status(HTTP_STATUS.BAD_REQUEST, {
        error: ERROR_MESSAGES[ERROR_CODES.BAD_REQUEST],
        code: ERROR_CODES.BAD_REQUEST,
      });
    }
  }

  return null;
}

export function buildVectorizeFilter(
  filter?: SearchFilter
): Record<string, { $eq: string } | { $in: string[] }> | undefined {
  if (!filter) return undefined;

  const vectorizeFilter: Record<string, { $eq: string } | { $in: string[] }> =
    {};
  if (filter.subject) vectorizeFilter.subject = { $eq: filter.subject };
  if (filter.curriculum)
    vectorizeFilter.curriculum = { $eq: filter.curriculum };
  if (filter.year && filter.year.length > 0) {
    vectorizeFilter.year = { $in: filter.year };
  }

  if (filter.season && filter.season.length > 0)
    vectorizeFilter.season = { $in: filter.season };
  if (filter.paperType && filter.paperType.length > 0) {
    vectorizeFilter.paperType = { $in: filter.paperType };
  }

  return Object.keys(vectorizeFilter).length > 0 ? vectorizeFilter : undefined;
}

/**
 * Execute vector search against Vectorize
 */
export async function executeVectorSearch(
  queryEmbedding: number[],
  topK: number,
  filter: SearchFilter | undefined,
  vectorizeBinding: VectorizeIndex
): Promise<VectorizeMatches> {
  return queryVectorize(
    QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME,
    queryEmbedding,
    {
      topK,
      returnMetadata: "all",
      filter: buildVectorizeFilter(filter),
    },
    vectorizeBinding
  );
}

/**
 * Process Vectorize matches and fetch full question data from D1
 * Returns VectorizeSelectedQuestion[] matching the topical questions format
 */
export async function fetchQuestionResults(
  matches: VectorizeMatches
): Promise<VectorizeSelectedQuestion[]> {
  // Build a map of questionId -> highest score (for sorting)
  const scoreMap = new Map<string, number>();

  for (const match of matches.matches) {
    const metadata = match.metadata as unknown as VectorMetadata;
    if (metadata?.questionId) {
      const existingScore = scoreMap.get(metadata.questionId);
      // Keep the highest score for each questionId
      if (existingScore === undefined || match.score > existingScore) {
        scoreMap.set(metadata.questionId, match.score);
      }
    }
  }

  const questionIds = Array.from(scoreMap.keys());
  if (questionIds.length === 0) {
    return [];
  }

  const db = await getDbAsync();

  const questionsData = await retryDatabase(
    () =>
      db
        .select({
          id: question.id,
          year: question.year,
          season: question.season,
          paperType: question.paperType,
          questionImages: question.questionImages,
          answers: question.answers,
          topics: question.topics,
          questionImagesDimensions: question.questionImagesDimensions,
          answersImagesDimensions: question.answersImagesDimensions,
        })
        .from(question)
        .where(inArray(question.id, questionIds)),
    "fetch questions by ids"
  );

  // Map results
  const results: VectorizeSelectedQuestion[] = questionsData.map((q) => ({
    id: q.id,
    year: q.year ?? 0,
    season: q.season ?? "",
    paperType: q.paperType ?? 0,
    questionImages: JSON.parse(q.questionImages ?? "[]"),
    answers: JSON.parse(q.answers ?? "[]"),
    topics: JSON.parse(q.topics ?? "[]"),
    questionImagesDimensions: JSON.parse(q.questionImagesDimensions ?? "[]"),
    answersImagesDimensions: JSON.parse(q.answersImagesDimensions ?? "[]"),
    score: scoreMap.get(q.id) ?? 0,
  }));

  return results;
}
