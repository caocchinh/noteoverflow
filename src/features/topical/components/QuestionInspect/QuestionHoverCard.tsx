/* eslint-disable @next/next/no-img-element */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QuestionHoverCardProps } from "../../constants/types";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useIsMutating, useMutationState } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import Loader from "../Loader/Loader";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BookmarkButton } from "../BookmarkButton";
import { Loader2 } from "lucide-react";
import { extractPaperCode, extractQuestionNumber } from "../../lib/utils";

const QuestionHoverCard = memo(
  ({
    question,
    isThisTheCurrentQuestion,
    navigateToQuestion,
    isMobileDevice,
    listId,
    isInspectSidebarOpen,
    resetScrollPositions,
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

    const isThisQuestionFinished = useMemo(
      () =>
        userFinishedQuestions?.some(
          (item) => item.question.id === question?.id
        ) ?? false,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [userFinishedQuestions, question?.id, isThisFinishedQuestionSettled]
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
          ((hoverCardOpen && !isPopoverOpen) ||
            (isPopoverOpen && !hoverCardBreakPoint)) &&
          isInspectSidebarOpen
        }
      >
        <HoverCardTrigger asChild>
          <div
            className={cn(
              "cursor-pointer relative p-2 rounded-sm flex items-center justify-between hover:bg-foreground/10",
              isThisTheCurrentQuestion && "!bg-logo-main text-white",
              isThisQuestionFinished &&
                "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
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
              navigateToQuestion(question?.id, false);
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
                "absolute top-1/2 -translate-y-1/2 right-1 h-7 w-7  flex cursor-pointer z-[30]"
              )}
              badgeClassName="hidden"
              question={question}
              isBookmarkDisabled={isSessionPending}
              setIsHovering={setHoverCardOpen}
              setIsPopoverOpen={setIsPopoverOpen}
              isPopoverOpen={isPopoverOpen}
              listId={listId}
              isInView={true}
            />
            {isMutatingBookmarkOfThisQuestion && (
              <Badge
                className="absolute top-1/2 -translate-y-1/2 right-2 text-white text-[10px] !w-max flex items-center justify-center cursor-pointer bg-black rounded-[3px] !min-h-[28px] z-[31]"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isSessionPending) {
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
            "z-[100007] w-max p-0 overflow-hidden border-none max-w-[292px] min-h-[100px] !bg-white md:flex hidden items-center justify-center rounded-sm",
            isThisTheCurrentQuestion && "!hidden"
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
            <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
              <Loader />
            </div>
          )}
          {isImageError && (
            <div className="absolute top-0 left-0 w-full h-full z-[99] bg-white flex flex-wrap gap-2 items-center justify-center content-center p-2 overflow-hidden">
              <p className="text-red-500 text-sm">Image failed to load</p>
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
  }
);
QuestionHoverCard.displayName = "QuestionHoverCard";

export default QuestionHoverCard;
