/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton";
import { useIsMutating } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { SelectedBookmark, SelectedQuestion } from "../constants/types";
import Loader from "./Loader/Loader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

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
    const mutationKey = ["all_user_bookmarks", question.id];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const isMobileDevice = useIsMobile();

    const isMutatingThisQuestion =
      useIsMutating({
        mutationKey: mutationKey,
      }) > 0;

    return (
      <div
        className="w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer  group rounded-sm border dark:border-none border-black/50  relative overflow-hidden min-h-[110px]"
        onClick={() =>
          setIsQuestionViewOpen({ isOpen: true, questionId: question.id })
        }
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          if (!isPopoverOpen) {
            setIsHovering(false);
          }
        }}
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

        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-[100%] flex flex-wrap gap-2 items-center justify-center p-2 overflow-hidden">
          {isHovering && (
            <div className="flex flex-wrap gap-2 items-center justify-center content-start">
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
            </div>
          )}
        </div>

        <BookmarkButton
          triggerButtonClassName={cn(
            "absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer",
            isHovering && !isMobileDevice && "md:flex hidden"
          )}
          popOverTriggerClassName={cn(
            "absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer",
            isHovering && !isMobileDevice && "md:flex hidden"
          )}
          badgeClassName="hidden"
          bookmarks={bookmarks}
          isBookmarkError={isBookmarkError}
          questionId={question.id}
          setIsPopoverOpen={setIsPopoverOpen}
          isPopoverOpen={isPopoverOpen}
          setIsHovering={setIsHovering}
          isValidSession={isValidSession}
          isBookmarkDisabled={isUserSessionPending}
          isBookmarksFetching={isBookmarksFetching || isUserSessionPending}
          isInView={isHovering}
        />
        {isMutatingThisQuestion && (
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
        {isMobileDevice && !isMutatingThisQuestion && (
          <Button
            className={cn(
              "absolute bottom-1 right-1 h-7 w-7 md:hidden flex cursor-pointer",
              "rounded-[3px]",
              (() => {
                for (const bookmark of bookmarks) {
                  if (
                    bookmark.userBookmarks.some(
                      (b) => b.questionId === question.id
                    )
                  ) {
                    return true;
                  }
                }
                return false;
              })() && "!bg-logo-main !text-white",
              (isUserSessionPending || isBookmarksFetching) && "opacity-50"
            )}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              setIsPopoverOpen(true);
            }}
            disabled={isUserSessionPending || isBookmarksFetching}
          >
            {isBookmarksFetching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Bookmark size={10} />
            )}
          </Button>
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
