/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import { useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { memo, useCallback, useRef, useState } from "react";
import {
  ExtendedIntersectionObserverInit,
  SelectedBookmark,
  SelectedQuestion,
} from "../constants/types";
import Loader from "./Loader/Loader";
import { cn } from "@/lib/utils";

const QuestionPreview = memo(
  ({
    bookmarks,
    setIsQuestionViewOpen,
    isBookmarksFetching,
    isUserSessionPending,
    imageSrc,
    isBookmarkError,
    isValidSession,
    showFinishedQuestionTint,
    question,
    userFinishedQuestions,
  }: {
    bookmarks: SelectedBookmark;
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
    userFinishedQuestions: Set<string>;
    showFinishedQuestionTint: boolean;
  }) => {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const mutationKey = ["all_user_bookmarks", question.id];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isInView, setIsInView] = useState(false);

    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: mutationKey,
      }) > 0;

    const setObserverRef = useCallback((node: HTMLDivElement | null) => {
      if (typeof window === "undefined") {
        return;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (!node) {
        return;
      }
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            setIsInView(entry.isIntersecting);
          });
        },
        {
          rootMargin: `${window.innerHeight}px`,
          scrollMargin: `${window.innerHeight}px`,
          threshold: 1,
        } as ExtendedIntersectionObserverInit
      );
      observerRef.current.observe(node);
    }, []);

    return (
      <div
        className="w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer  group rounded-sm border dark:border-none border-black/50  relative overflow-hidden min-h-[110px]"
        onClick={() =>
          setIsQuestionViewOpen({ isOpen: true, questionId: question.id })
        }
        ref={setObserverRef}
      >
        <div
          className={cn(
            "absolute inset-0 rounded-[10px] bg-gradient-to-tr from-green-600/15 to-green-500/0 transition-opacity duration-400 ease-in-out",
            userFinishedQuestions?.has(question.id) && showFinishedQuestionTint
              ? "opacity-100"
              : " opacity-0"
          )}
        />

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

          {isInView && (
            <BookmarkButton
              className="absolute bottom-1 right-1 h-7 w-7 md:flex hidden cursor-pointer"
              isBookmarkDisabled={isUserSessionPending}
              bookmarks={bookmarks}
              isBookmarkError={isBookmarkError}
              isPopoverOpen={isPopoverOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              questionId={question.id}
              isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
              isValidSession={isValidSession}
            />
          )}
        </div>
        {isInView && (
          <BookmarkButton
            className={cn(
              "absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer",
              isPopoverOpen && !isMutatingThisQuestion && "md:flex hidden"
            )}
            bookmarks={bookmarks}
            isBookmarkError={isBookmarkError}
            questionId={question.id}
            isValidSession={isValidSession}
            isBookmarkDisabled={isUserSessionPending}
            isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
          />
        )}
        {isMutatingThisQuestion && isInView && !isPopoverOpen && (
          <Badge
            className="absolute bottom-1 right-1 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] !min-h-[28px]"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setIsPopoverOpen(true);
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
