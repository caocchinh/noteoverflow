/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useIsMutating, useMutationState } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { extractCurriculumCode, extractSubjectCode } from "../lib/utils";
import { SelectedQuestion } from "../types/models";
import { BookmarkButton } from "./BookmarkButton/BookmarkButton";
import Loader from "./Loader/Loader";

const QuestionPreview = memo(
  ({
    imageSrc,
    imageWidth,
    imageHeight,
    listId,
    question,
    onQuestionClick,
    className,
    showCurriculumBadge,
    showSubjectBadge,
  }: {
    imageWidth: number | undefined;
    imageHeight: number | undefined;
    question: SelectedQuestion;
    imageSrc: string;
    listId?: string;
    onQuestionClick: () => void;
    className?: string;
    showCurriculumBadge: boolean;
    showSubjectBadge: boolean;
  }) => {
    const {
      uiPreferences,
      savedActivitiesIsLoading,
      savedActivitiesIsFetching,
      savedActivitiesIsError,
      finishedQuestionsData: userFinishedQuestions,
    } = useTopicalApp();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [shouldOpen, setShouldOpen] = useState(false);
    const isMobileDevice = useIsMobile();
    const { bookmarksData: bookmarks } = useTopicalApp();
    const { isSessionPending, isAuthenticated } = useAuth();

    const isMutatingThisBookmarkQuestion =
      useIsMutating({
        mutationKey: ["user_saved_activities", "bookmarks", question.id],
      }) > 0;

    const isThisFinishedQuestionSettled = useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "finished_questions", question.id],
        predicate: (mutation) =>
          mutation.state.status === "success" || mutation.state.status === "error",
      },
    });

    const doesThisQuestionFinished = useMemo(() => {
      if (!userFinishedQuestions || userFinishedQuestions.length === 0) {
        return false;
      }
      return userFinishedQuestions.some((item) => item.question.id === question.id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userFinishedQuestions, question.id, isThisFinishedQuestionSettled]);

    return (
      <div
        className={cn(
          "group group mansory-item relative flex h-full min-h-[110px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-sm border border-black/50 bg-white object-cover dark:border-transparent",
          className,
          uiPreferences.imageTheme === "dark" && "bg-black! dark:border-white!",
        )}
        onClick={useCallback(() => {
          onQuestionClick();
        }, [onQuestionClick])}
        onMouseEnter={useCallback(() => {
          setIsHovering(true);
        }, [setIsHovering])}
        onFocus={useCallback(() => {
          setIsHovering(true);
        }, [setIsHovering])}
        onBlur={useCallback(() => {
          setIsHovering(false);
        }, [setIsHovering])}
        onMouseLeave={useCallback(() => {
          if (!isPopoverOpen) {
            setIsHovering(false);
          }
        }, [isPopoverOpen])}
      >
        <div
          className={cn(
            "absolute inset-0 z-12 rounded-[10px] bg-linear-to-tr from-green-600/15 to-green-500/0 transition-opacity duration-400 ease-in-out",
            doesThisQuestionFinished && uiPreferences.showFinishedQuestionTint
              ? "opacity-100"
              : "opacity-0",
          )}
        />

        <div
          className={cn(
            "absolute top-0 left-0 z-10 h-full w-full bg-black opacity-0 group-hover:opacity-37",
            uiPreferences.imageTheme === "dark" && "bg-white!",
          )}
        ></div>
        {loading && (
          <div className="absolute top-0 left-0 z-99 flex h-full w-full flex-wrap content-center items-center justify-center gap-2 overflow-hidden bg-white p-2">
            <Loader />
          </div>
        )}
        {error && (
          <div className="absolute top-0 left-0 z-99 flex h-full w-full flex-wrap content-center items-center justify-center gap-2 overflow-hidden bg-white p-2">
            <p className="text-sm text-red-500">Image failed to load</p>
          </div>
        )}

        <div className="absolute top-0 left-0 z-11 flex h-full w-full flex-wrap items-center justify-center gap-2 overflow-hidden bg-transparent p-2 opacity-0 group-hover:opacity-100">
          <div className="flex flex-wrap content-start items-center justify-center gap-2">
            {showCurriculumBadge && (
              <Badge className="h-max bg-green-600 text-center text-white!">
                {extractCurriculumCode({ questionId: question.id })}
              </Badge>
            )}
            {showSubjectBadge && (
              <Badge className="bg-logo-main h-max text-center text-white!">
                {extractSubjectCode({ questionId: question.id })}
              </Badge>
            )}
            {question?.topics?.map((topic) => (
              <Badge
                key={topic}
                className="h-max max-w-full bg-white text-center whitespace-pre-wrap text-black!"
              >
                {topic}
              </Badge>
            ))}
            <Badge className="h-max bg-white text-center text-black!">{question?.year}</Badge>
            <Badge className="h-max bg-white text-center text-black!">
              Paper {question?.paperType}
            </Badge>
            <Badge className="h-max bg-white text-center text-black!">{question?.season}</Badge>
          </div>
        </div>

        <BookmarkButton
          isBookmarkDisabled={isSessionPending}
          triggerButtonClassName={cn(
            "absolute bottom-1 right-1 h-7 w-7 cursor-pointer z-[30]",
            isHovering && !isMobileDevice && "md:flex hidden",
          )}
          popOverTriggerClassName={cn(
            "absolute bottom-0 right-0 h-7 w-7 cursor-pointer z-[30]",
            isHovering && !isMobileDevice && "md:flex hidden",
          )}
          badgeClassName="hidden"
          question={question}
          setIsPopoverOpen={setIsPopoverOpen}
          isPopoverOpen={isPopoverOpen}
          setShouldOpen={setShouldOpen}
          setIsHovering={setIsHovering}
          isInView={shouldOpen}
          listId={listId}
        />
        {isMutatingThisBookmarkQuestion && (
          <Badge
            className="absolute right-1 bottom-1 z-31 flex min-h-[28px]! w-max! cursor-pointer items-center justify-center rounded-[3px] bg-black text-[10px] text-white"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (savedActivitiesIsLoading) {
                return;
              }
              if (savedActivitiesIsError) {
                toast.error("Bookmark error. Please refresh the page.", {
                  duration: 2000,
                  position: isMobileDevice && isPopoverOpen ? "top-center" : "bottom-right",
                });
                return;
              }
              if (!isAuthenticated) {
                toast.error("Please sign in to bookmark questions.", {
                  duration: 2000,
                  position: isMobileDevice && isPopoverOpen ? "top-center" : "bottom-right",
                });
                return;
              }
              setShouldOpen(true);
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
        {!isMutatingThisBookmarkQuestion && isHovering && (
          <Button
            className={cn(
              "absolute right-1 bottom-1 h-7 w-7 cursor-pointer",
              "z-30 rounded-[3px]",
              (() => {
                for (const bookmark of bookmarks ?? []) {
                  if (bookmark.userBookmarks.some((b) => b.question.id === question.id)) {
                    return true;
                  }
                }
                return false;
              })() && "bg-logo-main! text-white!",
              (savedActivitiesIsLoading || savedActivitiesIsFetching) && "opacity-50",
            )}
            tabIndex={-1}
            onClick={(e) => {
              e.stopPropagation();
              if (isSessionPending || savedActivitiesIsFetching) {
                return;
              }
              if (savedActivitiesIsError) {
                toast.error("Bookmark error. Please refresh the page.", {
                  duration: 2000,
                  position: isMobileDevice && isPopoverOpen ? "top-center" : "bottom-right",
                });
                return;
              }
              if (!isAuthenticated) {
                toast.error("Please sign in to bookmark questions.", {
                  duration: 2000,
                  position: isMobileDevice && isPopoverOpen ? "top-center" : "bottom-right",
                });
                return;
              }
              setShouldOpen(true);
              setIsPopoverOpen(true);
            }}
          >
            {savedActivitiesIsFetching ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Bookmark size={10} />
            )}
          </Button>
        )}

        <img
          className={cn(
            "h-full w-full object-contain",
            uiPreferences.imageTheme === "dark" && "invert!",
          )}
          src={imageSrc}
          alt="Question preview"
          loading="lazy"
          width={imageWidth}
          height={imageHeight}
          onLoad={() => {
            setLoading(false);
          }}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      </div>
    );
  },
);

QuestionPreview.displayName = "QuestionPreview";
export default QuestionPreview;
