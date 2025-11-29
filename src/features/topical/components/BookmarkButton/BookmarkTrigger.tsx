import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { BookmarkTriggerProps } from "../../constants/types";

export const BookmarkTrigger = memo(
  ({
    question,
    isBookmarkDisabled,
    badgeClassName,
    triggerButtonClassName,
  }: BookmarkTriggerProps) => {
    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: ["user_saved_activities", "bookmarks", question.id],
      }) > 0;

    const { savedActivitiesIsFetching, bookmarksData } = useTopicalApp();
    const isBookmarked = bookmarksData?.some((bookmark) =>
      bookmark.userBookmarks.some((b) => b.question.id === question.id)
    );

    if (isMutatingThisQuestion) {
      return (
        <Badge
          className={cn(
            "text-white text-[10px] w-max! flex items-center justify-center cursor-pointer bg-black rounded-[3px] min-h-[28px]",
            badgeClassName
          )}
        >
          Saving
          <Loader2 className="animate-spin" />
        </Badge>
      );
    }

    return (
      <Button
        className={cn(
          triggerButtonClassName,
          "rounded-[3px]",
          isBookmarked && "bg-logo-main! text-white!",
          (isBookmarkDisabled || savedActivitiesIsFetching) && "opacity-50"
        )}
        tabIndex={-1}
        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      >
        {savedActivitiesIsFetching ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Bookmark size={10} />
        )}
      </Button>
    );
  }
);

BookmarkTrigger.displayName = "BookmarkTrigger";
