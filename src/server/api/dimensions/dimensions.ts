import { retryDatabase } from "@/dal/retry";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/errors";
import { getImageDimensionsFromUrl } from "@/lib/image-utils";
import { eq } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import "server-only";

interface ImageDimension {
  width: number;
  height: number;
}

/**
 * Fetch image dimensions from a URL using native Web APIs
 * Works in Cloudflare Workers environment
 */
async function getImageDimensions(imageUrl: string): Promise<ImageDimension | null> {
  return await getImageDimensionsFromUrl(imageUrl);
}

/**
 * Check if a string is an image URL
 */
function isImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Check for common image hosting domains or image extensions
  const imageExtensions = /\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i;
  const imageHostDomains = ["notestack.online", "noteoverflow.com"];

  const hasImageExtension = imageExtensions.test(url);
  const isFromImageHost = imageHostDomains.some((domain) => url.includes(domain));

  return hasImageExtension || isFromImageHost;
}

/**
 * Get unprocessed questions
 * Owner-only endpoint
 */
export async function getUnprocessedQuestions({
  status,
  query,
}: {
  status: typeof elysiaStatus;
  query: { limit: number; offset: number };
}) {
  const { limit, offset } = query;

  // Verify owner session
  const session = await verifySession();
  if (!session?.session || session.user.role !== "owner") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
    });
  }

  const db = await getDbAsync();

  // Fetch questions without image dimensions
  const questions = await db.query.question.findMany({
    columns: {
      id: true,
      questionImages: true,
      answers: true,
    },
    limit,
    offset,
    where: (q, { eq }) => eq(q.isQuestionHasImageDimensions, 0),
  });

  return {
    success: true,
    questions: questions.map((q) => ({
      id: q.id,
      questionImages: JSON.parse(q.questionImages ?? "[]"),
      answers: JSON.parse(q.answers ?? "[]"),
    })),
  };
}

/**
 * Process image dimensions for a single question
 * Owner-only endpoint
 */
export async function processSingleQuestion({
  status,
  body,
}: {
  status: typeof elysiaStatus;
  body: {
    id: string;
    questionImages: string[];
    answers: string[];
  };
}) {
  const { id, questionImages, answers } = body;

  // Verify owner session
  const session = await verifySession();
  if (!session?.session || session.user.role !== "owner") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
    });
  }

  const db = await getDbAsync();

  let successfulCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  // Process question images
  const questionDimensions: (ImageDimension | null)[] = [];
  for (const imageUrl of questionImages) {
    if (!imageUrl) {
      questionDimensions.push(null);
      skippedCount++;
      continue;
    }
    try {
      const dimensions = await getImageDimensions(imageUrl);
      questionDimensions.push(dimensions);
      successfulCount++;
    } catch (error) {
      console.error(`Failed to get dimensions for question image: ${imageUrl}`, error);
      failedCount++;
      break;
    }
  }

  // Process answer images (check if each answer is an image)
  const answerDimensions: (ImageDimension | null)[] = [];
  for (const answer of answers) {
    if (!answer) {
      answerDimensions.push(null);
      skippedCount++;
      continue;
    }

    // Check if this answer is an image URL
    if (isImageUrl(answer)) {
      try {
        const dimensions = await getImageDimensions(answer);
        answerDimensions.push(dimensions);
        successfulCount++;
      } catch (error) {
        console.error(`Failed to get dimensions for answer image: ${answer}`, error);
        failedCount++;
        break;
      }
    } else {
      // Text answer, no dimensions
      answerDimensions.push(null);
      skippedCount++;
    }
  }

  // Only update the question if no failures occurred
  if (failedCount === 0) {
    try {
      await retryDatabase(
        () =>
          db
            .update(question)
            .set({
              questionImagesDimensions: JSON.stringify(questionDimensions),
              answersImagesDimensions: JSON.stringify(answerDimensions),
              isQuestionHasImageDimensions: 1,
              updatedAt: new Date(),
            })
            .where(eq(question.id, id)),
        `update question ${id} dimensions`,
      );
      return {
        success: true,
        processed: successfulCount,
        skipped: skippedCount,
        failed: 0,
      };
    } catch (error) {
      console.error(`Failed to update dimensions for question ${id}:`, error);
      return {
        success: false,
        processed: 0,
        skipped: 0,
        failed: failedCount + successfulCount,
        error: "Failed to update database",
      };
    }
  } else {
    return {
      success: false,
      processed: 0,
      skipped: skippedCount,
      failed: failedCount,
      error: "Failed to process images",
    };
  }
}
