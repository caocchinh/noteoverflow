"use client";
import React, { memo, useCallback, useMemo } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Loader2,
  OctagonAlert,
  RefreshCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { usePathname } from "next/navigation";
import {
  COLUMN_BREAKPOINTS,
  INFINITE_SCROLL_CHUNK_SIZE,
  MANSONRY_GUTTER_BREAKPOINTS,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import type {
  SortParameters,
  AppMainContentProps,
  QuestionInspectRef,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  updateSearchParams,
  isSubset,
  chunkQuestionsData,
} from "@/features/topical/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import AppUltilityBar from "@/features/topical/components/AppUltilityBar";
import { useMutationState } from "@tanstack/react-query";

const AppMainContent = ({
  mountedRef,
  currentQuery,
  topicalData,
  isSearchEnabled,
  isTopicalDataError,
  appUltilityBarRef,
  isTopicalDataFetching,
  isTopicalDataFetched,
  isValidSearchParams,
  BETTER_AUTH_URL,
  refetchTopicalData,
  searchParams,
  sideBarInsetRef,
  ultilityRef,
  filterUrl,
}: AppMainContentProps) => {
  const pathname = usePathname();
  const [openInspectOnMount, setOpenInspectOnMount] = useState(false);
  const [showFinishedQuestion, setShowFinishedQuestion] = useState(true);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const { uiPreferences } = useTopicalApp();

  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (currentQuery.curriculumId && currentQuery.subjectId) {
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        questionId: "",
        isInspectOpen: false,
      });
    }
  }, [currentQuery, mountedRef, uiPreferences.isStrictModeEnabled]);

  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);

  const processedData = useMemo(() => {
    if (!topicalData?.data) return null;

    const chunkSize =
      uiPreferences.layoutStyle === "pagination"
        ? uiPreferences.numberOfQuestionsPerPage
        : INFINITE_SCROLL_CHUNK_SIZE;

    const filteredStrictModeData = uiPreferences.isStrictModeEnabled
      ? topicalData.data.filter((item) => {
          return isSubset(item.topics, currentQuery.topic);
        })
      : topicalData.data;

    const sortedData = filteredStrictModeData.toSorted(
      (a: SelectedQuestion, b: SelectedQuestion) => {
        if (sortParameters.sortBy === "ascending") {
          return a.year - b.year;
        } else {
          // Default to year-desc
          return b.year - a.year;
        }
      }
    );

    const chunkedData = chunkQuestionsData(sortedData, chunkSize);

    return {
      sortedData,
      chunkedData,
    };
  }, [
    topicalData?.data,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    uiPreferences.isStrictModeEnabled,
    currentQuery.topic,
    sortParameters.sortBy,
  ]);

  // Memoized callbacks to prevent child re-renders
  const handleQuestionClick = useCallback((questionId: string) => {
    questionInspectRef.current?.setIsInspectOpen({
      isOpen: true,
      questionId,
    });
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (mainContentScrollAreaRef.current?.scrollTop === 0) {
      setIsScrollingAndShouldShowScrollButton(false);
    } else {
      setIsScrollingAndShouldShowScrollButton(true);
    }
  }, []);

  const handleRefetch = useCallback(() => {
    refetchTopicalData();
  }, [refetchTopicalData]);

  const handleInfiniteScrollNext = useCallback(() => {
    if (fullPartitionedData) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      setDisplayedData([
        ...displayedData,
        ...(fullPartitionedData[currentChunkIndex + 1] ?? []),
      ]);
    }
  }, [fullPartitionedData, currentChunkIndex, displayedData]);

  useEffect(() => {
    if (processedData) {
      setFullPartitionedData(processedData.chunkedData);
      setDisplayedData(processedData.chunkedData[0] ?? []);
      setCurrentChunkIndex(0);
      mainContentScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [processedData]);

  useEffect(() => {
    if (topicalData) {
      questionInspectRef.current?.setIsInspectOpen({
        isOpen: false,
        questionId: "",
      });
    }
  }, [topicalData, uiPreferences.isStrictModeEnabled]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    if (!uiPreferences.isQuestionCacheEnabled) {
      setOpenInspectOnMount(true);
      return;
    }
    if (!openInspectOnMount && topicalData) {
      try {
        const existingQuestionid = searchParams.questionId;

        if (existingQuestionid && typeof existingQuestionid === "string") {
          if (
            topicalData?.data.findIndex(
              (item) => item.id === existingQuestionid
            ) !== -1
          ) {
            questionInspectRef.current?.setIsInspectOpen({
              isOpen: searchParams.isInspectOpen === "true",
              questionId: existingQuestionid,
            });
          }
        }
      } finally {
        setOpenInspectOnMount(true);
      }
    }
  }, [
    uiPreferences.isQuestionCacheEnabled,
    openInspectOnMount,
    searchParams,
    topicalData,
    mountedRef,
  ]);

  useEffect(() => {
    mainContentScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentQuery]);

  const mainContentScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !isSearchEnabled ||
      displayedData.length === 0 ||
      isTopicalDataError ||
      !fullPartitionedData ||
      fullPartitionedData.length === 0 ||
      isTopicalDataFetching ||
      !isTopicalDataFetched
    );
  }, [
    isSearchEnabled,
    displayedData.length,
    isTopicalDataError,
    fullPartitionedData,
    isTopicalDataFetching,
    isTopicalDataFetched,
  ]);

  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (pathname === "/topical") {
      if (currentQuery.curriculumId && currentQuery.subjectId) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: questionInspectRef.current?.isInspectOpen.questionId
            ? questionInspectRef.current?.isInspectOpen.questionId
            : "",
          isInspectOpen: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      <SidebarInset
        className="!relative flex flex-col items-center justify-start !px-0 gap-4 p-4 pl-2 md:items-start w-full overflow-hidden"
        ref={sideBarInsetRef}
      >
        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton
          }
          scrollAreaRef={mainContentScrollAreaRef}
        />

        <AppUltilityBar
          fullPartitionedData={fullPartitionedData}
          ultilityRef={ultilityRef}
          ref={appUltilityBarRef}
          isQuestionViewDisabled={isQuestionViewDisabled}
          setIsQuestionInspectOpen={
            questionInspectRef.current?.setIsInspectOpen
          }
          scrollAreaRef={mainContentScrollAreaRef}
          currentChunkIndex={currentChunkIndex}
          setCurrentChunkIndex={setCurrentChunkIndex}
          setDisplayedData={setDisplayedData}
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          showFinishedQuestion={showFinishedQuestion}
          setShowFinishedQuestion={setShowFinishedQuestion}
          filterUrl={filterUrl}
          sideBarInsetRef={sideBarInsetRef}
        />

        <ScrollArea
          viewportRef={mainContentScrollAreaRef}
          className="h-[78vh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
          type="always"
          viewPortOnScrollEnd={handleScrollEnd}
        >
          {!isTopicalDataFetching &&
            !isTopicalDataFetched &&
            isValidSearchParams && (
              <div className="flex flex-col items-center justify-center w-full h-full mb-3 gap-2">
                <h1 className="w-full text-center font-bold text-2xl -mb-1">
                  Topical questions
                </h1>

                <div className="flex mb-1 flex-row items-center justify-center w-full gap-2 px-4 rounded-lg ">
                  <ArrowLeft
                    className="hidden md:block text-green-600 dark:text-green-700"
                    size={20}
                  />
                  <ArrowUp
                    className="md:hidden block text-green-600 dark:text-green-700"
                    size={20}
                  />
                  <span className="text-green-700 dark:text-green-700 text-lg text-center font-medium">
                    Use the sidebar/filter on the{" "}
                    <span className="hidden md:inline">left</span>
                    <span className="md:hidden inline">top</span> to search for
                    questions
                  </span>
                </div>

                <div className="flex flex-row flex-wrap w-full  gap-4 items-stretch justify-center">
                  <div className="w-full md:w-[377px] flex items-center justify-center flex-col gap-2  !max-w-full h-[inherit]  p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm ">
                    <h3 className="text-lg font-semibold text-center mb-3 text-orange-700 dark:text-orange-400">
                      Inspect Mode Keyboard Navigation
                    </h3>
                    <ul className=" flex items-center justify-center flex-col">
                      <li className="flex items-center flex-col gap-2 text-orange-600 dark:text-orange-400">
                        <div className="flex flex-row items-center gap-2">
                          <kbd className="px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded">
                            ↑↓
                          </kbd>
                          <span>or</span>
                          <kbd className="px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded">
                            WASD
                          </kbd>
                        </div>
                        <span>
                          to navigate between questions during inspect
                        </span>
                      </li>
                      <li className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                        <kbd className="px-2 py-1 bg-orange-100 dark:bg-orange-800 rounded">
                          E
                        </kbd>
                        <span>to toggle between questions and answers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="w-full md:w-[377px] !max-w-full h-[inherit] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm ">
                    <h3 className="text-lg font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">
                      Customize Your Experience
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      Scroll down to the bottom of the sidebar to adjust content
                      layout, cache behaviour, and visual settings to your
                      preference.
                    </p>
                  </div>

                  <div className="w-full md:w-[377px]  !max-w-full h-[inherit] p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-center mb-2 text-blue-700 dark:text-blue-400">
                      Track Your Progress
                    </h3>
                    <div className="flex flex-col gap-2 items-center justify-center">
                      <p className="text-blue-600 dark:text-blue-400 text-center">
                        Bookmark questions to create your personal list, share
                        with friends, and mark completed questions to track your
                        revision progress. Use the mini sidebar below to access
                        it.
                      </p>
                      <ArrowDown className="text-blue-700" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          {!isTopicalDataFetching &&
            !isTopicalDataFetched &&
            !isValidSearchParams && (
              <div className="text-red-500 text-center">
                Invalid URL parameters, or data has been outdated! Please input
                manually using the filter on the left.
              </div>
            )}

          {topicalData?.isRateLimited && (
            <p className="text-md text-center mb-2 text-red-600">
              Limited results displayed due to rate limiting. Sign in for
              complete access.
            </p>
          )}

          {topicalData?.isRateLimited &&
            window.location.href ===
              "https://noteoverflow.com/topical?queryKey=%7B%22curriculumId%22%3A%22CIE+A-LEVEL%22%2C%22subjectId%22%3A%22Physics+%289702%29%22%2C%22topic%22%3A%5B%22GRAVITATIONAL+FIELDS%22%2C%22MOTION+IN+A+CIRCLE%22%5D%2C%22paperType%22%3A%5B%224%22%5D%2C%22year%22%3A%5B%222025%22%2C%222024%22%2C%222023%22%2C%222022%22%2C%222021%22%2C%222020%22%2C%222019%22%2C%222018%22%2C%222017%22%2C%222016%22%2C%222015%22%2C%222014%22%2C%222013%22%2C%222012%22%2C%222011%22%2C%222010%22%2C%222009%22%5D%2C%22season%22%3A%5B%22Spring%22%2C%22Summer%22%2C%22Winter%22%5D%7D" && (
              <p className="text-md text-center mb-2 text-green-600">
                New user here? Look around these questions and try out the
                website, or use the filter at the top left to choose another
                subject
              </p>
            )}
          {isTopicalDataError &&
            !isTopicalDataFetching &&
            isTopicalDataFetched && (
              <div className="flex flex-col items-center justify-center w-full h-full mb-3">
                <div className="flex items-start justify-center gap-2">
                  <p className="text-md text-center mb-2 text-red-600">
                    An error occurred while fetching data. Please try again.
                  </p>
                  <OctagonAlert className="text-red-600" />
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefetch}
                  className="flex items-center justify-center gap-1 cursor-pointer"
                >
                  Refetch
                  <RefreshCcw />
                </Button>
              </div>
            )}
          {displayedData.length == 0 &&
            isTopicalDataFetched &&
            !isTopicalDataError &&
            !isTopicalDataFetching && (
              <div className="flex items-center justify-center w-full h-full">
                <p className="text-md text-center mb-2 text-red-600">
                  No questions found. Try changing the filters. Certain topics
                  may be paired with specific papers.
                </p>
              </div>
            )}

          {isTopicalDataFetching && (
            <Loader2 className="animate-spin m-auto mb-2" />
          )}
          <MainContent
            displayedData={displayedData}
            showFinishedQuestion={showFinishedQuestion}
            handleQuestionClick={handleQuestionClick}
            handleInfiniteScrollNext={handleInfiniteScrollNext}
            fullPartitionedData={fullPartitionedData}
            currentChunkIndex={currentChunkIndex}
            topicalData={topicalData?.data}
            isTopicalDataFetching={isTopicalDataFetching}
            isTopicalDataFetched={isTopicalDataFetched}
            isTopicalDataError={isTopicalDataError}
          />
        </ScrollArea>
      </SidebarInset>

      <QuestionInspect
        ref={questionInspectRef}
        partitionedTopicalData={fullPartitionedData}
        currentQuery={currentQuery}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        setSortParameters={setSortParameters}
        sortParameters={sortParameters}
      />
    </>
  );
};

export default AppMainContent;

export const MainContent = memo(
  ({
    showFinishedQuestion,
    displayedData,
    handleQuestionClick,
    handleInfiniteScrollNext,
    fullPartitionedData,
    currentChunkIndex,
    topicalData,
    isTopicalDataFetching,
    isTopicalDataFetched,
    isTopicalDataError,
  }: {
    isTopicalDataFetching: boolean;
    isTopicalDataFetched: boolean;
    isTopicalDataError: boolean;
    topicalData: SelectedQuestion[] | undefined;
    showFinishedQuestion: boolean;
    displayedData: SelectedQuestion[];
    handleQuestionClick: (questionId: string) => void;
    handleInfiniteScrollNext: () => void;
    fullPartitionedData: SelectedQuestion[][] | undefined;
    currentChunkIndex: number;
  }) => {
    const { uiPreferences, finishedQuestionsData } = useTopicalApp();

    const filteredDisplayData = displayedData.filter(
      (question: SelectedQuestion) => {
        if (!finishedQuestionsData) {
          return true;
        }
        if (
          !showFinishedQuestion &&
          finishedQuestionsData.some((item) => item.question.id === question.id)
        ) {
          return false;
        }
        return true;
      }
    );

    useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "finished_questions"],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    return (
      <>
        {topicalData && topicalData.length > 0 && (
          <p className="text-sm text-left mb-1">
            {filteredDisplayData.length} question
            {filteredDisplayData.length > 1 ? "s" : ""} found
          </p>
        )}

        {filteredDisplayData.length == 0 &&
          displayedData.length > 0 &&
          isTopicalDataFetched &&
          !isTopicalDataError &&
          !isTopicalDataFetching && (
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-md text-center mb-2 text-green">
                You finished everything!
              </p>
            </div>
          )}
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
            {filteredDisplayData?.map(
              (question) =>
                question?.questionImages.map((imageSrc: string) => (
                  <QuestionPreview
                    question={question}
                    onQuestionClick={() => handleQuestionClick(question.id)}
                    key={`${question.id}-${imageSrc}`}
                    imageSrc={imageSrc}
                  />
                )) ?? []
            )}
          </Masonry>
        </ResponsiveMasonry>

        {uiPreferences.layoutStyle === "infinite" && (
          <InfiniteScroll
            next={handleInfiniteScrollNext}
            hasMore={
              !!fullPartitionedData &&
              currentChunkIndex < fullPartitionedData.length - 1
            }
            isLoading={!fullPartitionedData}
          />
        )}
      </>
    );
  }
);

MainContent.displayName = "MainContent";
