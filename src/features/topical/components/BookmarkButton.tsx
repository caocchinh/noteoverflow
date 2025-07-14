import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { Bookmark } from "lucide-react";
import { removeBookmarkAction } from "../server/actions";
import { addBookmarkAction } from "../server/actions";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SelectedBookmark } from "../constants/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export const BookmarkButton = ({
  bookmarks,
  questionId,
  isBookmarkDisabled,
  isBookmarksFetching,
  isBookmarkError,
  className,
  isValidSession,
}: {
  bookmarks: SelectedBookmark;
  questionId: string;
  isBookmarkDisabled: boolean;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  className?: string;
  isValidSession: boolean;
}) => {
  // const isBookmarked = useMemo(() => {
  //   return bookmarks?.has(questionId);
  // }, [bookmarks, questionId]);
  // const queryClient = useQueryClient();

  // const mutationKey = ["all_user_bookmarks", questionId];

  // const updateBookmarkMutation = useMutation({
  //   mutationKey: mutationKey,
  //   mutationFn: async ({
  //     realQuestionId,
  //     isRealBookmarked,
  //   }: {
  //     realQuestionId: string;
  //     isRealBookmarked: boolean;
  //   }) => {
  //     if (isRealBookmarked) {
  //       return removeBookmarkAction({
  //         questionId: realQuestionId,
  //       });
  //     } else {
  //       return addBookmarkAction({
  //         questionId: realQuestionId,
  //       });
  //     }
  //   },
  //   onSuccess: (
  //     _data,
  //     {
  //       realQuestionId,
  //       isRealBookmarked,
  //     }: { realQuestionId: string; isRealBookmarked: boolean }
  //   ) => {
  //     queryClient.setQueryData<SelectedBookmark>(
  //       ["all_user_bookmarks"],
  //       (prev) => {
  //         const next = new Set(prev?.userBookmarks ?? []);
  //         if (isRealBookmarked) {
  //           next.delete(realQuestionId);
  //         } else {
  //           next.add(realQuestionId);
  //         }
  //         return next;
  //       }
  //     );

  //     toast.success(
  //       isRealBookmarked
  //         ? "Question removed from bookmarks."
  //         : "Question added to bookmarks.",
  //       {
  //         duration: 2000,
  //       }
  //     );
  //   },
  //   onError: (error) => {
  //     toast.error(
  //       "Failed to update bookmarks: " +
  //         (error instanceof Error ? error.message : "Unknown error")
  //     );
  //   },
  // });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(className, "rounded-[3px]")}
          onClick={(e) => {
            e.stopPropagation();
            // e.preventDefault();
          }}
          // className={cn(
          //   className,
          //   "rounded-[3px]",
          //   isBookmarked && "!bg-logo-main !text-white "
          // )}
          // disabled={isBookmarkDisabled || isBookmarksFetching}
          // title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          // onClick={(e) => {
          //   e.stopPropagation();
          //   e.preventDefault();
          //   if (isBookmarkError) {
          //     toast.error("Bookmark error. Please refresh the page.");
          //     return;
          //   }
          //   if (!isValidSession) {
          //     toast.error("Please sign in to bookmark questions.");
          //     return;
          //   }
          //   updateBookmarkMutation.mutate({
          //     realQuestionId: questionId,
          //     isRealBookmarked: isBookmarked ?? false,
          //   });
          // }}
          // onTouchStart={(e) => {
          //   e.stopPropagation();
          //   e.preventDefault();
          // }}
        >
          {isBookmarksFetching ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Bookmark size={10} />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Search bookmark lists" />
          <CommandEmpty>No lists found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {bookmarks.length > 0 && (
                <>
                  {bookmarks.map((bookmark) => (
                    <CommandItem
                      key={bookmark.listName}
                      className="cursor-pointer"
                      onClick={(e) => {}}
                    >
                      {bookmark.listName}
                    </CommandItem>
                  ))}
                </>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
