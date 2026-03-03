/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useIsMutating, useMutationState } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { extractPaperCode, extractQuestionNumber } from "../../lib/utils";
import { QuestionHoverCardProps } from "../../types/components";
import { BookmarkButton } from "../BookmarkButton/BookmarkButton";
import Loader from "../Loader/Loader";

const QuestionHoverCard = memo(
  ({
    question,
    isThisTheCurrentQuestion,
    navigateToQuestion,
    isMobileDevice,
    listId,
    isInspectSidebarOpen,
    resetScrollPositions,
    isHavingUnsafeChangesRef,
    setIsAnnotationGuardDialogOpen,
    isAnnotationGuardDialogOpen,
  }: QuestionHoverCardProps) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isImageError, setIsImageError] = useState(false);
    const [hoverCardOpen, setHoverCardOpen] = useState(false);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const touchStartTimeRef = useRef<number | null>(null);
    const { finishedQuestionsData: userFinishedQuestions } = useTopicalApp();
    const isMutatingBookmarkOfThisQuestion =
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

    const isThisQuestionFinished = useMemo(
      () => userFinishedQuestions?.some((item) => item.question.id === question?.id) ?? false,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [userFinishedQuestions, question?.id, isThisFinishedQuestionSettled],
    );

    useEffect(() => {
      return () => {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        touchStartTimeRef.current = null;
      };
    }, []);
    const hoverCardBreakPoint = useIsMobile({ breakpoint: 1185 });
    const { savedActivitiesIsError } = useTopicalApp();
    const { isSessionPending, isAuthenticated } = useAuth();

    return (
      <HoverCard
        open={
          ((hoverCardOpen && !isPopoverOpen) || (isPopoverOpen && !hoverCardBreakPoint)) &&
          isInspectSidebarOpen
        }
      >
        <HoverCardTrigger asChild>
          <div
            className={cn(
              "hover:bg-foreground/10 relative flex cursor-pointer items-center justify-between rounded-sm p-2",
              isThisTheCurrentQuestion && "bg-logo-main! text-white",
              isThisQuestionFinished &&
                "bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-600",
            )}
            onTouchStart={useCallback(() => {
              touchStartTimeRef.current = Date.now();
            }, [])}
            onMouseEnter={useCallback(() => {
              if (touchStartTimeRef.current) {
                return;
              }
              if (isPopoverOpen) {
                return;
              }
              hoverTimeoutRef.current = setTimeout(() => {
                setHoverCardOpen(true);
              }, 375);
            }, [isPopoverOpen])}
            onMouseLeave={useCallback(() => {
              if (touchStartTimeRef.current) {
                return;
              }
              if (!isPopoverOpen) {
                setHoverCardOpen(false);
              }
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            }, [isPopoverOpen])}
            onClick={useCallback(() => {
              setHoverCardOpen(false);
              navigateToQuestion({ questionId: question?.id, scroll: false });
              resetScrollPositions();
            }, [navigateToQuestion, question?.id, resetScrollPositions])}
          >
            <p>
              {extractPaperCode({
                questionId: question?.id,
              })}{" "}
              Q
              {extractQuestionNumber({
                questionId: question?.id,
              })}
            </p>
            <BookmarkButton
              triggerButtonClassName="h-[26px] w-[26px] border-black border !static"
              popOverTriggerClassName={cn(
                "absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7  flex cursor-pointer z-[30]",
              )}
              badgeClassName="hidden"
              question={question}
              isBookmarkDisabled={isSessionPending}
              setIsHovering={setHoverCardOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
              listId={listId}
              isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
              setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
              isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
              isInView={true}
            />
            {isMutatingBookmarkOfThisQuestion && (
              <Badge
                className="absolute top-1/2 right-2 z-31 flex min-h-[28px]! w-max! -translate-y-1/2 cursor-pointer items-center justify-center rounded-[3px] bg-black text-[10px] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isSessionPending) {
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
                  setIsPopoverOpen(true);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
              >
                Saving
                <Loader2 className="animate-spin" />
              </Badge>
            )}
          </div>
        </HoverCardTrigger>
        <HoverCardContent
          className={cn(
            "z-100007 hidden min-h-[100px] w-max max-w-[292px] items-center justify-center overflow-hidden rounded-sm border-none bg-white! p-0 md:flex",
            isThisTheCurrentQuestion && "hidden!",
          )}
          side="left"
          sideOffset={25}
          onTouchStart={() => {
            setHoverCardOpen(false);
          }}
          onClick={() => {
            setHoverCardOpen(false);
          }}
        >
          {!isImageLoaded && !isImageError && (
            <div className="absolute top-0 left-0 z-99 flex h-full w-full flex-wrap content-center items-center justify-center gap-2 overflow-hidden bg-white p-2">
              <Loader />
            </div>
          )}
          {isImageError && (
            <div className="absolute top-0 left-0 z-99 flex h-full w-full flex-wrap content-center items-center justify-center gap-2 overflow-hidden bg-white p-2">
              <p className="text-sm text-red-500">Image failed to load</p>
            </div>
          )}
          <img
            onLoad={() => {
              setIsImageLoaded(true);
            }}
            loading="lazy"
            onError={() => {
              setIsImageError(true);
            }}
            src={question?.questionImages[0]}
            alt="Question image"
            width={400}
            className="max-h-[70dvh] overflow-hidden object-cover object-top"
          />
        </HoverCardContent>
      </HoverCard>
    );
  },
);
QuestionHoverCard.displayName = "QuestionHoverCard";

export default QuestionHoverCard;
