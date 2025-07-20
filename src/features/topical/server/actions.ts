"use server";
import { and, eq, sql } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db";
import {
  finishedQuestions,
  userBookmarks,
  userBookmarkList,
  recentQuery,
} from "@/drizzle/schema";
import { verifySession } from "@/dal/verifySession";
import {
  BAD_REQUEST,
  DOES_NOT_EXIST,
  INTERNAL_SERVER_ERROR,
  LIMIT_EXCEEDED,
  MAXIMUM_BOOKMARK_LISTS_PER_USER,
  MAXIMUM_BOOKMARKS_PER_LIST,
  UNAUTHORIZED,
} from "@/constants/constants";
import { ServerActionResponse } from "@/constants/types";
import { MAX_NUMBER_OF_RECENT_QUERIES } from "../constants/constants";

export const createBookmarkListAction = async ({
  listName,
  visibility,
}: {
  listName: string;
  visibility: "public" | "private";
}): Promise<ServerActionResponse<string>> => {
  if (listName.trim() === "" || listName.length > 100) {
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

    if (total >= MAXIMUM_BOOKMARK_LISTS_PER_USER) {
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
        visibility,
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
  visibility,
}: {
  questionId: string;
  bookmarkListName: string;
  visibility: "public" | "private";
}): Promise<ServerActionResponse<string>> => {
  if (bookmarkListName.trim() === "" || bookmarkListName.length > 100) {
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
          eq(userBookmarks.listName, bookmarkListName),
          eq(userBookmarks.visibility, visibility)
        )
      );

    if (total >= MAXIMUM_BOOKMARKS_PER_LIST) {
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
          visibility,
        })
        .onConflictDoUpdate({
          target: [
            userBookmarks.userId,
            userBookmarks.questionId,
            userBookmarks.listName,
            userBookmarks.visibility,
          ],
          set: { updatedAt: new Date() },
        });
    } catch (e) {
      console.log(e);
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
  visibility,
}: {
  questionId: string;
  bookmarkListName: string;
  visibility: "public" | "private";
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
          eq(userBookmarks.listName, bookmarkListName),
          eq(userBookmarks.visibility, visibility)
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
}): Promise<ServerActionResponse<string>> => {
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

export const removeFinishedQuestionAction = async ({
  questionId,
}: {
  questionId: string;
}): Promise<ServerActionResponse<string>> => {
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

export const addRecentQuery = async ({
  queryKey,
}: {
  queryKey: string;
}): Promise<
  ServerActionResponse<{ isAnyDeleted: string; lastSearch: Date }>
> => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    // Check if user already has 25 or more queries
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recentQuery)
      .where(eq(recentQuery.userId, userId));

    let isAnyDeleted = "";

    // If user has 25 or more queries, delete the oldest one
    if (count >= MAX_NUMBER_OF_RECENT_QUERIES) {
      const oldestQueries = await db
        .select()
        .from(recentQuery)
        .where(eq(recentQuery.userId, userId))
        .orderBy(recentQuery.lastSearch)
        .limit(1);

      if (oldestQueries.length > 0) {
        await db
          .delete(recentQuery)
          .where(
            and(
              eq(recentQuery.userId, userId),
              eq(recentQuery.queryKey, oldestQueries[0].queryKey)
            )
          );
        isAnyDeleted = oldestQueries[0].queryKey;
      }
    }

    // Insert the new query or update if it already exists
    const now = new Date();
    await db
      .insert(recentQuery)
      .values({
        userId,
        queryKey,
        lastSearch: now,
      })
      .onConflictDoUpdate({
        target: [recentQuery.userId, recentQuery.queryKey],
        set: {
          lastSearch: now,
        },
      });
    return {
      success: true,
      data: {
        isAnyDeleted,
        lastSearch: now,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const updateSortParams = async ({
  queryKey,
  sortParams,
}: {
  queryKey: string;
  sortParams: string;
}) => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    await db
      .update(recentQuery)
      .set({
        sortParams,
      })
      .where(
        and(eq(recentQuery.queryKey, queryKey), eq(recentQuery.userId, userId))
      );

    return;
  } catch (error) {
    console.error(error);
    throw new Error(INTERNAL_SERVER_ERROR);
  }
};
