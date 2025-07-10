"use client";

import { useIsMutating } from "@tanstack/react-query";
import { BookmarkButton } from "./BookmarkButton";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { TriangleAlert } from "lucide-react";

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
      {!isMutatingThisQuestion && !isBookmarkError && (
        <BookmarkButton
          className="h-[26px] w-[26px] border border-black"
          bookmarks={bookmarks}
          questionId={questionId}
          isValidSession={isValidSession}
          isBookmarkDisabled={isBookmarkDisabled}
          isBookmarksFetching={isBookmarksFetching || isBookmarkDisabled}
        />
      )}
      {isMutatingThisQuestion && !isBookmarkError && (
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
      {isBookmarkError && (
        <Badge
          className="text-white text-[12px] h-[26px] !w-max flex items-center justify-center cursor-pointer bg-red-600"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        >
          Unable to bookmark
          <TriangleAlert />
        </Badge>
      )}
    </>
  );
};

export default QuestionInspectBookmark;
