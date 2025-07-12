/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { SelectedQuestion } from "../constants/types";
import Loader from "./Loader/Loader";

const QuestionPreview = memo(
  ({
    bookmarks,
    setIsQuestionViewOpen,
    isBookmarksFetching,
    isUserSessionPending,
    imageSrc,
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
    imageSrc: string;
    isUserSessionPending: boolean;
    isBookmarkError: boolean;
    isValidSession: boolean;
  }) => {
    const mutationKey = ["user_bookmarks", question.id];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: mutationKey,
      }) > 0;

    return (
      <div
        className="w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer hover:scale-[0.98] transition-all group duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] rounded-sm border dark:border-none border-black/50  relative overflow-hidden min-h-[100px]"
        onClick={() =>
          setIsQuestionViewOpen({ isOpen: true, questionId: question.id })
        }
      >
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-[37%]"></div>
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <Loader />
          </div>
        )}
        {error && (
          <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <p className="text-red-500 text-sm">Image failed to load</p>
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-[100%] flex flex-wrap gap-2 items-center justify-center content-start p-2 overflow-hidden">
          {question?.questionTopics?.map((topic) => (
            <Badge
              key={topic.topic}
              className="h-max bg-white !text-black text-center max-w-full whitespace-pre-wrap"
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

          {!isMutatingThisQuestion && (
            <BookmarkButton
              className="absolute bottom-1 right-1 h-7 w-7 md:flex hidden cursor-pointer"
              isBookmarkDisabled={isUserSessionPending}
              bookmarks={bookmarks}
              isBookmarkError={isBookmarkError}
              questionId={question.id}
              isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
              isValidSession={isValidSession}
            />
          )}
        </div>
        {!isMutatingThisQuestion && (
          <BookmarkButton
            className="absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer"
            bookmarks={bookmarks}
            isBookmarkError={isBookmarkError}
            questionId={question.id}
            isValidSession={isValidSession}
            isBookmarkDisabled={isUserSessionPending}
            isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
          />
        )}
        {isMutatingThisQuestion && (
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

        <img
          className="w-full h-full object-contain"
          src={imageSrc}
          alt="Question preview"
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </div>
    );
  }
);

QuestionPreview.displayName = "QuestionPreview";
export default QuestionPreview;
