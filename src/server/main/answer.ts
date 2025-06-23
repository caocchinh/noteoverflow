import "server-only";
import { getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const isAnswerExists = async (
  questionId: string,
  answerImageSrc: string
): Promise<boolean> => {
  const db = await getDbAsync();
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
}): Promise<{
  success: boolean;
  error: string | undefined;
}> => {
  const db = await getDbAsync();
  await db
    .insert(schema.answer)
    .values({ questionId, answerImageSrc, order: answerOrder });

  return {
    success: true,
    error: undefined,
  };
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
  const db = await getDbAsync();

  await db
    .insert(schema.answer)
    .values({
      questionId: questionId,
      answerImageSrc: answerImageSrc,
      order: answerOrder,
    })
    .onConflictDoUpdate({
      target: [schema.answer.questionId, schema.answer.order],
      set: {
        answerImageSrc: answerImageSrc,
      },
    });
};
