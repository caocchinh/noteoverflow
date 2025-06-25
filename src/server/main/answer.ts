import "server-only";
import { getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export const isAnswerExists = async (
  questionId: string,
  answer: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(schema.answer)
    .where(
      and(
        eq(schema.answer.questionId, questionId),
        eq(schema.answer.answer, answer)
      )
    )
    .limit(1);
  return result.length > 0;
};

export const createAnswer = async ({
  questionId,
  answer,
  answerOrder,
}: {
  questionId: string;
  answer: string;
  answerOrder: number;
}): Promise<{
  success: boolean;
  error: string | undefined;
}> => {
  const db = await getDbAsync();
  await db
    .insert(schema.answer)
    .values({ questionId, answer, order: answerOrder });

  return {
    success: true,
    error: undefined,
  };
};

export const overwriteAnswer = async ({
  questionId,
  answer,
  answerOrder,
}: {
  questionId: string;
  answer: string;
  answerOrder: number;
}) => {
  const db = await getDbAsync();

  await db
    .insert(schema.answer)
    .values({
      questionId: questionId,
      answer: answer,
      order: answerOrder,
    })
    .onConflictDoUpdate({
      target: [schema.answer.questionId, schema.answer.order],
      set: {
        answer: answer,
      },
    });
};
