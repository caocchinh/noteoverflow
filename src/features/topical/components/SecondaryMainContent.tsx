"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";

import { Checkbox } from "@/components/ui/checkbox";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { cn } from "@/lib/utils";
import { memo, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { SecondaryMainContentProps } from "../types/components";
import { SelectedQuestion, SortableTopicalItem, SortParameters } from "../types/models";
import ExportBar from "./ExportMode/ExportBar";
import ExportDisabledDialog from "./ExportMode/ExportDisabledDialog";
import Masonry from "./Masonry";

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
  const [isScrollingAndShouldShowScrollButton, setIsScrollingAndShouldShowScrollButton] =
    useState(false);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [infiniteScrollLoadedChunks, setInfiniteScrollLoadedChunks] = useState(1);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: "descending",
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [questionsForExport, setQuestionsForExport] = useState<Set<string>>(new Set());
  const [questionsForExportArray, setQuestionsForExportArray] = useState<string[]>([]);
  const questionsForExportRef = useRef(questionsForExport);

  const [isExportModeEnabled, setIsExportModeEnabled] = useState(false);

  // Reset state when data changes
  const onDataChange = useEffectEvent(() => {
    setCurrentChunkIndex(0);
    setInfiniteScrollLoadedChunks(1);
  });

  useEffect(() => {
    questionsForExportRef.current = questionsForExport;
  }, [questionsForExport]);

  // Derive partitioned data using useMemo (not useState + useEffect)
  const fullPartitionedData = useMemo(() => {
    if (!topicalData) return undefined;

    const chunkSize =
      uiPreferences.layoutStyle === "pagination" ? uiPreferences.numberOfQuestionsPerPage : 20; // INFINITE_SCROLL_CHUNK_SIZE equivalent

    const sortedData = topicalData
      .toSorted((a: SortableTopicalItem, b: SortableTopicalItem) => {
        const aIndex = new Date(a.updatedAt || 0).getTime();
        const bIndex = new Date(b.updatedAt || 0).getTime();
        return sortParameters.sortBy === "descending" ? bIndex - aIndex : aIndex - bIndex;
      })
      .map((item) => item.question);

    return sortedData.reduce((acc: SelectedQuestion[][], item: SelectedQuestion, index: number) => {
      const chunkIndex = Math.floor(index / chunkSize);
      if (!acc[chunkIndex]) {
        acc[chunkIndex] = [];
      }
      acc[chunkIndex].push(item);
      return acc;
    }, []);
  }, [
    topicalData,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    sortParameters.sortBy,
  ]);

  // Handle side effects when data changes (reset pagination, scroll to top)
  useEffect(() => {
    if (topicalData) {
      onDataChange();
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

  // Derive displayed data based on layout style
  const displayedData = useMemo(() => {
    if (!fullPartitionedData) return [];

    if (uiPreferences.layoutStyle === "pagination") {
      return fullPartitionedData[currentChunkIndex] ?? [];
    } else {
      return fullPartitionedData.slice(0, infiniteScrollLoadedChunks).flat();
    }
  }, [
    fullPartitionedData,
    currentChunkIndex,
    infiniteScrollLoadedChunks,
    uiPreferences.layoutStyle,
  ]);

  const handleQuestionClick = useCallback(
    (questionId: string) => {
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
    },
    [isExportModeEnabled, questionInspectRef],
  );

  // Sync export selections when topicalData changes (cleanup stale selections)
  const syncExportSelections = useEffectEvent(() => {
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
  });

  useEffect(() => {
    syncExportSelections();
  }, [topicalData]);

  return (
    <>
      <div className="relative z-10 flex h-screen w-full flex-col items-center justify-start overflow-hidden p-4 pt-16">
        {breadcrumbContent({
          setSortParameters,
          sortParameters,
          fullPartitionedData,
          currentChunkIndex,
          setCurrentChunkIndex,
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
            className="[&_.bg-border]:bg-logo-main h-[70dvh] w-full overflow-auto px-4 lg:h-[78dvh]"
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
                <ExportDisabledDialog variant="secondary" buttonClassName="mb-2" />
              )}
            </div>
            <Masonry
              items={displayedData?.flatMap((question) =>
                question?.questionImages.map((imageSrc: string, imageIndex: number) => ({
                  element: (
                    <QuestionViewItem
                      key={`${question.id}-${imageSrc}`}
                      isQuestionForExport={questionsForExport.has(question.id)}
                      question={question}
                      handleQuestionClick={handleQuestionClick}
                      imageSrc={imageSrc}
                      isExportModeEnabled={isExportModeEnabled}
                      imageWidth={question.questionImagesDimensions?.[imageIndex]?.width}
                      imageHeight={question.questionImagesDimensions?.[imageIndex]?.height}
                    />
                  ),
                  width: question.questionImagesDimensions?.[imageIndex]?.width,
                  height: question.questionImagesDimensions?.[imageIndex]?.height,
                })),
              )}
            />

            {uiPreferences.layoutStyle === "infinite" && (
              <InfiniteScroll
                next={() => {
                  if (fullPartitionedData) {
                    setCurrentChunkIndex(currentChunkIndex + 1);
                    setInfiniteScrollLoadedChunks((prev) => prev + 1);
                  }
                }}
                hasMore={
                  !!fullPartitionedData && currentChunkIndex < fullPartitionedData.length - 1
                }
                isLoading={!fullPartitionedData}
              />
            )}
          </ScrollArea>
        )}
      </div>
      {isExportModeEnabled && (
        <ExportBar
          allQuestions={topicalData ? topicalData.map((item) => item.question) : []}
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
    imageWidth,
    imageHeight,
  }: {
    question: SelectedQuestion;
    imageSrc: string;
    handleQuestionClick: (questionId: string) => void;
    isExportModeEnabled: boolean;
    isQuestionForExport: boolean;
    imageWidth: number | undefined;
    imageHeight: number | undefined;
  }) => {
    return (
      <div
        key={`${question.id}-${imageSrc}`}
        className={cn(
          "relative mb-[10px] w-full border-2 border-transparent transition-all duration-200 ease-in-out",
          isQuestionForExport && "border-logo-main transform-[scale(0.975)] rounded-md",
        )}
      >
        {isExportModeEnabled && (
          <div
            className="absolute top-2 left-2 z-20 h-max w-max"
            onClick={() => handleQuestionClick(question.id)}
          >
            <Checkbox
              className="data-[state=checked]:border-logo-main data-[state=checked]:bg-logo-main dark:data-[state=checked]:border-logo-main dark:data-[state=checked]:bg-logo-main h-5 w-5 cursor-pointer rounded-full bg-white data-[state=checked]:text-white dark:bg-white"
              checked={isQuestionForExport}
            />
          </div>
        )}
        <QuestionPreview
          question={question}
          onQuestionClick={() => handleQuestionClick(question.id)}
          imageSrc={imageSrc}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          className="mb-0!"
          showCurriculumBadge={false}
          showSubjectBadge={false}
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
  },
);

QuestionViewItem.displayName = "QuestionViewItem";
