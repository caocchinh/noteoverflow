import "server-only";
import { and, eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import { question, questionImage, questionTopic } from "@/drizzle/schema";

export const isQuestionExists = async (
  questionId: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(question)
    .where(eq(question.id, questionId))
    .limit(1);
  return result.length > 0;
};

export const createQuestion = async ({
  questionId,
  year,
  season,
  paperType,
  paperVariant,
  userId,
  subjectId,
  questionNumber,
  curriculumName,
}: {
  questionId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  userId: string;
  subjectId: string;
  questionNumber: number;
  curriculumName: string;
}) => {
  const db = await getDbAsync();
  await db.insert(question).values({
    id: questionId,
    year,
    season,
    paperType,
    paperVariant,
    uploadedBy: userId,
    subjectId,
    questionNumber,
    curriculumName,
  });
};

export const overwriteQuestion = async ({
  userId,
  year,
  season,
  paperType,
  paperVariant,
  subjectId,
  questionNumber,
  curriculumName,
  questionId,
}: {
  userId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  subjectId: string;
  questionNumber: number;
  curriculumName: string;
  questionId: string;
}) => {
  const db = await getDbAsync();

  await db
    .insert(question)
    .values({
      id: questionId,
      year,
      season,
      paperType,
      paperVariant,
      uploadedBy: userId,
      subjectId,
      questionNumber,
      curriculumName,
    })
    .onConflictDoUpdate({
      target: question.id,
      set: {
        year,
        season,
        paperType,
        paperVariant,
        uploadedBy: userId,
        subjectId,
        questionNumber,
        curriculumName,
        updatedAt: new Date(),
      },
    });
};

export const isQuestionImageExists = async (
  questionId: string,
  order: number
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(questionImage)
    .where(
      and(
        eq(questionImage.questionId, questionId),
        eq(questionImage.order, order)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createQuestionImage = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}): Promise<{
  success: boolean;
  error: string | undefined;
}> => {
  try {
    const db = await getDbAsync();
    await db.insert(questionImage).values({ questionId, imageSrc, order });
    return {
      success: true,
      error: undefined,
    };
  } catch (error) {
    console.error("Error creating question image:", error);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }
};

export const overwriteQuestionImage = async ({
  questionId,
  imageSrc,
  order,
}: {
  questionId: string;
  imageSrc: string;
  order: number;
}) => {
  const db = await getDbAsync();

  await db
    .insert(questionImage)
    .values({
      questionId,
      imageSrc,
      order,
    })
    .onConflictDoUpdate({
      target: [questionImage.questionId, questionImage.order],
      set: {
        imageSrc,
      },
    });
};

export const createQuestionTopic = async ({
  questionId,
  topic,
  subjectId,
  curriculumName,
}: {
  questionId: string;
  topic: string;
  subjectId: string;
  curriculumName: string;
}) => {
  try {
    const db = await getDbAsync();
    const existingQuestionTopic = await db
      .select()
      .from(questionTopic)
      .where(
        and(
          eq(questionTopic.questionId, questionId),
          eq(questionTopic.topic, topic)
        )
      );
    if (existingQuestionTopic.length > 0) {
      return;
    }
    await db.insert(questionTopic).values({
      questionId,
      topic,
      subjectId,
      curriculumName,
    });
  } catch (error) {
    console.error("Error creating question topic:", error);
  }
};
