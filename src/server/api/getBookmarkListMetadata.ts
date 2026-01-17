import "server-only";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db.server";
import { userBookmarks, userBookmarkList, question } from "@/drizzle/schema";
import { HTTP_STATUS, ERROR_CODES, ERROR_MESSAGES } from "@/lib/errors";
import { eq, sql } from "drizzle-orm";
import { status as elysiaStatus } from "elysia";
import type { ValidCurriculum } from "@/constants/types";

export interface BookmarkListMetadataResponse {
  listId: string;
  listName: string;
  visibility: "public" | "private";
  curricula: Record<
    ValidCurriculum,
    {
      subjects: string[];
      count: number;
    }
  >;
  totalCount: number;
}

export const getBookmarkListMetadata = async ({
  params,
  status,
}: {
  params: { listId: string };
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

  const db = await getDbAsync();

  // First, verify the user owns this list or it's public
  const bookmarkList = await db.query.userBookmarkList.findFirst({
    where: eq(userBookmarkList.id, listId),
    columns: {
      id: true,
      listName: true,
      visibility: true,
      userId: true,
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

  // Get aggregated metadata using GROUP BY
  const aggregatedData = await db
    .select({
      curriculumName: question.curriculumName,
      subjectId: question.subjectId,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(userBookmarks)
    .innerJoin(question, eq(userBookmarks.questionId, question.id))
    .where(eq(userBookmarks.listId, listId))
    .groupBy(question.curriculumName, question.subjectId);

  // Transform into nested structure
  const curricula: BookmarkListMetadataResponse["curricula"] =
    {} as BookmarkListMetadataResponse["curricula"];
  let totalCount = 0;

  aggregatedData.forEach((row) => {
    const curriculum = row.curriculumName as ValidCurriculum;
    if (!curricula[curriculum]) {
      curricula[curriculum] = {
        subjects: [],
        count: 0,
      };
    }
    curricula[curriculum].subjects.push(row.subjectId);
    curricula[curriculum].count += row.count;
    totalCount += row.count;
  });

  const response: BookmarkListMetadataResponse = {
    listId: bookmarkList.id,
    listName: bookmarkList.listName,
    visibility: bookmarkList.visibility as "public" | "private",
    curricula,
    totalCount,
  };

  return response;
};
