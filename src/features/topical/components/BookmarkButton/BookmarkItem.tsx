import { Checkbox } from "@/components/ui/checkbox";
import { CommandItem } from "@/components/ui/command";
import { MAXIMUM_BOOKMARKS_PER_LIST } from "@/constants/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Loader2, Lock } from "lucide-react";
import { memo, useCallback } from "react";
import { toast } from "sonner";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { BookmarkItemProps } from "../../types/components";
import { ToggleBookmarkMutationVariables } from "../../types/models";
import {
  handleBookmarkError,
  handleToggleBookmarkOptimisticUpdate,
  toggleBookmarkMutationFn,
} from "../../utils/bookmarkUtils";

export const BookmarkItem = memo(
  ({ listName, visibility, listId, question, chosenBookmarkList }: BookmarkItemProps) => {
    const isMobileDevice = useIsMobile();
    const queryClient = useQueryClient();
    const { bookmarksData } = useTopicalApp();

    const mutationKey = ["user_saved_activities", "bookmarks", question.id, listId, visibility];

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
          },
        );
      },
      onError: (error, variables) => {
        handleBookmarkError(error, variables as ToggleBookmarkMutationVariables, isMobileDevice);
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
          },
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
    }, [bookmarksData, chosenBookmarkList, isMobileDevice, listId, listName, mutate, question]);

    return (
      <CommandItem
        className={cn(
          "flex cursor-pointer items-center justify-between wrap-anywhere",
          isMutatingThisList && "cursor-default opacity-50",
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
        {visibility === "private" ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
      </CommandItem>
    );
  },
);

BookmarkItem.displayName = "BookmarkItem";
