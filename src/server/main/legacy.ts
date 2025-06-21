"use server";

import { getDb } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import * as schema from "@/drizzle/schema";

export const processCurriculumData = async ({
  curriculum,
  subjectFullName,
  year,
  season,
  paperType,
  paperVariant,
  topic,
  userId,
  questionId,
  questionNumber,
  contentType,
  questionImageSrc,
  answerImageSrc,
  order,
}: {
  curriculum: string;
  subjectFullName: string;
  year: string;
  season: "Summer" | "Winter" | "Spring";
  paperType: number;
  paperVariant: number;
  topic: string;
  userId: string;
  questionId: string;
  questionNumber: string;
  contentType: "questions" | "answers";
  questionImageSrc?: string;
  answerImageSrc?: string;
  order: number;
}): Promise<boolean> => {
  try {
    // Get database instance
    const db = getDb();

    try {
      // Check and create curriculum if needed
      const curriculumExists = await db
        .select()
        .from(schema.curriculum)
        .where(eq(schema.curriculum.name, curriculum))
        .limit(1);

      if (curriculumExists.length === 0) {
        await db.insert(schema.curriculum).values({ name: curriculum });
      }

      // Check and create subject if needed
      const subjectExists = await db
        .select()
        .from(schema.subject)
        .where(eq(schema.subject.id, subjectFullName))
        .limit(1);

      if (subjectExists.length === 0) {
        await db.insert(schema.subject).values({
          id: subjectFullName,
          curriculumName: curriculum,
        });
      }

      // Check and create year if needed
      const yearExists = await db
        .select()
        .from(schema.year)
        .where(
          and(
            eq(schema.year.year, parseInt(year)),
            eq(schema.year.subjectId, subjectFullName)
          )
        )
        .limit(1);

      if (yearExists.length === 0) {
        await db.insert(schema.year).values({
          year: parseInt(year),
          subjectId: subjectFullName,
        });
      }

      // Check and create season if needed
      const seasonExists = await db
        .select()
        .from(schema.season)
        .where(
          and(
            eq(schema.season.season, season),
            eq(schema.season.subjectId, subjectFullName)
          )
        )
        .limit(1);

      if (seasonExists.length === 0) {
        await db.insert(schema.season).values({
          season: season,
          subjectId: subjectFullName,
        });
      }

      // Check and create paperType if needed
      const paperTypeExists = await db
        .select()
        .from(schema.paperType)
        .where(
          and(
            eq(schema.paperType.paperType, paperType),
            eq(schema.paperType.subjectId, subjectFullName)
          )
        )
        .limit(1);

      if (paperTypeExists.length === 0) {
        await db.insert(schema.paperType).values({
          paperType: paperType,
          subjectId: subjectFullName,
        });
      }

      // Check and create topic if needed
      const topicExists = await db
        .select()
        .from(schema.topic)
        .where(
          and(
            eq(schema.topic.topic, topic),
            eq(schema.topic.subjectId, subjectFullName)
          )
        )
        .limit(1);

      if (topicExists.length === 0) {
        await db.insert(schema.topic).values({
          topic: topic,
          subjectId: subjectFullName,
        });
      }

      // Create or overwrite question/answer based on content type
      if (contentType === "questions" && questionImageSrc) {
        await db
          .insert(schema.question)
          .values({
            id: questionId,
            uploadedBy: userId,
            year: parseInt(year),
            season: season,
            paperType: paperType,
            paperVariant: paperVariant,
            subjectId: subjectFullName,
            topic: topic,
            questionNumber: parseInt(questionNumber[1]),
          })
          .onConflictDoUpdate({
            target: schema.question.id,
            set: {
              uploadedBy: userId,
              year: parseInt(year),
              season: season,
              paperType: paperType,
              paperVariant: paperVariant,
              subjectId: subjectFullName,
              topic: topic,
              questionNumber: parseInt(questionNumber[1]),
            },
          });

        await db
          .insert(schema.questionImage)
          .values({
            questionId: questionId,
            imageSrc: questionImageSrc,
            order: order,
          })
          .onConflictDoUpdate({
            target: [
              schema.questionImage.questionId,
              schema.questionImage.order,
            ],
            set: { imageSrc: questionImageSrc },
          });
      } else if (contentType === "answers" && answerImageSrc) {
        await db
          .insert(schema.answer)
          .values({
            questionId: questionId,
            answerImageSrc: answerImageSrc,
            order: order,
          })
          .onConflictDoUpdate({
            target: [schema.answer.questionId, schema.answer.order],
            set: { answerImageSrc: answerImageSrc },
          });
      }

      return true;
    } catch (dbError) {
      console.error("Database error:", dbError);
      return false;
    }
  } catch (error) {
    console.error("Error processing curriculum data:", error);
    return false;
  }
};
