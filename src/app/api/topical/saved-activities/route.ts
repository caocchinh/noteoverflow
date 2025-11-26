import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import {
  finishedQuestions,
  userBookmarkList,
  userAnnotations,
} from "@/drizzle/schema";
import {
  SelectedBookmark,
  SelectedFinishedQuestion,
  SelectedAnnotation,
  SavedActivitiesResponse,
} from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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
    questionXfdf: item.questionXfdf,
    answerXfdf: item.answerXfdf,
    updatedAt: item.updatedAt,
  }));

  return data;
}

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
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

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
