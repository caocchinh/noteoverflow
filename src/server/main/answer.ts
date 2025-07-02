import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDbAsync } from '@/drizzle/db';
import { answer } from '@/drizzle/schema';

export const isAnswerExists = async (
  questionId: string,
  answerProp: string
): Promise<boolean> => {
  const db = await getDbAsync();
  const result = await db
    .select()
    .from(answer)
    .where(
      and(eq(answer.questionId, questionId), eq(answer.answer, answerProp))
    )
    .limit(1);
  return result.length > 0;
};

export const createAnswer = async ({
  questionId,
  answer: answerProp,
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
    .insert(answer)
    .values({ questionId, answer: answerProp, order: answerOrder });

  return {
    success: true,
    error: undefined,
  };
};

export const overwriteAnswer = async ({
  questionId,
  answer: answerProp,
  answerOrder,
}: {
  questionId: string;
  answer: string;
  answerOrder: number;
}) => {
  const db = await getDbAsync();

  await db
    .insert(answer)
    .values({
      questionId,
      answer: answerProp,
      order: answerOrder,
    })
    .onConflictDoUpdate({
      target: [answer.questionId, answer.order],
      set: {
        answer: answerProp,
      },
    });
};
