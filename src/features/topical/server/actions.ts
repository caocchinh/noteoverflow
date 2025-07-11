"use server";
import { and, eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import { finishedQuestions, userBookmarks } from "@/drizzle/schema";
import { verifySession } from "@/dal/verifySession";
import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";

export const addBookmarkAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db.insert(userBookmarks).values({
      userId,
      questionId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      throw new Error(UNAUTHORIZED);
    }
    console.error(error);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};

export const removeBookmarkAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db
      .delete(userBookmarks)
      .where(
        and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.questionId, questionId)
        )
      );
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      throw new Error(UNAUTHORIZED);
    }
    console.error(error);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};

export const addFinishedQuestionAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db.insert(finishedQuestions).values({
      userId,
      questionId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      throw new Error(UNAUTHORIZED);
    }
    console.error(error);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};

export const removeFinishedQuestionAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db
      .delete(finishedQuestions)
      .where(
        and(
          eq(finishedQuestions.userId, userId),
          eq(finishedQuestions.questionId, questionId)
        )
      );
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      throw new Error(UNAUTHORIZED);
    }
    console.error(error);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};
