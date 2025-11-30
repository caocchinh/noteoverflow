import "server-only";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { userBookmarkList, userBookmarks } from "@/drizzle/schema";
import { SelectedPublickBookmark } from "@/features/topical/constants/types";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { eq } from "drizzle-orm";

export const getBookmarkById = async ({
  params,
  status,
}: {
  params: { bookmarkId: string };
  status: (code: number, body: { error: string; code: string }) => void;
}) => {
  const { bookmarkId } = params;
  const session = await verifySession();

  if (!session) {
    return status(HTTP_STATUS.UNAUTHORIZED, {
      error: ERROR_MESSAGES[ERROR_CODES.UNAUTHORIZED],
      code: ERROR_CODES.UNAUTHORIZED,
    });
  }

  const db = await getDbAsync();

  // Check if the bookmark list exists and is accessible
  const bookmarkList = await db.query.userBookmarkList.findFirst({
    where: eq(userBookmarkList.id, bookmarkId),
    columns: {
      visibility: true,
      userId: true,
    },
  });

  if (!bookmarkList) {
    return status(HTTP_STATUS.NOT_FOUND, {
      error: ERROR_MESSAGES[ERROR_CODES.BOOKMARK_LIST_NOT_FOUND],
      code: ERROR_CODES.NOT_FOUND,
    });
  }

  // Check permissions - only owner can access private lists
  if (
    bookmarkList.visibility === "private" &&
    session.user.id !== bookmarkList.userId
  ) {
    return status(HTTP_STATUS.FORBIDDEN, {
      error: ERROR_MESSAGES[ERROR_CODES.PRIVATE_LIST],
      code: ERROR_CODES.PRIVATE_LIST,
    });
  }

  // Fetch bookmark questions
  const selectedBookmarkQuestions = await db.query.userBookmarks.findMany({
    where: eq(userBookmarks.listId, bookmarkId),
    columns: { updatedAt: true },
    with: {
      question: {
        columns: {
          id: true,
          year: true,
          season: true,
          paperType: true,
          paperVariant: true,
          answers: true,
          questionImages: true,
          topics: true,
        },
      },
    },
  });

  const data: SelectedPublickBookmark[] = selectedBookmarkQuestions.map(
    (item) => {
      return {
        updatedAt: item.updatedAt,
        questionId: item.question.id,
        question: {
          ...item.question,
          questionImages: JSON.parse(item.question.questionImages ?? "[]"),
          answers: JSON.parse(item.question.answers ?? "[]"),
          topics: JSON.parse(item.question.topics ?? "[]"),
        },
      };
    }
  );

  return data;
};
