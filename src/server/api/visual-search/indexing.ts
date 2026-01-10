import "server-only";
import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { retryDatabase } from "@/dal/retry";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { status as elysiaStatus } from "elysia";
import { verifySession } from "@/dal/verifySession";
import { processImage } from "@/lib/cloudflareAI";
import { upsertVectorize } from "@/lib/cloudflareVectorize";
import { QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME } from "@/features/topical/constants/constants";
import { imageUrlToBase64 } from "@/lib/utils";
import { generateShortId, IndexProgress, VectorMetadata } from "./utils";

/**
 * Index all questions into the vector database
 * Owner-only endpoint that processes question/answer images using OCR + text embedding
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
  if (!session?.session || session.user.role !== "owner") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
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

  console.log("questions", questions);

  const progress: IndexProgress = {
    indexed: 0,
    failed: 0,
    skipped: 0,
    total: questions.length,
  };

  // Process each question
  for (const q of questions) {
    const questionImages: string[] = JSON.parse(q.questionImages ?? "[]");
    const answerImages: string[] = JSON.parse(q.answers ?? "[]");
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
          id: await generateShortId(`${q.id}_question_${i}`),
          values: embedding,
          metadata: {
            questionId: q.id,
            type: "question",
            imageIndex: i.toString(),
            imagePath: imagePath,
            extractedText: text,
            subject: q.subjectId ?? "",
            curriculum: q.curriculumName ?? "",
            year: q.year?.toString() ?? "0",
            season: q.season ?? "",
            paperType: q.paperType?.toString() ?? "0",
          },
        });
        sucessfulCount++;
      } catch (error) {
        console.error(`Failed to index question image ${q.id}_${i}:`, error);
        failedCount++;
        break;
      }
      // Add small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Process answer images (skip text-only answers)
    for (let i = 0; i < answerImages.length; i++) {
      try {
        const imagePath = answerImages[i];
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
          id: await generateShortId(`${q.id}_answer_${i}`),
          values: embedding,
          metadata: {
            questionId: q.id,
            type: "answer",
            imageIndex: i.toString(),
            imagePath: imagePath,
            extractedText: text,
            subject: q.subjectId ?? "",
            curriculum: q.curriculumName ?? "",
            year: q.year?.toString() ?? "0",
            season: q.season ?? "",
            paperType: q.paperType?.toString() ?? "0",
          },
        });
        sucessfulCount++;
      } catch (error) {
        console.error(`Failed to index answer image ${q.id}_${i}:`, error);
        failedCount++;
        break;
      }
      // Add small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Upsert vectors for this question immediately
    if (vectorsToUpsert.length > 0 && failedCount === 0) {
      try {
        await upsertVectorize(
          QUESTION_SEMANTIC_SEARCH_VECTORIZE_NAME,
          vectorsToUpsert,
          env.QUESTION_SEMANTIC_SEARCH_VECTORIZE
        );

        // Only mark as indexed if upsert succeeded
        await retryDatabase(
          () =>
            db
              .update(question)
              .set({
                isQuestionImageIndexed: 1,
              })
              .where(eq(question.id, q.id)),
          `update question ${q.id} isQuestionImageIndexed`
        );
        progress.indexed += sucessfulCount;
        progress.skipped += skippedCount;
      } catch (error) {
        console.error(`Failed to upsert vectors for question ${q.id}:`, error);
        progress.failed += failedCount + sucessfulCount;
      }
    } else {
      progress.failed += failedCount;
    }
  }

  return {
    success: true,
    progress,
    message: `Indexed ${progress.indexed} images from ${questions.length} questions (${progress.skipped} skipped, ${progress.failed} failed)`,
  };
}
