"use server";
import { getDb } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const isAnswerExists = async (
  questionId: string,
  answerImageSrc: string
): Promise<boolean> => {
  const db = getDb();
  const result = await db
    .select()
    .from(schema.answer)
    .where(
      and(
        eq(schema.answer.questionId, questionId),
        eq(schema.answer.answerImageSrc, answerImageSrc)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createAnswer = async ({
  questionId,
  answerImageSrc,
  answerOrder,
}: {
  questionId: string;
  answerImageSrc: string;
  answerOrder: number;
}) => {
  const db = getDb();
  await db
    .insert(schema.answer)
    .values({ questionId, answerImageSrc, answerOrder });
};

export const overwriteAnswer = async ({
  questionId,
  answerImageSrc,
  answerOrder,
}: {
  questionId: string;
  answerImageSrc: string;
  answerOrder: number;
}) => {
  const db = getDb();

  await db
    .insert(schema.answer)
    .values({
      questionId,
      answerImageSrc,
      answerOrder,
    })
    .onConflictDoUpdate({
      target: [schema.answer.questionId, schema.answer.answerImageSrc],
      set: {
        answerImageSrc,
      },
    });
};
