import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMutating } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { memo } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { BookmarkTriggerProps } from "../../types/components";

export const BookmarkTrigger = memo(
  ({
    question,
    isBookmarkDisabled,
    badgeClassName,
    triggerButtonClassName,
    onClick,
  }: BookmarkTriggerProps) => {
    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: ["user_saved_activities", "bookmarks", question.id],
      }) > 0;

    const { savedActivitiesIsFetching, bookmarksData } = useTopicalApp();
    const isBookmarked = bookmarksData?.some((bookmark) =>
      bookmark.userBookmarks.some((b) => b.question.id === question.id),
    );

    if (isMutatingThisQuestion) {
      return (
        <Badge
          className={cn(
            "flex min-h-[28px] w-max! cursor-pointer items-center justify-center rounded-[3px] bg-black text-[10px] text-white",
            badgeClassName,
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
          (isBookmarkDisabled || savedActivitiesIsFetching) && "opacity-50",
        )}
        tabIndex={-1}
        title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        onClick={onClick}
      >
        {savedActivitiesIsFetching ? <Loader2 className="animate-spin" /> : <Bookmark size={10} />}
      </Button>
    );
  },
);

BookmarkTrigger.displayName = "BookmarkTrigger";
