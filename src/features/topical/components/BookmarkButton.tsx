import { InferSelectModel } from "drizzle-orm";
import { userBookmarks } from "@/drizzle/schema";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Bookmark } from "lucide-react";

export const BookmarkButton = ({
  bookmarks,
  questionId,
  isBookmarksFetching,
  className,
}: {
  bookmarks: InferSelectModel<typeof userBookmarks>[];
  questionId: string;
  isBookmarksFetching: boolean;
  className?: string;
}) => {
  const isBookmarked = useMemo(() => {
    return bookmarks.some((bookmark) => bookmark.questionId === questionId);
  }, [bookmarks, questionId]);
  return (
    <Button
      className={cn(className, isBookmarked && "!bg-logo-main !text-white")}
      disabled={isBookmarksFetching}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      {isBookmarksFetching ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Bookmark size={10} />
      )}
    </Button>
  );
};
