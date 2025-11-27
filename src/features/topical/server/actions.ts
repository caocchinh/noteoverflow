"use server";
import { and, eq, sql } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db.server";
import { finishedQuestions, recentQuery } from "@/drizzle/schema";
import { verifySession } from "@/dal/verifySession";
import {
  BAD_REQUEST,
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
} from "@/constants/constants";
import { ServerActionResponse } from "@/constants/types";
import { BookmarkService } from "../services/bookmark.service";
import { AnnotationService } from "../services/annotation.service";
import { FilterData } from "../constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "../lib/utils";
import { MAX_NUMBER_OF_RECENT_QUERIES } from "../constants/constants";

// Bookmark Actions delegated to Service

export const createBookmarkListAndAddBookmarkAction = async ({
  listName,
  visibility,
  questionId,
}: {
  listName: string;
  visibility: "public" | "private";
  questionId: string;
}): Promise<ServerActionResponse<string>> => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;
    return await BookmarkService.createListAndAddBookmark(
      userId,
      listName,
      visibility,
      questionId
    );
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return { error: UNAUTHORIZED, success: false };
    }
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
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
    return { error: BAD_REQUEST, success: false };
  }
  try {
    const session = await verifySession();
    if (!session) {
      return { error: UNAUTHORIZED, success: false };
    }
    const userId = session.user.id;
    const result = await BookmarkService.addBookmark(
      userId,
      listId,
      questionId
    );
    return result as ServerActionResponse<void>;
  } catch (error) {
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
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
      return { error: UNAUTHORIZED, success: false };
    }
    const userId = session.user.id;
    return await BookmarkService.removeBookmark(userId, listId, questionId);
  } catch (error) {
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
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
      return { error: UNAUTHORIZED, success: false };
    }
    const userId = session.user.id;
    return await BookmarkService.deleteList(userId, listId);
  } catch (error) {
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
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
      return { error: UNAUTHORIZED, success: false };
    }
    const userId = session.user.id;
    return await BookmarkService.renameList(userId, listId, newName);
  } catch (error) {
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
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
      return { error: UNAUTHORIZED, success: false };
    }
    const userId = session.user.id;
    return await BookmarkService.changeListVisibility(
      userId,
      listId,
      newVisibility
    );
  } catch (error) {
    console.error(error);
    return { error: INTERNAL_SERVER_ERROR, success: false };
  }
};

// Other Actions (Finished Questions, Recent Query) - Kept as is for now, but should be refactored similarly

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

// Annotation Actions

export const saveAnnotationsAction = async ({
  questionId,
  questionXfdf,
  answerXfdf,
}: {
  questionId: string;
  questionXfdf: string;
  answerXfdf: string;
}): Promise<ServerActionResponse<void>> => {
  try {
    const session = await verifySession();
    if (!session) {
      throw new Error(UNAUTHORIZED);
    }
    const userId = session.user.id;

    return await AnnotationService.saveAnnotations(
      userId,
      questionId,
      questionXfdf,
      answerXfdf
    );
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

export const getAnnotationsAction = async ({
  questionId,
}: {
  questionId: string;
}): Promise<
  ServerActionResponse<{
    questionXfdf: string | null;
    answerXfdf: string | null;
  } | null>
> => {
  try {
    const session = await verifySession();
    if (!session) {
      return {
        success: true,
        data: null,
      };
    }
    const userId = session.user.id;

    return await AnnotationService.getAnnotations(userId, questionId);
  } catch (error) {
    console.error(error);
    return {
      error: INTERNAL_SERVER_ERROR,
      success: false,
    };
  }
};
