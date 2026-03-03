"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import {
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import { chunkQuestionsData } from "@/features/topical/lib/utils";
import { useMutationState } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { memo, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { FinishedTrackerProps } from "../../types/components";
import { SortParameters } from "../../types/models";
import { JumpToTabButton } from "../JumpToTabButton";
import Masonry from "../Masonry";
import {
  FirstPageButton,
  LastPageButton,
  NextPageButton,
  PreviousPageButton,
} from "../PaginationButtons";
import QuestionPreview from "../QuestionPreview";
import Sort from "../Sort";

export const FinishedTracker = memo(
  ({ allQuestions, navigateToQuestion }: FinishedTrackerProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [sortParameters, setSortParameters] = useState<SortParameters>({
      sortBy: DEFAULT_SORT_OPTIONS,
    });
    const pathname = usePathname();
    const {
      setIsCalculatorOpen,
      savedActivitiesIsFetching,
      finishedQuestionsData: userFinishedQuestions,
    } = useTopicalApp();
    const { isAuthenticated, isSessionPending } = useAuth();
    const settledFinishedQuestionMutations = useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "finished_questions"],
        predicate: (mutation) =>
          mutation.state.status === "success" || mutation.state.status === "error",
      },
    });
    const scrollAreaRef = useRef<HTMLDivElement | null>(null);
    const finishedCount = useMemo(
      () =>
        allQuestions.filter((q) => userFinishedQuestions?.some((fq) => fq.question.id === q.id))
          .length,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [allQuestions, userFinishedQuestions, settledFinishedQuestionMutations],
    );

    const progressPercentage =
      allQuestions.length > 0 ? (finishedCount / allQuestions.length) * 100 : 0;

    const finishedQuestions = useMemo(() => {
      const filtered = allQuestions.filter((q) =>
        userFinishedQuestions?.some((fq) => fq.question.id === q.id),
      );

      // Sort by updatedAt from userFinishedQuestions
      return filtered.toSorted((a, b) => {
        const aFinished = userFinishedQuestions?.find((fq) => fq.question.id === a.id);
        const bFinished = userFinishedQuestions?.find((fq) => fq.question.id === b.id);

        const aTime = aFinished ? new Date(aFinished.updatedAt).getTime() : 0;
        const bTime = bFinished ? new Date(bFinished.updatedAt).getTime() : 0;

        return sortParameters.sortBy === "descending" ? bTime - aTime : aTime - bTime;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      allQuestions,
      userFinishedQuestions,
      sortParameters.sortBy,
      settledFinishedQuestionMutations,
    ]);

    const fullPartitionedData = useMemo(() => {
      return chunkQuestionsData(finishedQuestions, DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE);
    }, [finishedQuestions]);

    // Reset chunk index when data changes
    const onDataChange = useEffectEvent(() => {
      setCurrentChunkIndex(0);
    });

    useEffect(() => {
      onDataChange();
      if (scrollAreaRef?.current) {
        scrollAreaRef.current.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
    }, [fullPartitionedData]);

    const displayedData = useMemo(() => {
      return fullPartitionedData?.[currentChunkIndex] ?? [];
    }, [fullPartitionedData, currentChunkIndex]);

    return (
      <>
        {isDialogOpen && <div className="fixed inset-0 z-100010 bg-black/67" />}

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            setIsCalculatorOpen(false);
          }}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <div className="absolute top-0 left-0 w-full cursor-pointer border-b bg-green-600 p-2 backdrop-blur-sm">
                  {!savedActivitiesIsFetching && !isSessionPending && isAuthenticated && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress
                          value={progressPercentage}
                          className="h-3 bg-gray-200 [&>div]:bg-[#0084ff] [&>div]:bg-[repeating-linear-gradient(45deg,#0084ff,#0084ff_4px,#0066cc_4px,#0066cc_8px)]"
                        />
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap text-white">
                        {finishedCount} / {allQuestions.length} completed
                        <span className="ml-1 text-xs text-white">
                          ({Math.round(progressPercentage)}%)
                        </span>
                      </span>
                    </div>
                  )}
                  {(isSessionPending || savedActivitiesIsFetching) && (
                    <div className="flex items-center justify-center gap-2 text-sm text-white">
                      <Loader2 className="animate-spin" size={14} />
                      Fetching progress data...
                    </div>
                  )}
                  {!isAuthenticated && !isSessionPending && (
                    <div className="flex items-center justify-center text-sm text-white">
                      Sign in to track your progress
                    </div>
                  )}
                </div>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" className="z-1000000">
              Click to view your finished questions
            </TooltipContent>
          </Tooltip>
          <DialogContent
            className="dark:bg-accent z-100008 h-[95dvh] max-w-5xl! gap-2"
            showCloseButton={false}
          >
            {(isSessionPending || savedActivitiesIsFetching) && (
              <div className="flex items-center justify-center gap-2 text-xl text-gray-500">
                <Loader2 className="animate-spin" size={14} />
                Fetching progress data...
              </div>
            )}
            {!isAuthenticated && !isSessionPending && (
              <div className="flex items-center justify-center text-xl text-red-500">
                Sign in to track your progress
              </div>
            )}

            {!savedActivitiesIsFetching && !isSessionPending && isAuthenticated && (
              <>
                <DialogHeader className="flex flex-row flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-col flex-wrap items-start justify-start gap-0">
                    <DialogTitle>{finishedCount} finished questions</DialogTitle>
                    <DialogDescription className="text-md">
                      Here are the questions you&apos;ve currently completed
                    </DialogDescription>
                  </div>
                  <Sort
                    sortParameters={sortParameters}
                    setSortParameters={setSortParameters}
                    isDisabled={false}
                    disabledMessage=""
                    descendingSortText="Most recently completed"
                    ascendingSortText="Least recently completed"
                  />
                </DialogHeader>

                {finishedQuestions.length > 0 ? (
                  <ScrollArea
                    className="max-h-[75vh] pr-4"
                    viewportRef={scrollAreaRef}
                    type="always"
                  >
                    <Masonry
                      items={displayedData?.flatMap((question) =>
                        question?.questionImages.map((imageSrc: string, imageIndex: number) => ({
                          element: (
                            <QuestionPreview
                              question={question}
                              key={`${question.id}-${imageSrc}`}
                              imageSrc={imageSrc}
                              onQuestionClick={() => {
                                setIsDialogOpen(false);
                                navigateToQuestion({
                                  questionId: question?.id,
                                });
                              }}
                              imageWidth={question.questionImagesDimensions?.[imageIndex]?.width}
                              imageHeight={question.questionImagesDimensions?.[imageIndex]?.height}
                              showCurriculumBadge={pathname == "/search"}
                              showSubjectBadge={pathname == "/search"}
                            />
                          ),
                          width: question.questionImagesDimensions?.[imageIndex]?.width,
                          height: question.questionImagesDimensions?.[imageIndex]?.height,
                        })),
                      )}
                    />
                    {/* Pagination Controls */}
                    <div className="mt-6 flex w-full flex-row items-center justify-center gap-2">
                      <FirstPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <PreviousPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <JumpToTabButton
                        className="mx-4"
                        tab={currentChunkIndex}
                        totalTabs={fullPartitionedData.length}
                        prefix="page"
                        onTabChangeCallback={({ tab }) => {
                          setCurrentChunkIndex(tab);
                          if (scrollAreaRef?.current) {
                            scrollAreaRef.current.scrollTo({
                              top: 0,
                              behavior: "instant",
                            });
                          }
                        }}
                      />
                      <NextPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        totalPages={fullPartitionedData.length}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <LastPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        totalPages={fullPartitionedData.length}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex w-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">No finished questions yet.</p>
                  </div>
                )}
              </>
            )}

            <DialogFooter className="w-full self-end">
              <DialogClose asChild>
                <Button className="w-full cursor-pointer" variant="outline">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  },
);

FinishedTracker.displayName = "FinishedTracker";
