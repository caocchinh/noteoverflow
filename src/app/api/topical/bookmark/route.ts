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
    // @ts-expect-error visibility is always a string and is always "private" or "public"
    const bookmarks: SelectedBookmark =
      await db.query.userBookmarkList.findMany({
        where: eq(userBookmarkList.userId, userId),
        with: {
          userBookmarks: true,
        },
      });
    return NextResponse.json({ data: bookmarks }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === UNAUTHORIZED) {
      return NextResponse.json({ error: UNAUTHORIZED }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json({ error: INTERNAL_SERVER_ERROR }, { status: 500 });
  }
}
