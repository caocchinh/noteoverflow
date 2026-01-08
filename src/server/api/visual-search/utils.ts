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
import { SelectedQuestion } from "@/features/topical/constants/types";

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

  [key: string]: string;
}

// Response types

export interface IndexProgress {
  indexed: number;
  failed: number;
  skipped: number;
  total: number;
}

// Search filter type used by both searchByText and searchByImage
export interface SearchFilter {
  curriculum?: string;
  subject?: string;
  topic?: string[];
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
          topic: filter.topic,
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
 * Returns SelectedQuestion[] matching the topical questions format
 */
export async function fetchQuestionResults(
  matches: VectorizeMatches
): Promise<SelectedQuestion[]> {
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

  const db = await getDbAsync();
  const results: SelectedQuestion[] = [];

  for (const detail of matchDetails) {
    if (results.some((r) => r.id === detail.questionId)) continue;

    const questionData = await db.query.question.findFirst({
      where: (q, { eq }) => eq(q.id, detail.questionId),
      columns: {
        id: true,
        year: true,
        season: true,
        paperType: true,
        questionImages: true,
        answers: true,
        topics: true,
      },
    });

    if (!questionData) continue;

    results.push({
      id: questionData.id,
      year: questionData.year ?? 0,
      season: questionData.season ?? "",
      paperType: questionData.paperType ?? 0,
      questionImages: JSON.parse(questionData.questionImages ?? "[]"),
      answers: JSON.parse(questionData.answers ?? "[]"),
      topics: JSON.parse(questionData.topics ?? "[]"),
    });
  }

  return results;
}
