import { InferSelectModel } from "drizzle-orm";
import { userBookmarks } from "@/drizzle/schema";
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
  isBookmarksFetching,
  className,
}: {
  bookmarks: { questionId: string }[];
  questionId: string;
  isBookmarksFetching: boolean;
  className?: string;
}) => {
  const isBookmarked = useMemo(() => {
    return bookmarks.some((bookmark) => bookmark.questionId === questionId);
  }, [bookmarks, questionId]);
  const queryClient = useQueryClient();

  const updateBookmarkMutation = useMutation({
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
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["bookmarks"] });
      const previousBookmarks = queryClient.getQueryData<
        InferSelectModel<typeof userBookmarks>[]
      >(["bookmarks"]);
      await queryClient.setQueryData(
        ["bookmarks"],
        async (old: InferSelectModel<typeof userBookmarks>[] | undefined) => {
          if (!old) {
            return old;
          }
          if (isBookmarked) {
            return old.filter((bookmark) => bookmark.questionId !== questionId);
          } else {
            return [...old, { questionId: questionId }];
          }
        }
      );
      return { previousBookmarks };
    },
    onError: (error, variables, context) => {
      toast.error(error.message);
      queryClient.setQueryData(["bookmarks"], context?.previousBookmarks);
    },
  });

  return (
    <Button
      className={cn(className, isBookmarked && "!bg-logo-main !text-white")}
      disabled={isBookmarksFetching || updateBookmarkMutation.isPending}
      title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
      onClick={() => {
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
