import { UNAUTHORIZED, INTERNAL_SERVER_ERROR } from "@/constants/constants";
import { verifySession } from "@/dal/verifySession";
import { getDbAsync } from "@/drizzle/db";
import { userBookmarkList } from "@/drizzle/schema";
import { SelectedBookmark } from "@/features/topical/constants/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    const userId = session.user.id;
    const db = await getDbAsync();
    const bookmarks = await db.query.userBookmarkList.findMany({
      where: eq(userBookmarkList.userId, userId),
      columns: {
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
              },
              with: {
                questionTopics: {
                  columns: {
                    topic: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const data: SelectedBookmark = bookmarks.map((bookmark) => {
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
            },
          };
        }),
      };
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
