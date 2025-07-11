"use client";

import { useIsMutating } from "@tanstack/react-query";
import { BookmarkButton } from "./BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

const QuestionInspectBookmark = ({
  questionId,
  bookmarks,
  isValidSession,
  isBookmarkDisabled,
  isBookmarksFetching,
  isBookmarkError,
}: {
  questionId: string;
  bookmarks: Set<string>;
  isValidSession: boolean;
  isBookmarkDisabled: boolean;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
}) => {
  const mutationKey = ["user_bookmarks", questionId];

  const isMutatingThisQuestion =
    useIsMutating({
      mutationKey: mutationKey,
    }) > 0;

  return (
    <>
      {!isMutatingThisQuestion && (
        <BookmarkButton
          className="h-[26px] w-[26px] border border-black"
          bookmarks={bookmarks}
          questionId={questionId}
          isValidSession={isValidSession}
          isBookmarkError={isBookmarkError}
          isBookmarkDisabled={isBookmarkDisabled}
          isBookmarksFetching={isBookmarksFetching || isBookmarkDisabled}
        />
      )}
      {isMutatingThisQuestion && (
        <Badge
          className="text-white text-[12px] h-[26px] !w-max flex items-center justify-center cursor-pointer bg-black"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          Saving
          <Loader2 className="animate-spin" />
        </Badge>
      )}
    </>
  );
};

export default QuestionInspectBookmark;
