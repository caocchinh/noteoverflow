import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDbAsync } from "@/drizzle/db.server";
import { userBookmarkList, userBookmarks } from "@/drizzle/schema";

export const BookmarkRepo = {
  async findListById(listId: string) {
    const db = await getDbAsync();
    return db.query.userBookmarkList.findFirst({
      where: eq(userBookmarkList.id, listId),
    });
  },

  async findListByUserIdAndName(
    userId: string,
    listName: string,
    visibility: "public" | "private"
  ) {
    const db = await getDbAsync();
    return db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.listName, listName),
          eq(userBookmarkList.visibility, visibility)
        )
      );
  },

  async findListByUserIdAndIdAndName(
    userId: string,
    listId: string,
    listName: string
  ) {
    const db = await getDbAsync();
    return db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.listName, listName)
        )
      );
  },

  async findListByUserIdAndIdAndVisibility(
    userId: string,
    listId: string,
    visibility: "public" | "private"
  ) {
    const db = await getDbAsync();
    return db
      .select()
      .from(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.visibility, visibility)
        )
      );
  },

  async countBookmarksInList(userId: string, listId: string) {
    const db = await getDbAsync();
    const [{ total }] = await db
      .select({ total: sql<number>`count(*)` })
      .from(userBookmarks)
      .where(
        and(eq(userBookmarks.listId, listId), eq(userBookmarks.userId, userId))
      );
    return total;
  },

  async addBookmark(userId: string, listId: string, questionId: string) {
    const db = await getDbAsync();
    return db
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
  },

  async createList(
    userId: string,
    listId: string,
    listName: string,
    visibility: "public" | "private"
  ) {
    const db = await getDbAsync();
    return db
      .insert(userBookmarkList)
      .values({
        id: listId,
        userId,
        listName,
        updatedAt: new Date(),
        visibility,
      })
      .onConflictDoNothing();
  },

  async removeBookmark(userId: string, listId: string, questionId: string) {
    const db = await getDbAsync();
    return db
      .delete(userBookmarks)
      .where(
        and(
          eq(userBookmarks.questionId, questionId),
          eq(userBookmarks.listId, listId),
          eq(userBookmarks.userId, userId)
        )
      );
  },

  async deleteList(userId: string, listId: string) {
    const db = await getDbAsync();
    return db
      .delete(userBookmarkList)
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId)
        )
      );
  },

  async updateListName(userId: string, listId: string, newName: string) {
    const db = await getDbAsync();
    return db
      .update(userBookmarkList)
      .set({ listName: newName })
      .where(
        and(
          eq(userBookmarkList.userId, userId),
          eq(userBookmarkList.id, listId)
        )
      );
  },

  async updateListVisibility(
    userId: string,
    listId: string,
    newVisibility: "public" | "private"
  ) {
    const db = await getDbAsync();
    return db
      .update(userBookmarkList)
      .set({ visibility: newVisibility })
      .where(
        and(
          eq(userBookmarkList.id, listId),
          eq(userBookmarkList.userId, userId)
        )
      );
  },
};
