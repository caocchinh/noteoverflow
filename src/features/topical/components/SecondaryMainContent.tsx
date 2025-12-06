"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import type {
  SecondaryMainContentProps,
  SelectedQuestion,
  SortableTopicalItem,
  SortParameters,
} from "@/features/topical/constants/types";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { useEffect, useRef, useState, memo } from "react";
import Masonry from "./Masonry";
import ExportBar from "./ExportMode/ExportBar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ArrowRightFromLine } from "lucide-react";

const SecondaryMainContent = ({
  topicalData,
  isQuestionViewDisabled,
  BETTER_AUTH_URL,
  questionInspectRef,
  listId,
  preContent,
  breadcrumbContent,
  mainContent,
}: SecondaryMainContentProps) => {
  const { uiPreferences } = useTopicalApp();
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: "descending",
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [questionsForExport, setQuestionsForExport] = useState<Set<string>>(
    new Set()
  );
  const [questionsForExportArray, setQuestionsForExportArray] = useState<
    string[]
  >([]);
  const questionsForExportRef = useRef(questionsForExport);
  questionsForExportRef.current = questionsForExport;
  const [isExportModeEnabled, setIsExportModeEnabled] = useState(false);

  // Process topical data into chunks
  useEffect(() => {
    if (topicalData) {
      const chunkSize =
        uiPreferences.layoutStyle === "pagination"
          ? uiPreferences.numberOfQuestionsPerPage
          : 20; // INFINITE_SCROLL_CHUNK_SIZE equivalent

      const sortedData = topicalData
        .toSorted((a: SortableTopicalItem, b: SortableTopicalItem) => {
          const aIndex = new Date(a.updatedAt || 0).getTime();
          const bIndex = new Date(b.updatedAt || 0).getTime();
          return sortParameters.sortBy === "descending"
            ? bIndex - aIndex
            : aIndex - bIndex;
        })
        .map((item) => item.question);

      const chunkedData = sortedData.reduce(
        (acc: SelectedQuestion[][], item: SelectedQuestion, index: number) => {
          const chunkIndex = Math.floor(index / chunkSize);
          if (!acc[chunkIndex]) {
            acc[chunkIndex] = [];
          }
          acc[chunkIndex].push(item);
          return acc;
        },
        []
      );

      setFullPartitionedData(chunkedData);
      setDisplayedData(chunkedData[0] ?? []);
      setCurrentChunkIndex(0);
      scrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [
    topicalData,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    sortParameters.sortBy,
  ]);

  const handleQuestionClick = (questionId: string) => {
    if (isExportModeEnabled) {
      setQuestionsForExport((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(questionId)) {
          newSet.delete(questionId);
        } else {
          newSet.add(questionId);
        }
        return newSet;
      });
      setQuestionsForExportArray((prev) => {
        if (prev.includes(questionId)) {
          return prev.filter((id) => id !== questionId);
        } else {
          return [...prev, questionId];
        }
      });
      return;
    }
    questionInspectRef.current?.setIsInspectOpen({
      isOpen: true,
      questionId,
    });
  };

  useEffect(() => {
    if (topicalData?.length === 0) {
      setIsExportModeEnabled(false);
      setQuestionsForExport(new Set());
      setQuestionsForExportArray([]);
    } else if (topicalData && questionsForExportRef.current.size > 0) {
      const currentIds = new Set(topicalData.map((item) => item.question.id));
      setQuestionsForExport((prev) => {
        const next = new Set([...prev].filter((id) => currentIds.has(id)));
        return next.size === prev.size ? prev : next;
      });
      setQuestionsForExportArray((prev) => {
        const next = prev.filter((id) => currentIds.has(id));
        return next.length === prev.length ? prev : next;
      });
    }
  }, [topicalData]);

  return (
    <>
      <div className="pt-16 relative z-10 flex flex-col w-full items-center justify-start p-4 overflow-hidden h-screen">
        {breadcrumbContent({
          setSortParameters,
          sortParameters,
          fullPartitionedData,
          currentChunkIndex,
          setCurrentChunkIndex,
          setDisplayedData,
          scrollAreaRef,
          isExportModeEnabled,
        })}

        {preContent}
        {mainContent}

        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton && displayedData?.length > 0
          }
          scrollAreaRef={scrollAreaRef}
        />

        {!isQuestionViewDisabled && displayedData?.length > 0 && (
          <ScrollArea
            viewportRef={scrollAreaRef}
            className="h-[70dvh] lg:h-[78dvh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
            type="always"
            viewPortOnScrollEnd={() => {
              if (scrollAreaRef.current?.scrollTop === 0) {
                setIsScrollingAndShouldShowScrollButton(false);
              } else {
                setIsScrollingAndShouldShowScrollButton(true);
              }
            }}
          >
            <div className="flex items-center justify-start gap-2">
              <p>{topicalData?.length} items</p>

              {!isExportModeEnabled && (
                <Button
                  onClick={() => setIsExportModeEnabled(true)}
                  className="bg-logo-main! text-white! cursor-pointer mb-2"
                >
                  Export
                  <ArrowRightFromLine />
                </Button>
              )}
            </div>
            <Masonry>
              {displayedData?.map((question) =>
                question?.questionImages.map((imageSrc: string) => (
                  <QuestionViewItem
                    key={`${question.id}-${imageSrc}`}
                    isQuestionForExport={questionsForExport.has(question.id)}
                    question={question}
                    handleQuestionClick={handleQuestionClick}
                    imageSrc={imageSrc}
                    isExportModeEnabled={isExportModeEnabled}
                  />
                ))
              )}
            </Masonry>

            {uiPreferences.layoutStyle === "infinite" && (
              <InfiniteScroll
                next={() => {
                  if (fullPartitionedData) {
                    setCurrentChunkIndex(currentChunkIndex + 1);
                    setDisplayedData([
                      ...displayedData,
                      ...(fullPartitionedData[currentChunkIndex + 1] ?? []),
                    ]);
                  }
                }}
                hasMore={
                  !!fullPartitionedData &&
                  currentChunkIndex < fullPartitionedData.length - 1
                }
                isLoading={!fullPartitionedData}
              />
            )}
          </ScrollArea>
        )}
      </div>
      {isExportModeEnabled && (
        <ExportBar
          allQuestions={
            topicalData ? topicalData.map((item) => item.question) : []
          }
          questionsForExport={questionsForExport}
          questionsForExportArray={questionsForExportArray}
          setIsExportModeEnabled={setIsExportModeEnabled}
          setQuestionsForExportArray={setQuestionsForExportArray}
          setQuestionsForExport={setQuestionsForExport}
        />
      )}
      {Array.isArray(topicalData) && topicalData.length > 0 && (
        <QuestionInspect
          ref={questionInspectRef}
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          partitionedTopicalData={fullPartitionedData}
          BETTER_AUTH_URL={BETTER_AUTH_URL}
          listId={listId}
        />
      )}
    </>
  );
};

export default SecondaryMainContent;

// Memoized wrapper with custom comparison to prevent unnecessary re-renders
const QuestionViewItem = memo(
  ({
    question,
    imageSrc,
    handleQuestionClick,
    isExportModeEnabled,
    isQuestionForExport,
  }: {
    question: SelectedQuestion;
    imageSrc: string;
    handleQuestionClick: (questionId: string) => void;
    isExportModeEnabled: boolean;
    isQuestionForExport: boolean;
  }) => {
    return (
      <div
        key={`${question.id}-${imageSrc}`}
        className={cn(
          "relative transition-all  duration-200 border-2 border-transparent ease-in-out w-full mb-[10px]",
          isQuestionForExport &&
            "transform-[scale(0.975)] border-logo-main rounded-md"
        )}
      >
        {isExportModeEnabled && (
          <div
            className="absolute z-20 top-2 left-2 w-max h-max"
            onClick={() => handleQuestionClick(question.id)}
          >
            <Checkbox
              className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main data-[state=checked]:text-white dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main h-5 w-5 bg-white dark:bg-white rounded-full  cursor-pointer"
              checked={isQuestionForExport}
            />
          </div>
        )}
        <QuestionPreview
          question={question}
          onQuestionClick={() => handleQuestionClick(question.id)}
          imageSrc={imageSrc}
          className="mb-0!"
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.question.id === nextProps.question.id &&
      prevProps.imageSrc === nextProps.imageSrc &&
      prevProps.handleQuestionClick === nextProps.handleQuestionClick &&
      prevProps.isExportModeEnabled === nextProps.isExportModeEnabled &&
      prevProps.isQuestionForExport === nextProps.isQuestionForExport
    );
  }
);

QuestionViewItem.displayName = "QuestionViewItem";
