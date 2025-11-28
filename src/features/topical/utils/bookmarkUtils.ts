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

export interface BookmarkMutationVariables {
  realQuestion: SelectedQuestion;
  isRealBookmarked: boolean;
  realBookmarkListName: string;
  realVisibility: "public" | "private";
  realListId: string;
  isCreateNew: boolean;
}

export const bookmarkMutationFn = async ({
  realQuestion,
  realBookmarkListName,
  isRealBookmarked,
  realVisibility,
  realListId,
  isCreateNew,
}: BookmarkMutationVariables) => {
  if (isCreateNew) {
    const result = await createBookmarkListAndAddBookmarkAction({
      listName: realBookmarkListName,
      visibility: realVisibility,
      questionId: realQuestion.id,
    });
    if (!result.success) {
      throw new Error(result.error + "list");
    }
    return {
      realQuestion,
      realBookmarkListName,
      isRealBookmarked: false,
      realListId: result.data as string,
      isCreateNew: true,
      realVisibility,
    };
  }
  if (isRealBookmarked) {
    const result = await removeBookmarkAction({
      questionId: realQuestion.id,
      listId: realListId,
    });
    if (result.error) {
      throw new Error(result.error);
    }
    return {
      realQuestion,
      realListId,
      realBookmarkListName,
      isRealBookmarked: true,
      isCreateNew,
      realVisibility,
    };
  } else {
    const result = await addBookmarkAction({
      questionId: realQuestion.id,
      listId: realListId,
    });
    if (result.error) {
      throw new Error(result.error + "bookmark");
    }
    return {
      realQuestion,
      realBookmarkListName,
      realListId,
      isRealBookmarked: false,
      isCreateNew,
      realVisibility,
    };
  }
};

export const handleBookmarkOptimisticUpdate = (
  queryClient: QueryClient,
  data: BookmarkMutationVariables,
  callbacks?: {
    onSuccess?: () => void;
    addChosenBookmarkList?: (listId: string) => void;
    removeChosenBookmarkList?: (listId: string) => void;
  }
) => {
  const {
    realQuestion: newQuestion,
    isRealBookmarked,
    realListId,
    realBookmarkListName: newBookmarkListName,
    isCreateNew,
    realVisibility,
  } = data;

  queryClient.setQueryData<SavedActivitiesResponse>(
    ["user_saved_activities"],
    (prev: SavedActivitiesResponse | undefined) => {
      if (!prev) {
        return prev;
      }

      const updatedBookmarks = prev.bookmarks ?? [];

      if (isCreateNew) {
        const isListAlreadyExist = updatedBookmarks.some(
          (bookmark) => bookmark.id === realListId
        );

        callbacks?.onSuccess?.();

        if (isListAlreadyExist) {
          // Add bookmark to existing list
          callbacks?.addChosenBookmarkList?.(realListId);
          const existingBookmark = updatedBookmarks.find(
            (bookmark) => bookmark.id === realListId
          );
          if (existingBookmark) {
            existingBookmark.userBookmarks.push({
              question: {
                year: newQuestion.year,
                season: newQuestion.season,
                paperType: newQuestion.paperType,
                questionImages: newQuestion.questionImages,
                answers: newQuestion.answers,
                topics: newQuestion.topics,
                id: newQuestion.id,
              },
              updatedAt: new Date(),
            });
          }
        } else {
          // Create new list and add bookmark
          callbacks?.addChosenBookmarkList?.(realListId);
          updatedBookmarks.push({
            id: realListId,
            createdAt: new Date(),
            updatedAt: new Date(),
            listName: newBookmarkListName,
            visibility: realVisibility as "public" | "private",

            userBookmarks: [
              {
                question: {
                  year: newQuestion.year,
                  season: newQuestion.season,
                  paperType: newQuestion.paperType,
                  questionImages: newQuestion.questionImages,
                  answers: newQuestion.answers,
                  topics: newQuestion.topics,
                  id: newQuestion.id,
                },
                updatedAt: new Date(),
              },
            ],
          });
        }
      } else if (!isCreateNew && !isRealBookmarked) {
        // Add bookmark to existing list
        callbacks?.addChosenBookmarkList?.(realListId);
        const existingBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === realListId
        );
        if (existingBookmark) {
          existingBookmark.userBookmarks.push({
            question: {
              year: newQuestion.year,
              season: newQuestion.season,
              paperType: newQuestion.paperType,
              questionImages: newQuestion.questionImages,
              answers: newQuestion.answers,
              topics: newQuestion.topics,
              id: newQuestion.id,
            },
            updatedAt: new Date(),
          });
        }
      } else if (!isCreateNew && isRealBookmarked) {
        // Remove bookmark from list
        callbacks?.removeChosenBookmarkList?.(realListId);
        const existingBookmark = updatedBookmarks.find(
          (bookmark) => bookmark.id === realListId
        );
        if (existingBookmark) {
          existingBookmark.userBookmarks =
            existingBookmark.userBookmarks.filter(
              (userBookmark) => userBookmark.question.id !== newQuestion.id
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
  variables: BookmarkMutationVariables,
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
        `Failed to update bookmarks. The list ${variables.realBookmarkListName} does not exist.`,
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
