import { retryDatabase } from "@/dal/retry";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME } from "@/features/topical/constants/constants";
import { processImage } from "@/lib/cloudflareAI";
import { upsertVectorize } from "@/lib/cloudflareVectorize";
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "@/lib/errors";
import { imageUrlToBase64 } from "@/lib/utils";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import "server-only";
import { generateShortId, VectorMetadata } from "./utils";

/**
 * Get unindexed questions
 * Owner-only endpoint
 */
export async function getUnindexedQuestions({
  status,
  query,
}: {
  status: typeof elysiaStatus;
  query: { limit: number; offset: number };
}) {
  const { limit, offset } = query;

  // Verify admin session
  const session = await verifySession();
  if (!session?.session || session.user.role !== "owner") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
    });
  }

  const db = await getDbAsync();

  // Fetch questions with pagination
  const questions = await db.query.question.findMany({
    columns: {
      id: true,
      questionImages: true,
      answers: true,
      subjectId: true,
      curriculumName: true,
      year: true,
      season: true,
      paperType: true,
    },
    limit,
    offset,
    where: (q, { eq }) => eq(q.isQuestionImageIndexed, 0),
  });

  return {
    success: true,
    questions: questions.map((q) => ({
      id: q.id,
      questionImages: JSON.parse(q.questionImages ?? "[]"),
      answers: JSON.parse(q.answers ?? "[]"),
      subjectId: q.subjectId ?? "",
      curriculumName: q.curriculumName ?? "",
      year: q.year?.toString() ?? "0",
      season: q.season ?? "",
      paperType: q.paperType?.toString() ?? "0",
    })),
  };
}

/**
 * Index a single question into the vector database
 * Owner-only endpoint that processes question/answer images using OCR + text embedding
 */
export async function indexSingleQuestion({
  status,
  body,
}: {
  status: typeof elysiaStatus;
  body: {
    id: string;
    questionImages: string[];
    answers: string[];
    subjectId: string;
    curriculumName: string;
    year: string;
    season: string;
    paperType: string;
  };
}) {
  const { id, questionImages, answers, subjectId, curriculumName, year, season, paperType } = body;

  // Verify admin session
  const session = await verifySession();
  if (!session?.session || session.user.role !== "owner") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
    });
  }

  const { env } = await getCloudflareContext({ async: true });
  const db = await getDbAsync();

  let sucessfulCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  const vectorsToUpsert: Array<{
    id: string;
    values: number[];
    metadata: VectorMetadata;
  }> = [];

  // Process question images
  for (let i = 0; i < questionImages.length; i++) {
    try {
      const imagePath = questionImages[i];
      if (!imagePath) continue;

      const imageBase64 = await imageUrlToBase64(imagePath);
      const { text, embedding } = await processImage(imageBase64, env.AI);

      vectorsToUpsert.push({
        id: await generateShortId(`${id}_question_${i}`),
        values: embedding,
        metadata: {
          questionId: id,
          type: "question",
          imageIndex: i.toString(),
          imagePath: imagePath,
          extractedText: text,
          subject: subjectId,
          curriculum: curriculumName,
          year: year,
          season: season,
          paperType: paperType,
        },
      });
      sucessfulCount++;
    } catch (error) {
      console.error(`Failed to index question image ${id}_${i}:`, error);
      failedCount++;
      break;
    }
    // Add small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Process answer images (skip text-only answers)
  for (let i = 0; i < answers.length; i++) {
    try {
      const imagePath = answers[i];
      if (!imagePath) continue;

      // Skip if not an image URL (text answers)
      // Images are hosted on notestack.online, text answers are plain strings
      const isImageUrl = imagePath.includes("https://notestack.online");
      if (!isImageUrl) {
        skippedCount++;
        continue;
      }

      const imageBase64 = await imageUrlToBase64(imagePath);
      const { text, embedding } = await processImage(imageBase64, env.AI);

      vectorsToUpsert.push({
        id: await generateShortId(`${id}_answer_${i}`),
        values: embedding,
        metadata: {
          questionId: id,
          type: "answer",
          imageIndex: i.toString(),
          imagePath: imagePath,
          extractedText: text,
          subject: subjectId,
          curriculum: curriculumName,
          year: year,
          season: season,
          paperType: paperType,
        },
      });
      sucessfulCount++;
    } catch (error) {
      console.error(`Failed to index answer image ${id}_${i}:`, error);
      failedCount++;
      break;
    }
    // Add small delay to prevent rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Upsert vectors for this question
  if (vectorsToUpsert.length > 0 && failedCount === 0) {
    try {
      await upsertVectorize(
        QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME,
        vectorsToUpsert,
        env.QUESTION_SEMANTIC_SEARCH_VECTORIZE,
      );

      // Only mark as indexed if upsert succeeded
      await retryDatabase(
        () =>
          db
            .update(question)
            .set({
              isQuestionImageIndexed: 1,
            })
            .where(eq(question.id, id)),
        `update question ${id} isQuestionImageIndexed`,
      );

      return {
        success: true,
        indexed: sucessfulCount,
        skipped: skippedCount,
        failed: 0,
      };
    } catch (error) {
      console.error(`Failed to upsert vectors for question ${id}:`, error);
      return {
        success: false,
        indexed: 0,
        skipped: 0,
        failed: failedCount + sucessfulCount,
        error: "Failed to upsert to vector database",
      };
    }
  } else {
    return {
      success: false,
      indexed: 0,
      skipped: skippedCount,
      failed: failedCount,
      error: "Failed to process images",
    };
  }
}
