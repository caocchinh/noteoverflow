import { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { userBookmarkList, userBookmarks } from "@/drizzle/schema";
import { SelectedPublickBookmark } from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookmarkId: string }> }
) {
  try {
    const { bookmarkId } = await params;
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
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
      return NextResponse.json(
        { error: "Bookmark list not found" },
        { status: 404 }
      );
    }

    // Check permissions - only owner can access private lists
    if (
      bookmarkList.visibility === "private" &&
      session.user.id !== bookmarkList.userId
    ) {
      return NextResponse.json(
        { error: "This list is private" },
        { status: 403 }
      );
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

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching bookmark:", error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
