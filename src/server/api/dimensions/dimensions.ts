import "server-only";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { retryDatabase } from "@/dal/retry";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { status as elysiaStatus } from "elysia";
import { verifySession } from "@/dal/verifySession";
import { PhotonImage } from "@cf-wasm/photon";

interface ImageDimension {
  width: number;
  height: number;
}

interface ProcessProgress {
  processed: number;
  failed: number;
  skipped: number;
  total: number;
}

/**
 * Fetch image dimensions from a URL using @cf-wasm/photon
 * Works in Cloudflare Workers environment
 */
async function getImageDimensions(
  imageUrl: string
): Promise<ImageDimension | null> {
  try {
    // Fetch the image as bytes
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - ${response.status}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Create PhotonImage from bytes
    const image = PhotonImage.new_from_byteslice(bytes);
    const width = image.get_width();
    const height = image.get_height();

    // Free memory
    image.free();

    return { width, height };
  } catch (error) {
    console.error(`Error fetching image dimensions for ${imageUrl}:`, error);
    return null;
  }
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
  const isFromImageHost = imageHostDomains.some((domain) =>
    url.includes(domain)
  );

  return hasImageExtension || isFromImageHost;
}

/**
 * Process image dimensions for questions in batch
 * Admin-only endpoint
 */
export async function processDimensions({
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

  const progress: ProcessProgress = {
    processed: 0,
    failed: 0,
    skipped: 0,
    total: questions.length,
  };

  // Process each question
  for (const q of questions) {
    const questionImages: string[] = JSON.parse(q.questionImages ?? "[]");
    const answers: string[] = JSON.parse(q.answers ?? "[]");
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
        console.error(
          `Failed to get dimensions for question image: ${imageUrl}`,
          error
        );
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
          console.error(
            `Failed to get dimensions for answer image: ${answer}`,
            error
          );
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
              .where(eq(question.id, q.id)),
          `update question ${q.id} dimensions`
        );
        progress.processed += successfulCount;
        progress.skipped += skippedCount;
      } catch (error) {
        console.error(
          `Failed to update dimensions for question ${q.id}:`,
          error
        );
        progress.failed += failedCount + successfulCount;
      }
    } else {
      progress.failed += failedCount;
    }
  }

  return {
    success: true,
    progress,
    message: `Processed ${progress.processed} questions (${progress.failed} failed, ${progress.skipped} skipped)`,
  };
}
