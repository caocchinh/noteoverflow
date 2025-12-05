/* eslint-disable @next/next/no-img-element */
"use client";
import { Badge } from "@/components/ui/badge";
import { BookmarkButton } from "./BookmarkButton/BookmarkButton";
import { useIsMutating, useMutationState } from "@tanstack/react-query";
import { Bookmark, Loader2 } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";
import { SelectedQuestion } from "../constants/types";
import Loader from "./Loader/Loader";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import { useAuth } from "@/context/AuthContext";

const QuestionPreview = memo(
  ({
    imageSrc,
    listId,
    question,
    onQuestionClick,
    className,
  }: {
    question: SelectedQuestion;
    imageSrc: string;
    listId?: string;
    onQuestionClick: () => void;
    className?: string;
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
        mutationKey: [
          "user_saved_activities",
          "finished_questions",
          question.id,
        ],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    const doesThisQuestionFinished = useMemo(() => {
      if (!userFinishedQuestions || userFinishedQuestions.length === 0) {
        return false;
      }
      return userFinishedQuestions.some(
        (item) => item.question.id === question.id
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userFinishedQuestions, question.id, isThisFinishedQuestionSettled]);

    return (
      <div
        className={cn(
          "w-full h-full object-cover bg-white flex items-center justify-center group cursor-pointer  group rounded-sm border dark:border-transparent mansory-item border-black/50 relative overflow-hidden min-h-[110px]",
          className,
          uiPreferences.imageTheme === "dark" && "bg-black! dark:border-white!"
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
            "absolute inset-0 rounded-[10px] bg-linear-to-tr from-green-600/15 to-green-500/0 transition-opacity duration-400 ease-in-out z-12",
            doesThisQuestionFinished && uiPreferences.showFinishedQuestionTint
              ? "opacity-100"
              : " opacity-0"
          )}
        />

        <div
          className={cn(
            "absolute top-0 left-0 w-full h-full bg-black opacity-0 group-hover:opacity-37 z-10",
            uiPreferences.imageTheme === "dark" && "bg-white!"
          )}
        ></div>
        {loading && (
          <div className="absolute top-0 left-0 w-full h-full z-99 bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <Loader />
          </div>
        )}
        {error && (
          <div className="absolute top-0 left-0 w-full h-full z-99 bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
            <p className="text-red-500 text-sm">Image failed to load</p>
          </div>
        )}

        <div className="absolute top-0 left-0 w-full h-full bg-transparent opacity-0 group-hover:opacity-100 flex flex-wrap gap-2 items-center justify-center p-2 overflow-hidden z-11">
          <div className="flex flex-wrap gap-2 items-center justify-center content-start">
            {question?.topics?.map((topic) => (
              <Badge
                key={topic}
                className="h-max bg-white text-black! text-center max-w-full whitespace-pre-wrap"
              >
                {topic}
              </Badge>
            ))}
            <Badge className="h-max bg-white text-black! text-center">
              {question?.year}
            </Badge>
            <Badge className="h-max bg-white text-black! text-center">
              Paper {question?.paperType}
            </Badge>
            <Badge className="h-max bg-white text-black! text-center">
              {question?.season}
            </Badge>
          </div>
        </div>

        <BookmarkButton
          isBookmarkDisabled={isSessionPending}
          triggerButtonClassName={cn(
            "absolute bottom-1 right-1 h-7 w-7 cursor-pointer z-[30]",
            isHovering && !isMobileDevice && "md:flex hidden"
          )}
          popOverTriggerClassName={cn(
            "absolute bottom-0 right-0 h-7 w-7 cursor-pointer z-[30]",
            isHovering && !isMobileDevice && "md:flex hidden"
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
            className="absolute bottom-1 right-1 text-white text-[10px] w-max! flex items-center justify-center cursor-pointer bg-black rounded-[3px] min-h-[28px]! z-31"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              if (savedActivitiesIsLoading) {
                return;
              }
              if (savedActivitiesIsError) {
                toast.error("Bookmark error. Please refresh the page.", {
                  duration: 2000,
                  position:
                    isMobileDevice && isPopoverOpen
                      ? "top-center"
                      : "bottom-right",
                });
                return;
              }
              if (!isAuthenticated) {
                toast.error("Please sign in to bookmark questions.", {
                  duration: 2000,
                  position:
                    isMobileDevice && isPopoverOpen
                      ? "top-center"
                      : "bottom-right",
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
              "absolute bottom-1 right-1 h-7 w-7 cursor-pointer",
              "rounded-[3px] z-30",
              (() => {
                for (const bookmark of bookmarks ?? []) {
                  if (
                    bookmark.userBookmarks.some(
                      (b) => b.question.id === question.id
                    )
                  ) {
                    return true;
                  }
                }
                return false;
              })() && "bg-logo-main! text-white!",
              (savedActivitiesIsLoading || savedActivitiesIsFetching) &&
                "opacity-50"
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
                  position:
                    isMobileDevice && isPopoverOpen
                      ? "top-center"
                      : "bottom-right",
                });
                return;
              }
              if (!isAuthenticated) {
                toast.error("Please sign in to bookmark questions.", {
                  duration: 2000,
                  position:
                    isMobileDevice && isPopoverOpen
                      ? "top-center"
                      : "bottom-right",
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
            "w-full h-full object-contain",
            uiPreferences.imageTheme === "dark" && "invert!"
          )}
          src={imageSrc}
          alt="Question preview"
          loading="lazy"
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
  }
);

QuestionPreview.displayName = "QuestionPreview";
export default QuestionPreview;
