"use server";
import { and, eq } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import { userBookmarks } from "@/drizzle/schema";

import { verifySession } from "@/dal/verifySession";

export const addBookmarkAction = async ({
  questionId,
}: {
  questionId: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    await db.insert(userBookmarks).values({
      userId,
      questionId,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    console.error(error);
    throw new Error("Internal Server Error");
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
      throw new Error("Unauthorized");
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
    if (error instanceof Error && error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    console.error(error);
    throw new Error("Internal Server Error");
  }
};
