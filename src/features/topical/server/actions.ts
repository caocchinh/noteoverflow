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
import {
  LIST_NAME_MAX_LENGTH,
  MAX_NUMBER_OF_RECENT_QUERIES,
} from "../constants/constants";
import { FilterData } from "../constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "../lib/utils";

const addBookmark = async ({
  userId,
  listId,
  questionId,
}: {
  userId: string;
  listId: string;
  questionId: string;
}) => {
  const db = await getDbAsync();

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(userBookmarks)
    .where(
      and(eq(userBookmarks.listId, listId), eq(userBookmarks.userId, userId))
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
        questionId,
        listId,
        userId,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userBookmarks.listId, userBookmarks.questionId],
        set: { updatedAt: new Date() },
      });
    return {
      success: true,
    };
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
};

export const createBookmarkListAndAddBookmarkAction = async ({
  listName,
  visibility,
  questionId,
}: {
  listName: string;
  visibility: "public" | "private";
  questionId: string;
}): Promise<ServerActionResponse<string>> => {
  if (listName.trim() === "" || listName.length > LIST_NAME_MAX_LENGTH) {
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

    const existingList = await db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.listName, listName),
          eq(userBookmarkList.visibility, visibility)
        )
      );

    if (existingList.length >= MAXIMUM_BOOKMARK_LISTS_PER_USER) {
      return {
        error: LIMIT_EXCEEDED,
        success: false,
      };
    }
    const newListId = crypto.randomUUID();

    if (existingList.length === 0) {
      await db
        .insert(userBookmarkList)
        .values({
          id: newListId,
          userId,
          listName,
          updatedAt: new Date(),
          visibility,
        })
        .onConflictDoNothing();

      await db.insert(userBookmarks).values({
        questionId,
        listId: newListId,
        userId,
        updatedAt: new Date(),
      });
      return {
        success: true,
        data: newListId,
      };
    } else {
      const result = await addBookmark({
        userId,
        listId: existingList[0].id,
        questionId,
      });
      if (result.error) {
        return {
          error: result.error,
          success: false,
        };
      }
      return {
        success: true,
        data: existingList[0].id,
      };
    }
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
  listId,
}: {
  questionId: string;
  listId: string;
}): Promise<ServerActionResponse<void>> => {
  if (listId.trim() === "") {
    return {
      error: BAD_REQUEST,
      success: false,
    };
  }
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const userId = session.user.id;
    return await addBookmark({ userId, listId, questionId });
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const removeBookmarkAction = async ({
  questionId,
  listId,
}: {
  questionId: string;
  listId: string;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const db = await getDbAsync();
    const userId = session.user.id;
    await db
      .delete(userBookmarks)
      .where(
        and(
          eq(userBookmarks.questionId, questionId),
          eq(userBookmarks.listId, listId),
          eq(userBookmarks.userId, userId)
        )
      );
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const addFinishedQuestionAction = async ({
  questionId,
}: {
  questionId: string;
}): Promise<ServerActionResponse<void>> => {
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

export const removeFinishedQuestionAction = async ({
  questionId,
}: {
  questionId: string;
}): Promise<ServerActionResponse<void>> => {
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

export const addRecentQuery = async ({
  queryKey,
}: {
  queryKey: {
    curriculumId: string;
    subjectId: string;
  } & FilterData;
}): Promise<ServerActionResponse<{ deletedKey: string; lastSearch: Date }>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        success: true,
      };
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    if (!validateCurriculum(queryKey.curriculumId)) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }
    if (!validateSubject(queryKey.curriculumId, queryKey.subjectId)) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }
    if (
      !validateFilterData({
        data: {
          topic: queryKey.topic,
          paperType: queryKey.paperType,
          year: queryKey.year,
          season: queryKey.season,
        },
        curriculumn: queryKey.curriculumId,
        subject: queryKey.subjectId,
      })
    ) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }

    // Check if user already has reach the limit
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(recentQuery)
      .where(eq(recentQuery.userId, userId));

    let deletedKey = "";

    // If user has reached the limit, delete the oldest one
    if (count > MAX_NUMBER_OF_RECENT_QUERIES) {
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
        deletedKey = oldestQueries[0].queryKey;
      }
    }

    // Insert the new query or update if it already exists
    const now = new Date();
    await db
      .insert(recentQuery)
      .values({
        userId,
        queryKey: JSON.stringify(queryKey),
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
        deletedKey,
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

export const deleteRecentQuery = async ({
  queryKey,
}: {
  queryKey: string;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const userId = session.user.id;

    const db = await getDbAsync();

    await db
      .delete(recentQuery)
      .where(
        and(eq(recentQuery.queryKey, queryKey), eq(recentQuery.userId, userId))
      );

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const deleteBookmarkListAction = async ({
  listId,
}: {
  listId: string;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    await db
      .delete(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId)
        )
      );
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};

export const renameBookmarkListAction = async ({
  listId,
  newName,
}: {
  listId: string;
  newName: string;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const userId = session.user.id;
    const db = await getDbAsync();

    if (newName.trim() === "" || newName.length > LIST_NAME_MAX_LENGTH) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }
    const existingList = await db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.listName, newName)
        )
      );
    if (existingList.length > 0) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }
    await db
      .update(userBookmarkList)
      .set({ listName: newName })
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.id, listId)
        )
      );
    return {
      success: true,
    };
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
};

export const changeBookmarkListVisibilityAction = async ({
  listId,
  newVisibility,
}: {
  listId: string;
  newVisibility: "public" | "private";
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        error: UNAUTHORIZED,
        success: false,
      };
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    const existingList = await db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.visibility, newVisibility)
        )
      );
    if (existingList.length > 0) {
      return {
        error: BAD_REQUEST,
        success: false,
      };
    }

    await db
      .update(userBookmarkList)
      .set({ visibility: newVisibility })
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId)
        )
      );
    return {
      success: true,
    };
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
};

// export const updateSortParams = async ({
//   queryKey,
//   sortParams,
// }: {
//   queryKey: string;
//   sortParams: string;
// }) => {
//   try {
//     const session = await verifySession();
//     if (!session) {
//       throw new Error(UNAUTHORIZED);
//     }
//     const userId = session.user.id;
//     const db = await getDbAsync();

//     await db
//       .update(recentQuery)
//       .set({
//         sortParams,
//       })
//       .where(
//         and(eq(recentQuery.queryKey, queryKey), eq(recentQuery.userId, userId))
//       );

//     return;
//   } catch (error) {
//     console.error(error);
//     throw new Error(INTERNAL_SERVER_ERROR);
//   }
// };
