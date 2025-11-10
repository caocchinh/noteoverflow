"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import {
  COLUMN_BREAKPOINTS,
  MANSONRY_GUTTER_BREAKPOINTS,
} from "@/features/topical/constants/constants";
import type {
  SecondaryMainContentProps,
  SortableTopicalItem,
  SortParameters,
} from "@/features/topical/constants/types";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";

const SecondaryMainContent = ({
  topicalData,
  isQuestionViewDisabled,
  BETTER_AUTH_URL,
  listId,
  preContent,
  breadcrumbContent,
  mainContent,
  isQuestionInspectOpen,
  setIsQuestionInspectOpen,
}: SecondaryMainContentProps) => {
  const { uiPreferences } = useTopicalApp();
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const [fullPartitionedData, setFullPartitionedData] = useState<
    SortableTopicalItem[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SortableTopicalItem[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: "descending",
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Process topical data into chunks
  useEffect(() => {
    if (topicalData) {
      const chunkSize =
        uiPreferences.layoutStyle === "pagination"
          ? uiPreferences.numberOfQuestionsPerPage
          : 20; // INFINITE_SCROLL_CHUNK_SIZE equivalent

      const sortedData = topicalData.toSorted(
        (a: SortableTopicalItem, b: SortableTopicalItem) => {
          const aIndex = new Date(a.updatedAt || 0).getTime();
          const bIndex = new Date(b.updatedAt || 0).getTime();
          return sortParameters.sortBy === "descending"
            ? bIndex - aIndex
            : aIndex - bIndex;
        }
      );

      const chunkedData = sortedData.reduce(
        (
          acc: SortableTopicalItem[][],
          item: SortableTopicalItem,
          index: number
        ) => {
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
    setIsQuestionInspectOpen({
      isOpen: true,
      questionId,
    });
  };

  return (
    <>
      <div className="pt-16 relative z-[10] flex flex-col w-full items-center justify-start p-4 overflow-hidden h-screen">
        {breadcrumbContent}

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
            <p>{topicalData?.length} items</p>
            <ResponsiveMasonry
              columnsCountBreakPoints={
                COLUMN_BREAKPOINTS[
                  uiPreferences.numberOfColumns as keyof typeof COLUMN_BREAKPOINTS
                ]
              }
              // @ts-expect-error - gutterBreakPoints is not typed by the library
              gutterBreakPoints={MANSONRY_GUTTER_BREAKPOINTS}
            >
              <Masonry>
                {displayedData?.map((question) =>
                  question?.question.questionImages.map((imageSrc: string) => (
                    <QuestionPreview
                      question={question.question}
                      onQuestionClick={() =>
                        handleQuestionClick(question.question.id)
                      }
                      key={`${question.question.id}-${imageSrc}`}
                      imageSrc={imageSrc}
                      listId={listId}
                    />
                  ))
                )}
              </Masonry>
            </ResponsiveMasonry>

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

      {Array.isArray(topicalData) && topicalData.length > 0 && (
        <QuestionInspect
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          isOpen={isQuestionInspectOpen}
          setIsOpen={setIsQuestionInspectOpen}
          partitionedTopicalData={fullPartitionedData?.map((chunk) =>
            chunk.map((item) => item.question)
          )}
          BETTER_AUTH_URL={BETTER_AUTH_URL}
          listId={listId}
          isInspectSidebarOpen={isInspectSidebarOpen}
          setIsInspectSidebarOpen={setIsInspectSidebarOpen}
        />
      )}
    </>
  );
};

export default SecondaryMainContent;
