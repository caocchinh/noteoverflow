import {
  BAD_REQUEST,
  DOES_NOT_EXIST,
  INTERNAL_SERVER_ERROR,
  LIMIT_EXCEEDED,
  MAXIMUM_BOOKMARK_LISTS_PER_USER,
  MAXIMUM_BOOKMARKS_PER_LIST,
  UNAUTHORIZED,
} from "@/constants/constants";
import { LIST_NAME_MAX_LENGTH } from "../constants/constants";
import { BookmarkRepo } from "../dal/bookmark.repo";

export const BookmarkService = {
  async addBookmark(userId: string, listId: string, questionId: string) {
    const list = await BookmarkRepo.findListById(listId);
    
    if (!list) {
      return { error: DOES_NOT_EXIST, success: false };
    }

    if (list.userId !== userId) {
      return { error: UNAUTHORIZED, success: false };
    }

    const totalBookmarks = await BookmarkRepo.countBookmarksInList(userId, listId);

    if (totalBookmarks >= MAXIMUM_BOOKMARKS_PER_LIST) {
      return { error: LIMIT_EXCEEDED, success: false };
    }

    try {
      await BookmarkRepo.addBookmark(userId, listId, questionId);
      return { success: true };
    } catch (e) {
      if (e instanceof Error && /FOREIGN KEY constraint failed/i.test(e.cause as string)) {
        return { error: DOES_NOT_EXIST, success: false };
      }
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async createListAndAddBookmark(
    userId: string,
    listName: string,
    visibility: "public" | "private",
    questionId: string
  ) {
    if (listName.trim() === "" || listName.length > LIST_NAME_MAX_LENGTH) {
      return { error: BAD_REQUEST, success: false };
    }

    try {
      const existingList = await BookmarkRepo.findListByUserIdAndName(userId, listName, visibility);

      if (existingList.length >= MAXIMUM_BOOKMARK_LISTS_PER_USER) {
        return { error: LIMIT_EXCEEDED, success: false };
      }

      if (existingList.length === 0) {
        const newListId = crypto.randomUUID();
        await BookmarkRepo.createList(userId, newListId, listName, visibility);
        await BookmarkRepo.addBookmark(userId, newListId, questionId);
        return { success: true, data: newListId };
      } else {
        const result = await this.addBookmark(userId, existingList[0].id, questionId);
        if (result.error) {
          return { error: result.error, success: false };
        }
        return { success: true, data: existingList[0].id };
      }
    } catch (error) {
      console.error(error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async removeBookmark(userId: string, listId: string, questionId: string) {
    try {
      await BookmarkRepo.removeBookmark(userId, listId, questionId);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async deleteList(userId: string, listId: string) {
    try {
      await BookmarkRepo.deleteList(userId, listId);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async renameList(userId: string, listId: string, newName: string) {
    if (newName.trim() === "" || newName.length > LIST_NAME_MAX_LENGTH) {
      return { error: BAD_REQUEST, success: false };
    }

    try {
      const existingList = await BookmarkRepo.findListByUserIdAndIdAndName(userId, listId, newName);
      if (existingList.length > 0) {
        return { error: BAD_REQUEST, success: false };
      }

      await BookmarkRepo.updateListName(userId, listId, newName);
      return { success: true };
    } catch (e) {
      if (e instanceof Error && /FOREIGN KEY constraint failed/i.test(e.message)) {
        return { error: DOES_NOT_EXIST, success: false };
      }
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },

  async changeListVisibility(userId: string, listId: string, newVisibility: "public" | "private") {
    try {
      const existingList = await BookmarkRepo.findListByUserIdAndIdAndVisibility(userId, listId, newVisibility);
      if (existingList.length > 0) {
        return { error: BAD_REQUEST, success: false };
      }

      await BookmarkRepo.updateListVisibility(userId, listId, newVisibility);
      return { success: true };
    } catch (e) {
      if (e instanceof Error && /FOREIGN KEY constraint failed/i.test(e.message)) {
        return { error: DOES_NOT_EXIST, success: false };
      }
      return { error: INTERNAL_SERVER_ERROR, success: false };
    }
  },
};
