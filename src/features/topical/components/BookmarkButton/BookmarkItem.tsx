import { memo, useCallback } from "react";
import { CommandItem } from "@/components/ui/command";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BookmarkItemProps,
  ToggleBookmarkMutationVariables,
} from "../../constants/types";
import {
  useIsMutating,
  useMutation,
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
  ({
    listName,
    visibility,
    listId,
    question,
    chosenBookmarkList,
  }: BookmarkItemProps) => {
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

    const isMutatingThisList =
      useIsMutating({
        mutationKey,
      }) > 0;

    const { mutate } = useMutation({
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
          isMutatingThisList && "opacity-50 cursor-default"
        )}
        onSelect={() => {
          if (isMutatingThisList) {
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
          <span className="hidden">{visibility}</span>
          {isMutatingThisList && <Loader2 className="animate-spin" />}
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
