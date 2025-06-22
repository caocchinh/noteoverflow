"use server";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { verifySession } from "@/dal/verifySession";
import { redirect } from "next/navigation";

export const isQuestionExists = async (
  questionId: string
): Promise<{
  success: boolean;
  data: boolean;
  error: string | undefined;
}> => {
  try {
    const session = await verifySession();

    if (session.user.role !== "admin" && session.user.role !== "owner") {
      redirect("/app");
    }
    const db = getDb();
    const result = await db
      .select()
      .from(schema.question)
      .where(eq(schema.question.id, questionId))
      .limit(1);
    return {
      success: true,
      data: result.length > 0,
      error: undefined,
    };
  } catch (error) {
    console.error("Error checking if question exists:", error);
    return {
      success: false,
      data: false,
      error: "Internal Server Error",
    };
  }
};

export const createQuestion = async ({
  questionId,
  year,
  season,
  paperType,
  paperVariant,
  userId,
  subjectId,
  topic,
  questionNumber,
}: {
  questionId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  userId: string;
  subjectId: string;
  topic: string;
  questionNumber: number;
}) => {
  const db = getDb();
  await db.insert(schema.question).values({
    id: questionId,
    year,
    season,
    paperType,
    paperVariant,
    uploadedBy: userId,
    subjectId,
    topic,
    questionNumber,
  });
};

export const overwriteQuestion = async ({
  userId,
  year,
  season,
  paperType,
  paperVariant,
  subjectId,
  topic,
  questionNumber,

  questionId,
}: {
  userId: string;
  year: number;
  season: string;
  paperType: number;
  paperVariant: number;
  subjectId: string;
  topic: string;
  questionNumber: number;

  questionId: string;
}) => {
  const db = getDb();

  await db
    .insert(schema.question)
    .values({
      id: questionId,
      year,
      season,
      paperType,
      paperVariant,
      uploadedBy: userId,
      subjectId,
      topic,
      questionNumber,
    })
    .onConflictDoUpdate({
      target: schema.question.id,
      set: {
        year,
        season,
        paperType,
        paperVariant,
        uploadedBy: userId,
        subjectId,
        topic,
        questionNumber,
        updatedAt: new Date(),
      },
    });
};

export const isQuestionImageExists = async (
  questionId: string,
  order: number
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.questionImage)
    .where(
      and(
        eq(schema.questionImage.questionId, questionId),
        eq(schema.questionImage.order, order)
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
    const session = await verifySession();
    if (session.user.role !== "admin" && session.user.role !== "owner") {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
    const db = getDb();
    await db
      .insert(schema.questionImage)
      .values({ questionId, imageSrc, order });
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
  const db = getDb();

  await db
    .insert(schema.questionImage)
    .values({
      questionId,
      imageSrc,
      order,
    })
    .onConflictDoUpdate({
      target: [schema.questionImage.questionId, schema.questionImage.order],
      set: {
        imageSrc,
      },
    });
};
