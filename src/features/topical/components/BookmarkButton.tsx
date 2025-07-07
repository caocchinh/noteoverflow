import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Bookmark } from "lucide-react";
import { removeBookmarkAction } from "../server/actions";
import { addBookmarkAction } from "../server/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const BookmarkButton = ({
  bookmarks,
  questionId,
  disabled,
  isBookmarksFetching,
  className,
  isValidSession,
}: {
  bookmarks: Set<string> | null;
  questionId: string;
  disabled: boolean;
  isBookmarksFetching: boolean;
  className?: string;
  isValidSession: boolean;
}) => {
  const isBookmarked = useMemo(() => {
    return bookmarks?.has(questionId);
  }, [bookmarks, questionId]);
  const queryClient = useQueryClient();

  const mutationKey = ["user_bookmarks", questionId];

  const updateBookmarkMutation = useMutation({
    mutationKey: mutationKey,
    mutationFn: async () => {
      if (isBookmarked) {
        return removeBookmarkAction({
          questionId,
        });
      } else {
        return addBookmarkAction({
          questionId,
        });
      }
    },
    onSuccess: () => {
      const old: { sucess: boolean; data: Set<string> } | undefined =
        queryClient.getQueryData<Set<string>>(["user_bookmarks"]) as
          | { sucess: boolean; data: Set<string> }
          | undefined;
      if (!old?.data) {
        return;
      }
      const newBookmarks = isBookmarked
        ? new Set(
            Array.from(old.data).filter((bookmark) => bookmark !== questionId)
          )
        : new Set([...Array.from(old.data), questionId]);
      queryClient.setQueryData(["user_bookmarks"], {
        sucess: true,
        data: newBookmarks,
      });
      toast.success(
        isBookmarked
          ? "Question removed from bookmark"
          : "Question added to bookmark",
        {
          duration: 2000,
        }
      );
    },
    onError: (error) => {
      toast.error(
        "Failed to update bookmarks: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    },
  });

  return (
    <Button
      className={cn(className, isBookmarked && "!bg-logo-main !text-white")}
      disabled={disabled || isBookmarksFetching}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      onClick={() => {
        if (!isValidSession) {
          toast.error("Please sign in to bookmark questions");
          return;
        }
        updateBookmarkMutation.mutate();
      }}
    >
      {isBookmarksFetching ? (
        <Loader2 className="animate-spin" />
      ) : (
        <Bookmark size={10} />
      )}
    </Button>
  );
};
