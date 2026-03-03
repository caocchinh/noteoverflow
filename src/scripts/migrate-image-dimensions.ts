import { getDbAsync } from "@/drizzle/db.server";
import { question } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import "server-only";

interface ImageDimension {
  width: number;
  height: number;
}

interface ImageWithDimensions {
  url: string;
  width: number | null;
  height: number | null;
}

interface AnswerWithDimensions {
  type: "text" | "image";
  content: string; // text content or image URL
  width?: number | null;
  height?: number | null;
}

/**
 * Migration script to combine parallel arrays:
 * - questionImages + questionImagesDimensions -> questionImages (with embedded dimensions)
 * - answers + answersImagesDimensions -> answers (with embedded dimensions)
 *
 * HOW IT WORKS:
 * 1. Fetch all questions from the database
 * 2. For each question:
 *    a. Parse the JSON arrays for images and dimensions
 *    b. Zip them together (combine by index)
 *    c. Create new structured objects with embedded dimensions
 *    d. Update the database with the new format
 * 3. Report progress and any errors
 */
async function migrateImageDimensions() {
  const db = await getDbAsync();

  console.log("Starting migration...");

  // Fetch all questions (or do in batches if too many)
  const BATCH_SIZE = 100;
  let offset = 0;
  let totalProcessed = 0;
  let totalErrors = 0;

  while (true) {
    const questions = await db.query.question.findMany({
      columns: {
        id: true,
        questionImages: true,
        questionImagesDimensions: true,
        answers: true,
        answersImagesDimensions: true,
      },
      limit: BATCH_SIZE,
      offset,
    });

    if (questions.length === 0) {
      break; // No more questions to process
    }

    console.log(`Processing batch: offset ${offset}, count ${questions.length}`);

    for (const q of questions) {
      try {
        // Parse the old parallel arrays
        const oldQuestionImages: string[] = JSON.parse(q.questionImages ?? "[]");
        const oldQuestionDimensions: (ImageDimension | null)[] = JSON.parse(
          q.questionImagesDimensions ?? "[]",
        );
        const oldAnswers: string[] = JSON.parse(q.answers ?? "[]");
        const oldAnswerDimensions: (ImageDimension | null)[] = JSON.parse(
          q.answersImagesDimensions ?? "[]",
        );

        // STEP 1: Combine questionImages with their dimensions
        const newQuestionImages: ImageWithDimensions[] = oldQuestionImages.map((url, index) => {
          const dimensions = oldQuestionDimensions[index] ?? null;
          return {
            url,
            width: dimensions?.width ?? null,
            height: dimensions?.height ?? null,
          };
        });

        // STEP 2: Combine answers with their dimensions
        // Determine if each answer is an image or text
        const newAnswers: AnswerWithDimensions[] = oldAnswers.map((content, index) => {
          const dimensions = oldAnswerDimensions[index] ?? null;
          const isImage = isImageUrl(content);

          if (isImage) {
            return {
              type: "image",
              content,
              width: dimensions?.width ?? null,
              height: dimensions?.height ?? null,
            };
          } else {
            return {
              type: "text",
              content,
            };
          }
        });

        // STEP 3: Update the database with new format
        await db
          .update(question)
          .set({
            questionImages: JSON.stringify(newQuestionImages),
            answers: JSON.stringify(newAnswers),
            // Clear the old dimension columns (or keep them for rollback)
            questionImagesDimensions: null,
            answersImagesDimensions: null,
            updatedAt: new Date(),
          })
          .where(eq(question.id, q.id));

        totalProcessed++;

        if (totalProcessed % 10 === 0) {
          console.log(`Processed ${totalProcessed} questions...`);
        }
      } catch (error) {
        console.error(`Failed to migrate question ${q.id}:`, error);
        totalErrors++;
      }
    }

    offset += BATCH_SIZE;
  }

  console.log("\n=== Migration Complete ===");
  console.log(`Total processed: ${totalProcessed}`);
  console.log(`Total errors: ${totalErrors}`);
}

/**
 * Helper function to determine if a string is an image URL
 */
function isImageUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  const imageExtensions = /\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i;
  const imageHostDomains = ["notestack.online", "noteoverflow.com"];

  const hasImageExtension = imageExtensions.test(url);
  const isFromImageHost = imageHostDomains.some((domain) => url.includes(domain));

  return hasImageExtension || isFromImageHost;
}

// Run the migration
migrateImageDimensions()
  .then(() => {
    console.log("Migration script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
