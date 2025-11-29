import {
  SavedActivitiesResponse,
  SelectedQuestion,
} from "@/features/topical/constants/types";
import {
  addBookmarkAction,
  createBookmarkListAndAddBookmarkAction,
  removeBookmarkAction,
} from "@/features/topical/server/actions";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  DOES_NOT_EXIST,
  LIMIT_EXCEEDED,
  MAXIMUM_BOOKMARK_LISTS_PER_USER,
  MAXIMUM_BOOKMARKS_PER_LIST,
} from "@/constants/constants";

export interface CreateListMutationVariables {
  question: SelectedQuestion;
  bookmarkListName: string;
  visibility: "public" | "private";
}

export interface ToggleBookmarkMutationVariables {
  question: SelectedQuestion;
  listId: string;
  isBookmarked: boolean;
  bookmarkListName: string;
}

export const createListMutationFn = async ({
  question,
  bookmarkListName,
  visibility,
}: CreateListMutationVariables) => {
  const result = await createBookmarkListAndAddBookmarkAction({
    listName: bookmarkListName,
    visibility,
    questionId: question.id,
  });
  if (!result.success) {
    throw new Error(result.error + "list");
  }
  return {
    question,
    bookmarkListName,
    listId: result.data as string,
    visibility,
  };
};

export const toggleBookmarkMutationFn = async ({
  question,
  listId,
  isBookmarked,
  bookmarkListName,
}: ToggleBookmarkMutationVariables) => {
  if (isBookmarked) {
    const result = await removeBookmarkAction({
      questionId: question.id,
      listId,
    });
    if (result.error) {
      throw new Error(result.error);
    }
    return {
      question,
      listId,
      isBookmarked: true,
      bookmarkListName,
    };
  } else {
    const result = await addBookmarkAction({
      questionId: question.id,
      listId,
    });
    if (result.error) {
      throw new Error(result.error + "bookmark");
    }
    return {
      question,
      listId,
      isBookmarked: false,
      bookmarkListName,
    };
  }
};

export const handleCreateListOptimisticUpdate = (
  queryClient: QueryClient,
  data: {
    question: SelectedQuestion;
    bookmarkListName: string;
    listId: string;
    visibility: "public" | "private";
  },
  callbacks?: {
    onSuccess?: () => void;
    addChosenBookmarkList?: (listId: string) => void;
  }
) => {
  const { question, listId, bookmarkListName, visibility } = data;

  queryClient.setQueryData<SavedActivitiesResponse>(
    ["user_saved_activities"],
    (prev: SavedActivitiesResponse | undefined) => {
      if (!prev) {
        return prev;
      }

      const updatedBookmarks = prev.bookmarks ?? [];
      const isListAlreadyExist = updatedBookmarks.some(
        (bookmark) => bookmark.id === listId
      );

      callbacks?.onSuccess?.();

      if (isListAlreadyExist) {
        // Add bookmark to existing list (shouldn't happen for create new, but safe fallback)
        callbacks?.addChosenBookmarkList?.(listId);
        const existingBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === listId
        );
        if (existingBookmark) {
          existingBookmark.userBookmarks.push({
            question: {
              year: question.year,
              season: question.season,
              paperType: question.paperType,
              questionImages: question.questionImages,
              answers: question.answers,
              topics: question.topics,
              id: question.id,
            },
            updatedAt: new Date(),
          });
        }
      } else {
        // Create new list and add bookmark
        callbacks?.addChosenBookmarkList?.(listId);
        updatedBookmarks.push({
          id: listId,
          createdAt: new Date(),
          updatedAt: new Date(),
          listName: bookmarkListName,
          visibility,
          userBookmarks: [
            {
              question: {
                year: question.year,
                season: question.season,
                paperType: question.paperType,
                questionImages: question.questionImages,
                answers: question.answers,
                topics: question.topics,
                id: question.id,
              },
              updatedAt: new Date(),
            },
          ],
        });
      }

      return {
        ...prev,
        bookmarks: updatedBookmarks,
      };
    }
  );
};

export const handleToggleBookmarkOptimisticUpdate = (
  queryClient: QueryClient,
  data: {
    question: SelectedQuestion;
    listId: string;
    isBookmarked: boolean;
  },
  callbacks?: {
    addChosenBookmarkList?: (listId: string) => void;
    removeChosenBookmarkList?: (listId: string) => void;
  }
) => {
  const { question, listId, isBookmarked } = data;

  queryClient.setQueryData<SavedActivitiesResponse>(
    ["user_saved_activities"],
    (prev: SavedActivitiesResponse | undefined) => {
      if (!prev) {
        return prev;
      }

      const updatedBookmarks = prev.bookmarks ?? [];

      if (!isBookmarked) {
        // Add bookmark to existing list
        callbacks?.addChosenBookmarkList?.(listId);
        const existingBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === listId
        );
        if (existingBookmark) {
          existingBookmark.userBookmarks.push({
            question: {
              year: question.year,
              season: question.season,
              paperType: question.paperType,
              questionImages: question.questionImages,
              answers: question.answers,
              topics: question.topics,
              id: question.id,
            },
            updatedAt: new Date(),
          });
        }
      } else {
        // Remove bookmark from list
        callbacks?.removeChosenBookmarkList?.(listId);
        const existingBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === listId
        );
        if (existingBookmark) {
          existingBookmark.userBookmarks =
            existingBookmark.userBookmarks.filter(
              (userBookmark) => userBookmark.question.id !== question.id
            );
        }
      }

      return {
        ...prev,
        bookmarks: updatedBookmarks,
      };
    }
  );
};

export const handleBookmarkError = (
  error: unknown,
  variables: CreateListMutationVariables | ToggleBookmarkMutationVariables,
  isMobileDevice: boolean
) => {
  if (error instanceof Error) {
    if (error.message.includes(LIMIT_EXCEEDED)) {
      if (error.message.includes("list")) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARK_LISTS_PER_USER +
            " bookmark lists.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      } else if (error.message.includes("bookmark")) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARKS_PER_LIST +
            " bookmarks per list.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      }
    } else if (error.message.includes(DOES_NOT_EXIST)) {
      toast.error(
        `Failed to update bookmarks. The list ${variables.bookmarkListName} does not exist.`,
        {
          duration: 2000,
          position: isMobileDevice ? "top-center" : "bottom-right",
        }
      );
    } else {
      toast.error("Failed to update bookmarks: " + error.message, {
        duration: 2000,
        position: isMobileDevice ? "top-center" : "bottom-right",
      });
    }
  } else {
    toast.error("Failed to update bookmarks: Unknown error", {
      duration: 2000,
      position: isMobileDevice ? "top-center" : "bottom-right",
    });
  }
};
