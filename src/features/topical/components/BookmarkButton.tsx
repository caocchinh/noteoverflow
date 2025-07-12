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
  isBookmarkDisabled,
  isBookmarksFetching,
  isBookmarkError,
  className,
  isValidSession,
}: {
  bookmarks: Set<string> | null;
  questionId: string;
  isBookmarkDisabled: boolean;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
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
    mutationFn: async ({
      realQuestionId,
      isRealBookmarked,
    }: {
      realQuestionId: string;
      isRealBookmarked: boolean;
    }) => {
      if (isRealBookmarked) {
        return removeBookmarkAction({
          questionId: realQuestionId,
        });
      } else {
        return addBookmarkAction({
          questionId: realQuestionId,
        });
      }
    },
    onSuccess: (
      _data,
      {
        realQuestionId,
        isRealBookmarked,
      }: { realQuestionId: string; isRealBookmarked: boolean }
    ) => {
      const old = queryClient.getQueryData<Set<string>>(["user_bookmarks"]);
      if (!old) {
        return;
      }
      if (isRealBookmarked) {
        old.delete(realQuestionId);
      } else {
        old.add(realQuestionId);
      }

      toast.success(
        isRealBookmarked
          ? "Question removed from bookmarks."
          : "Question added to bookmarks.",
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
      disabled={isBookmarkDisabled || isBookmarksFetching}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (isBookmarkError) {
          toast.error("Bookmark error. Please refresh the page.");
          return;
        }
        if (!isValidSession) {
          toast.error("Please sign in to bookmark questions.");
          return;
        }
        updateBookmarkMutation.mutate({
          realQuestionId: questionId,
          isRealBookmarked: isBookmarked ?? false,
        });
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
        e.preventDefault();
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
