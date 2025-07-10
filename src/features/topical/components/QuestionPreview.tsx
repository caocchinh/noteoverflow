/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2, TriangleAlert } from "lucide-react";
import { memo } from "react";
import { SelectedQuestion } from "../server/actions";

const QuestionPreview = memo(
  ({
    bookmarks,
    setIsQuestionViewOpen,
    isBookmarksFetching,
    isUserSessionPending,
    imageIndex,
    isBookmarkError,
    isValidSession,
    question,
  }: {
    bookmarks: Set<string>;
    question: SelectedQuestion;
    setIsQuestionViewOpen: (open: {
      isOpen: boolean;
      questionId: string;
    }) => void;
    isBookmarksFetching: boolean;
    imageIndex: number;
    isUserSessionPending: boolean;
    isBookmarkError: boolean;
    isValidSession: boolean;
  }) => {
    const mutationKey = ["user_bookmarks", question.id];

    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: mutationKey,
      }) > 0;

    return (
      <div
        className="w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer hover:scale-[0.98] transition-all group duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-sm border dark:border-none border-black/50 min-h-[100px] relative overflow-hidden"
        onClick={() =>
          setIsQuestionViewOpen({ isOpen: true, questionId: question.id })
        }
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-[37%]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-[100%] flex flex-wrap gap-2 items-center justify-center content-center p-2">
          {question?.questionTopics?.map((topic) => (
            <Badge
              key={topic.topic}
              className="h-max bg-white !text-black text-center"
            >
              {topic.topic}
            </Badge>
          ))}
          <Badge className="h-max bg-white !text-black text-center">
            {question?.year}
          </Badge>
          <Badge className="h-max bg-white !text-black text-center">
            Paper {question?.paperType}
          </Badge>
          <Badge className="h-max bg-white !text-black text-center">
            {question?.season}
          </Badge>

          {!isMutatingThisQuestion && !isBookmarkError && (
            <BookmarkButton
              className="absolute bottom-1 right-1 h-7 w-7 md:flex hidden cursor-pointer"
              isBookmarkDisabled={isUserSessionPending}
              bookmarks={bookmarks}
              questionId={question.id}
              isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
              isValidSession={isValidSession}
            />
          )}
        </div>
        {!isMutatingThisQuestion && !isBookmarkError && (
          <BookmarkButton
            className="absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer"
            bookmarks={bookmarks}
            questionId={question.id}
            isValidSession={isValidSession}
            isBookmarkDisabled={isUserSessionPending}
            isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
          />
        )}
        {isMutatingThisQuestion && !isBookmarkError && (
          <Badge
            className="absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black"
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
            className="absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-red-600"
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
        <img
          className="w-full h-full object-contain"
          src={question?.questionImages[imageIndex]?.imageSrc}
          alt="Question preview"
          loading="lazy"
        />
      </div>
    );
  }
);

QuestionPreview.displayName = "QuestionPreview";
export default QuestionPreview;
