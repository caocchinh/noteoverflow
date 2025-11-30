import "server-only";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import {
  finishedQuestions,
  userAnnotations,
  userBookmarkList,
} from "@/drizzle/schema";
import {
  SavedActivitiesResponse,
  SelectedAnnotation,
  SelectedBookmark,
  SelectedFinishedQuestion,
} from "@/features/topical/constants/types";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { eq } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";

export const getSavedActivities = async ({
  status,
}: {
  status: typeof elysiaStatus;
}) => {
  const session = await verifySession();
  if (!session) {
    return status(HTTP_STATUS.UNAUTHORIZED, {
      error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }
  const userId = session.user.id;

  // Fetch finished questions, bookmarks, and annotations in parallel
  const [finishedQuestionsData, bookmarksData, annotationsData] =
    await Promise.all([
      fetchFinishedQuestions(userId),
      fetchBookmarks(userId),
      fetchAnnotations(userId),
    ]);

  const responseData: SavedActivitiesResponse = {
    finishedQuestions: finishedQuestionsData,
    bookmarks: bookmarksData,
    annotations: annotationsData,
  };

  return responseData;
};

// Helper functions
async function fetchFinishedQuestions(userId: string) {
  const db = await getDbAsync();
  const finishedQuestionsData = await db.query.finishedQuestions.findMany({
    where: eq(finishedQuestions.userId, userId),
    columns: {
      updatedAt: true,
    },
    with: {
      question: {
        columns: {
          id: true,
          paperType: true,
          answers: true,
          questionImages: true,
          season: true,
          year: true,
          topics: true,
        },
      },
    },
  });

  const data: SelectedFinishedQuestion[] = finishedQuestionsData.map((item) => {
    return {
      updatedAt: item.updatedAt,
      question: {
        ...item.question,
        questionImages: JSON.parse(item.question.questionImages ?? "[]"),
        answers: JSON.parse(item.question.answers ?? "[]"),
        topics: JSON.parse(item.question.topics ?? "[]"),
      },
    };
  });

  return data;
}

async function fetchBookmarks(userId: string) {
  const db = await getDbAsync();
  const bookmarks = await db.query.userBookmarkList.findMany({
    where: eq(userBookmarkList.userId, userId),
    columns: {
      id: true,
      listName: true,
      visibility: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      userBookmarks: {
        columns: {
          updatedAt: true,
        },
        with: {
          question: {
            columns: {
              id: true,
              paperType: true,
              answers: true,
              questionImages: true,
              season: true,
              year: true,
              topics: true,
            },
          },
        },
      },
    },
  });

  const data: SelectedBookmark[] = bookmarks.map((bookmark) => {
    return {
      ...bookmark,
      userBookmarks: bookmark.userBookmarks.map((userBookmark) => {
        return {
          ...userBookmark,
          question: {
            ...userBookmark.question,
            questionImages: JSON.parse(
              userBookmark.question.questionImages ?? "[]"
            ),
            answers: JSON.parse(userBookmark.question.answers ?? "[]"),
            topics: JSON.parse(userBookmark.question.topics ?? "[]"),
          },
        };
      }),
    };
  });

  return data;
}

async function fetchAnnotations(userId: string) {
  const db = await getDbAsync();
  const annotationsData = await db.query.userAnnotations.findMany({
    where: eq(userAnnotations.userId, userId),
    columns: {
      questionId: true,
      questionXfdf: true,
      answerXfdf: true,
      updatedAt: true,
    },
  });

  const data: SelectedAnnotation[] = annotationsData.map((item) => ({
    questionId: item.questionId,
    questionXfdf: item.questionXfdf ?? "",
    answerXfdf: item.answerXfdf ?? "",
    updatedAt: item.updatedAt,
  }));

  return data;
}
