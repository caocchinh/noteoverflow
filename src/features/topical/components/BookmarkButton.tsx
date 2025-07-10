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
  className,
  isValidSession,
}: {
  bookmarks: Set<string> | null;
  questionId: string;
  isBookmarkDisabled: boolean;
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
      if (isBookmarked) {
        old.data.delete(questionId);
      } else {
        old.data.add(questionId);
      }

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
      disabled={isBookmarkDisabled || isBookmarksFetching}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
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
