"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JumpToTabButton } from "./JumpToTabButton";
import {
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  COLUMN_BREAKPOINTS,
  MANSONRY_GUTTER_BREAKPOINTS,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import {
  SelectedQuestion,
  FinishedTrackerProps,
  SortParameters,
} from "@/features/topical/constants/types";
import { chunkQuestionsData } from "@/features/topical/lib/utils";
import { useTopicalApp } from "../context/TopicalLayoutProvider";
import Sort from "./Sort";
import QuestionPreview from "./QuestionPreview";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import {
  FirstPageButton,
  PreviousPageButton,
  NextPageButton,
  LastPageButton,
} from "./PaginationButtons";
import { Button } from "@/components/ui/button";
import { useIsMutating } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

export const FinishedTracker = ({
  allQuestions,
  navigateToQuestion,
}: FinishedTrackerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });
  const {
    setIsCalculatorOpen,
    savedActivitiesIsFetching,
    finishedQuestionsData: userFinishedQuestions,
  } = useTopicalApp();
  const { isAuthenticated, isSessionPending } = useAuth();
  const isMutatingThisFinishedQuestion =
    useIsMutating({
      mutationKey: ["user_saved_activities", "finished_questions"],
    }) > 0;

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const finishedCount = useMemo(
    () =>
      allQuestions.filter((q) =>
        userFinishedQuestions?.some((fq) => fq.question.id === q.id)
      ).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allQuestions, userFinishedQuestions, isMutatingThisFinishedQuestion]
  );

  const progressPercentage =
    allQuestions.length > 0 ? (finishedCount / allQuestions.length) * 100 : 0;

  const finishedQuestions = useMemo(() => {
    const filtered = allQuestions.filter((q) =>
      userFinishedQuestions?.some((fq) => fq.question.id === q.id)
    );

    // Sort by updatedAt from userFinishedQuestions
    return filtered.toSorted((a, b) => {
      const aFinished = userFinishedQuestions?.find(
        (fq) => fq.question.id === a.id
      );
      const bFinished = userFinishedQuestions?.find(
        (fq) => fq.question.id === b.id
      );

      const aTime = aFinished ? new Date(aFinished.updatedAt).getTime() : 0;
      const bTime = bFinished ? new Date(bFinished.updatedAt).getTime() : 0;

      return sortParameters.sortBy === "descending"
        ? bTime - aTime
        : aTime - bTime;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    allQuestions,
    userFinishedQuestions,
    sortParameters.sortBy,
    isMutatingThisFinishedQuestion,
  ]);

  const fullPartitionedData = useMemo(() => {
    return chunkQuestionsData(
      finishedQuestions,
      DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
    );
  }, [finishedQuestions]);

  // Update displayed data when fullPartitionedData changes
  useEffect(() => {
    if (fullPartitionedData.length > 0) {
      setDisplayedData(fullPartitionedData[0] ?? 0);
      setCurrentChunkIndex(0);
      if (scrollAreaRef?.current) {
        scrollAreaRef.current.scrollTo({
          top: 0,
          behavior: "instant",
        });
      }
    }
  }, [fullPartitionedData, scrollAreaRef]);

  return (
    <>
      {isDialogOpen && <div className="fixed inset-0 z-[100007] bg-black/67" />}
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          setIsCalculatorOpen(false);
        }}
        modal={false}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <div className="absolute w-full left-0 top-0 p-2 bg-green-600 cursor-pointer backdrop-blur-sm border-b">
                {!savedActivitiesIsFetching &&
                  !isSessionPending &&
                  isAuthenticated && (
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress
                          value={progressPercentage}
                          className="h-3 bg-gray-200 [&>div]:bg-[#0084ff] [&>div]:bg-[repeating-linear-gradient(45deg,#0084ff,#0084ff_4px,#0066cc_4px,#0066cc_8px)]"
                        />
                      </div>
                      <span className="text-sm font-medium text-white whitespace-nowrap">
                        {finishedCount} / {allQuestions.length} completed
                        <span className="text-xs text-white ml-1">
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
          <TooltipContent side="right" className="z-[1000000]">
            Click to view your finished questions
          </TooltipContent>
        </Tooltip>
        <DialogContent
          className="!max-w-5xl h-[95dvh] z-[100008] dark:bg-accent gap-2"
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

          {!savedActivitiesIsFetching &&
            !isSessionPending &&
            isAuthenticated && (
              <>
                <DialogHeader className="flex flex-row items-start justify-between flex-wrap gap-2">
                  <div className="flex flex-col items-start justify-start flex-wrap gap-0">
                    <DialogTitle>
                      {finishedCount} finished questions
                    </DialogTitle>
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
                    <ResponsiveMasonry
                      columnsCountBreakPoints={
                        COLUMN_BREAKPOINTS[2 as keyof typeof COLUMN_BREAKPOINTS]
                      }
                      // @ts-expect-error - gutterBreakPoints is not typed by the library
                      gutterBreakPoints={MANSONRY_GUTTER_BREAKPOINTS}
                    >
                      <Masonry>
                        {displayedData?.map((question) =>
                          question?.questionImages.map((imageSrc: string) => (
                            <QuestionPreview
                              question={question}
                              key={`${question.id}-${imageSrc}`}
                              imageSrc={imageSrc}
                              onQuestionClick={() => {
                                setIsDialogOpen(false);
                                navigateToQuestion(question?.id);
                              }}
                            />
                          ))
                        )}
                      </Masonry>
                    </ResponsiveMasonry>
                    {/* Pagination Controls */}
                    <div className="flex flex-row items-center justify-center gap-2 mt-6 w-full">
                      <FirstPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <PreviousPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
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
                          setDisplayedData(fullPartitionedData[tab]);
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
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <LastPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={true}
                        scrollAreaRef={scrollAreaRef}
                      />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <p className="text-sm text-muted-foreground">
                      No finished questions yet.
                    </p>
                  </div>
                )}
              </>
            )}

          <DialogFooter className="w-full self-end">
            <DialogClose asChild>
              <Button className="cursor-pointer w-full" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
