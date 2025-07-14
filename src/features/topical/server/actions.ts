"use server";
import { and, eq, sql } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import {
  finishedQuestions,
  userBookmarks,
  userBookmarkList,
} from "@/drizzle/schema";
import { verifySession } from "@/dal/verifySession";
import {
  BAD_REQUEST,
  DOES_NOT_EXIST,
  INTERNAL_SERVER_ERROR,
  LIMIT_EXCEEDED,
  UNAUTHORIZED,
} from "@/constants/constants";
import { ServerActionResponse } from "@/constants/types";

export const createBookmarkListAction = async ({
  listName,
}: {
  listName: string;
}): Promise<ServerActionResponse<string>> => {
  if (listName.trim() === "") {
    return {
      error: BAD_REQUEST,
      success: false,
    };
  }
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(userBookmarkList)
      .where(eq(userBookmarkList.userId, userId));

    if (total >= 50) {
      return {
        error: LIMIT_EXCEEDED,
        success: false,
      };
    }

    await db
      .insert(userBookmarkList)
      .values({
        userId,
        listName,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    return {
      success: true,
      data: session.user.id,
    };
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const addBookmarkAction = async ({
  questionId,
  bookmarkListName,
}: {
  questionId: string;
  bookmarkListName: string;
}): Promise<ServerActionResponse<string>> => {
  if (bookmarkListName.trim() === "") {
    return {
      error: BAD_REQUEST,
      success: false,
    };
  }
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(userBookmarks)
      .where(
        and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.listName, bookmarkListName)
        )
      );

    if (total >= 100) {
      return {
        error: LIMIT_EXCEEDED,
        success: false,
      };
    }

    try {
      await db
        .insert(userBookmarks)
        .values({
          userId,
          questionId,
          listName: bookmarkListName,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [
            userBookmarks.userId,
            userBookmarks.questionId,
            userBookmarks.listName,
          ],
          set: { updatedAt: new Date() },
        });
    } catch (e) {
      if (
        e instanceof Error &&
        /FOREIGN KEY constraint failed/i.test(e.message)
      ) {
        return {
          error: DOES_NOT_EXIST,
          success: false,
        };
      }
      return {
        error: INTERNAL_SERVER_ERROR,
        success: false,
      };
    }
    return {
      success: true,
      data: userId,
    };
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const removeBookmarkAction = async ({
  questionId,
  bookmarkListName,
}: {
  questionId: string;
  bookmarkListName: string;
}): Promise<ServerActionResponse<string>> => {
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
          eq(userBookmarks.questionId, questionId),
          eq(userBookmarks.listName, bookmarkListName)
        )
      );
    return {
      success: true,
      data: userId,
    };
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
    await db
      .insert(finishedQuestions)
      .values({
        userId,
        questionId,
        //Local server time
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [finishedQuestions.userId, finishedQuestions.questionId],
        set: {
          updatedAt: new Date(),
        },
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
