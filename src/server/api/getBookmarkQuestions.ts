import "server-only";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { userBookmarks, userBookmarkList, question } from "@/drizzle/schema";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { eq, and } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import { SelectedQuestion } from "@/features/topical/types/models";

export interface BookmarkQuestionsResponse {
  questions: {
    updatedAt: Date;
    question: SelectedQuestion;
  }[];
}

export const getBookmarkQuestions = async ({
  params,
  query,
  status,
}: {
  params: { listId: string };
  query: {
    curriculum: string;
    subject: string;
  };
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
  const { listId } = params;
  const { curriculum, subject } = query;

  const db = await getDbAsync();

  // Verify the user owns this list or it's public
  const bookmarkList = await db.query.userBookmarkList.findFirst({
    where: eq(userBookmarkList.id, listId),
    columns: {
      id: true,
      userId: true,
      visibility: true,
    },
  });

  if (!bookmarkList) {
    return status(HTTP_STATUS.NOT_FOUND, {
      error: "Bookmark list not found",
      code: ERROR_CODES.NOT_FOUND,
    });
  }

  // Check access: user owns it OR it's public
  if (bookmarkList.userId !== userId && bookmarkList.visibility !== "public") {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.FORBIDDEN],
      code: ERROR_CODES.FORBIDDEN,
    });
  }

  // Fetch all questions for the curriculum/subject
  const bookmarksData = await db
    .select({
      updatedAt: userBookmarks.updatedAt,
      id: question.id,
      year: question.year,
      season: question.season,
      paperType: question.paperType,
      questionImages: question.questionImages,
      answers: question.answers,
      topics: question.topics,
      questionImagesDimensions: question.questionImagesDimensions,
      answersImagesDimensions: question.answersImagesDimensions,
    })
    .from(userBookmarks)
    .innerJoin(question, eq(userBookmarks.questionId, question.id))
    .where(
      and(
        eq(userBookmarks.listId, listId),
        eq(question.curriculumName, curriculum),
        eq(question.subjectId, subject),
      ),
    )
    .orderBy(userBookmarks.updatedAt);

  // Transform to expected format
  const questions = bookmarksData.map((row) => ({
    updatedAt: row.updatedAt,
    question: {
      id: row.id,
      year: row.year,
      season: row.season,
      paperType: row.paperType,
      questionImages: JSON.parse(row.questionImages ?? "[]"),
      answers: JSON.parse(row.answers ?? "[]"),
      topics: JSON.parse(row.topics ?? "[]"),
      questionImagesDimensions: JSON.parse(
        row.questionImagesDimensions ?? "[]",
      ),
      answersImagesDimensions: JSON.parse(row.answersImagesDimensions ?? "[]"),
    } as SelectedQuestion,
  }));

  const response: BookmarkQuestionsResponse = {
    questions,
  };

  return response;
};
