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
import { useEffect, useRef, useState } from "react";
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
    questionInspectRef.current?.setIsInspectOpen({
      isOpen: true,
      questionId,
    });
  };

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
            <p>{topicalData?.length} items</p>

            <Masonry>
              {displayedData?.map((question) =>
                question?.questionImages.map((imageSrc: string) => (
                  <QuestionPreview
                    question={question}
                    onQuestionClick={() => handleQuestionClick(question.id)}
                    key={`${question.id}-${imageSrc}`}
                    imageSrc={imageSrc}
                    listId={listId}
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
