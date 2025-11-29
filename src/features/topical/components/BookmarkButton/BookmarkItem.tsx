import { memo, useCallback, useMemo } from "react";
import { CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BookmarkItemProps,
  ToggleBookmarkMutationVariables,
} from "../../constants/types";
import {
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  handleBookmarkError,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
} from "../../utils/bookmarkUtils";
import { MAXIMUM_BOOKMARKS_PER_LIST } from "@/constants/constants";
import { toast } from "sonner";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";

export const BookmarkItem = memo(
  ({ listName, visibility, listId, question }: BookmarkItemProps) => {
    const isMobileDevice = useIsMobile();
    const queryClient = useQueryClient();
    const { bookmarksData } = useTopicalApp();

    const mutationKey = [
      "user_saved_activities",
      "bookmarks",
      question.id,
      listId,
      visibility,
    ];

    const { mutate, isPending } = useMutation({
      mutationKey: mutationKey,
      mutationFn: toggleBookmarkMutationFn,
      onSuccess: (data) => {
        const { isBookmarked, bookmarkListName: newBookmarkListName } = data;

        handleToggleBookmarkOptimisticUpdate(queryClient, data);

        toast.success(
          isBookmarked
            ? `Question removed from ${newBookmarkListName}`
            : `Question added to ${newBookmarkListName}`,
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
      },
      onError: (error, variables) => {
        handleBookmarkError(
          error,
          variables as ToggleBookmarkMutationVariables,
          isMobileDevice
        );
      },
    });

    const isThisBookmarkSettled = useMutationState({
      filters: {
        mutationKey,
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    const chosenBookmarkList = useMemo(() => {
      const set = new Set<string>();
      for (const bookmark of bookmarksData ?? []) {
        if (bookmark.userBookmarks.some((b) => b.question.id === question.id)) {
          set.add(bookmark.id);
        }
      }
      return set;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bookmarksData, question.id, isThisBookmarkSettled]);

    const onListSelect = useCallback(() => {
      if (listName.trim() === "") {
        toast.error("Failed to update bookmarks: Bad Request.");
        return;
      }
      if (bookmarksData && bookmarksData.length >= MAXIMUM_BOOKMARKS_PER_LIST) {
        toast.error(
          "Failed to update bookmarks. You can only have maximum of " +
            MAXIMUM_BOOKMARKS_PER_LIST +
            " bookmarks per list.",
          {
            duration: 2000,
            position: isMobileDevice ? "top-center" : "bottom-right",
          }
        );
        return;
      }

      setTimeout(() => {
        mutate({
          question,
          listId: listId,
          bookmarkListName: listName,
          isBookmarked: chosenBookmarkList.has(listId),
        });
      }, 0);
    }, [
      bookmarksData,
      chosenBookmarkList,
      isMobileDevice,
      listId,
      listName,
      mutate,
      question,
    ]);

    return (
      <CommandItem
        className={cn(
          "cursor-pointer wrap-anywhere flex items-center justify-between",
          isPending && "opacity-50 cursor-default"
        )}
        onSelect={() => {
          if (isPending) {
            return;
          }
          onListSelect();
        }}
      >
        <div className="flex items-center justify-start gap-2">
          <Checkbox
            checked={chosenBookmarkList.has(listId)}
            className="data-[state=checked]:bg-logo-main!"
          />
          {listName}
          {isPending && <Loader2 className="animate-spin" />}
        </div>
        {visibility === "private" ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
      </CommandItem>
    );
  }
);

BookmarkItem.displayName = "BookmarkItem";
