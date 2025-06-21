"use server";
import { getDb, getDbAsync } from "@/drizzle/db";
import * as schema from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";

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
}): Promise<{
  success: boolean;
  error: string | undefined;
}> => {
  try {
    const authInstance = await auth(getDbAsync);
    const session = await authInstance.api.getSession({
      headers: await headers(),
    });
    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "owner")
    ) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }
  } catch (error) {
    console.error("Error creating answer:", error);
    return {
      success: false,
      error: "Internal Server Error",
    };
  }

  const db = getDb();
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
  const db = getDb();

  await db
    .insert(schema.answer)
    .values({
      questionId,
      answerImageSrc,
      order: answerOrder,
    })
    .onConflictDoUpdate({
      target: [schema.answer.questionId, schema.answer.answerImageSrc],
      set: {
        answerImageSrc,
      },
    });
};
