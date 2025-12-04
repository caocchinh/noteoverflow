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
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import ExportBar from "./ExportBar";
import IntergrationTips from "./IntergrationTips";

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
  isExportModeEnabled,
  setIsExportModeEnabled,
}: AppMainContentProps) => {
  const pathname = usePathname();
  const [openInspectOnMount, setOpenInspectOnMount] = useState(false);
  const [showFinishedQuestion, setShowFinishedQuestion] = useState(true);
  const [questionsForExport, setQuestionsForExport] = useState<Set<string>>(
    new Set()
  );
  const questionsForExportRef = useRef(questionsForExport);
  questionsForExportRef.current = questionsForExport;
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const {
    uiPreferences,
    finishedQuestionsData,
    isAppSidebarOpen,
    setIsAppSidebarOpen,
  } = useTopicalApp();

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
  const [
    finishedQuestionsFilteredPartitionedData,
    setFinishedQuestionsFilteredPartitionedData,
  ] = useState<SelectedQuestion[][] | undefined>(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [
    finishedQuestionsFilteredDisplayData,
    setFinishedQuestionsFilteredDisplayData,
  ] = useState<SelectedQuestion[]>([]);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });
  const questionInspectRef = useRef<QuestionInspectRef | null>(null);
  const previousSidebarOpenRef = useRef(isAppSidebarOpen);
  const mainContentScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const doesSearchYieldAnyQuestions = (topicalData?.data?.length ?? 0) > 0;

  const onSettledFinishedQuestion = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "finished_questions"],
      predicate: (mutation) =>
        (mutation.state.status === "success" ||
          mutation.state.status === "error") &&
        !showFinishedQuestion,
    },
  });

  useEffect(() => {
    if (isExportModeEnabled) {
      previousSidebarOpenRef.current = isAppSidebarOpen;
      setIsAppSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExportModeEnabled, setIsAppSidebarOpen]);

  useEffect(() => {
    if (!isExportModeEnabled) {
      setIsAppSidebarOpen(previousSidebarOpenRef.current);
    }
  }, [isExportModeEnabled, setIsAppSidebarOpen]);

  const chunkedData = useMemo(() => {
    if (!topicalData?.data) return null;

    const chunkSize =
      uiPreferences.layoutStyle === "pagination"
        ? uiPreferences.numberOfQuestionsPerPage
        : INFINITE_SCROLL_CHUNK_SIZE;

    return chunkQuestionsData(topicalData.data, chunkSize);
  }, [
    topicalData,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
  ]);

  const filteredProcessedData = useMemo(() => {
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

    const filteredFinishedData = filteredStrictModeData.filter((question) => {
      if (!finishedQuestionsData) return true;
      if (
        !showFinishedQuestion &&
        finishedQuestionsData.some((item) => item.question.id === question.id)
      ) {
        return false;
      }
      return true;
    });

    const sortedData = filteredFinishedData.toSorted(
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    topicalData,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    uiPreferences.isStrictModeEnabled,
    currentQuery.topic,
    finishedQuestionsData,
    showFinishedQuestion,
    onSettledFinishedQuestion,
    sortParameters.sortBy,
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
        return;
      }
      questionInspectRef.current?.setIsInspectOpen({
        isOpen: true,
        questionId,
      });
    },
    [isExportModeEnabled]
  );

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
    if (finishedQuestionsFilteredPartitionedData) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      setFinishedQuestionsFilteredDisplayData([
        ...finishedQuestionsFilteredDisplayData,
        ...(finishedQuestionsFilteredPartitionedData[currentChunkIndex + 1] ??
          []),
      ]);
    }
  }, [
    finishedQuestionsFilteredPartitionedData,
    currentChunkIndex,
    finishedQuestionsFilteredDisplayData,
  ]);

  useEffect(() => {
    if (chunkedData && filteredProcessedData) {
      setFullPartitionedData(chunkedData);
      setFinishedQuestionsFilteredPartitionedData(
        filteredProcessedData.chunkedData
      );
      setFinishedQuestionsFilteredDisplayData(
        filteredProcessedData.chunkedData[0] ?? []
      );
      setCurrentChunkIndex(0);
      mainContentScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [chunkedData, filteredProcessedData]);

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

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !isSearchEnabled ||
      !doesSearchYieldAnyQuestions ||
      isTopicalDataError ||
      !fullPartitionedData ||
      fullPartitionedData.length === 0 ||
      isTopicalDataFetching ||
      !isTopicalDataFetched
    );
  }, [
    isSearchEnabled,
    doesSearchYieldAnyQuestions,
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
        className="relative! flex flex-col items-center justify-start px-0! gap-2 p-4 pl-2 md:items-start w-full overflow-hidden"
        ref={sideBarInsetRef}
      >
        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton
          }
          scrollAreaRef={mainContentScrollAreaRef}
        />

        <AppUltilityBar
          finishedQuestionsFilteredPartitionedData={
            finishedQuestionsFilteredPartitionedData
          }
          ultilityRef={ultilityRef}
          ref={appUltilityBarRef}
          isQuestionViewDisabled={isQuestionViewDisabled}
          setIsQuestionInspectOpen={
            questionInspectRef.current?.setIsInspectOpen
          }
          scrollAreaRef={mainContentScrollAreaRef}
          currentChunkIndex={currentChunkIndex}
          setCurrentChunkIndex={setCurrentChunkIndex}
          setFinishedQuestionsFilteredDisplayData={
            setFinishedQuestionsFilteredDisplayData
          }
          sortParameters={sortParameters}
          setSortParameters={setSortParameters}
          showFinishedQuestion={showFinishedQuestion}
          setShowFinishedQuestion={setShowFinishedQuestion}
          filterUrl={filterUrl}
          sideBarInsetRef={sideBarInsetRef}
          isExportModeEnabled={isExportModeEnabled}
          setIsExportModeEnabled={setIsExportModeEnabled}
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
                  <div className="w-full md:w-[377px] flex items-center justify-center flex-col gap-2 max-w-full! h-[inherit]  p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg shadow-sm ">
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

                  <div className="w-full md:w-[377px] max-w-full! h-[inherit] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm ">
                    <h3 className="text-lg font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">
                      Customize Your Experience
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      Scroll down to the bottom of the sidebar to adjust content
                      layout, cache behaviour, and visual settings to your
                      preference.
                    </p>
                  </div>

                  <div className="w-full md:w-[377px] max-w-full! h-[inherit] p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
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
            )}{" "}
          {!doesSearchYieldAnyQuestions &&
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
          {doesSearchYieldAnyQuestions && (
            <p className="text-sm text-left mb-1">
              {topicalData?.data.length ?? 0} question
              {topicalData?.data.length ?? 0 > 1 ? "s" : ""} found,{" "}
              {filteredProcessedData?.sortedData.length ?? 0} displayed
            </p>
          )}
          {currentChunkIndex === 0 &&
            isTopicalDataFetched &&
            !isTopicalDataError &&
            !isTopicalDataFetching &&
            currentQuery.topic.includes("INTEGRATION") && <IntergrationTips />}
          {finishedQuestionsFilteredDisplayData.length == 0 &&
            currentChunkIndex == 0 &&
            doesSearchYieldAnyQuestions &&
            isTopicalDataFetched &&
            !isTopicalDataError &&
            !isTopicalDataFetching && (
              <div className="flex items-center justify-center w-full h-full flex-col gap-2">
                <p className="text-xl font-semibold text-center text-green-700">
                  You finished everything!
                </p>
                <Image
                  src="/assets/elon-musk-elon-dance.gif"
                  alt="Elon Musk"
                  height={400}
                  width={400}
                  className="rounded-md"
                />
              </div>
            )}
          {isTopicalDataFetching && (
            <Loader2 className="animate-spin m-auto mb-2" />
          )}
          <MainContent
            doesSearchYieldAnyQuestions={doesSearchYieldAnyQuestions}
            filteredDisplayData={finishedQuestionsFilteredDisplayData}
            questionsForExport={questionsForExport}
            isExportModeEnabled={isExportModeEnabled}
            handleQuestionClick={handleQuestionClick}
            handleInfiniteScrollNext={handleInfiniteScrollNext}
            finishedQuestionsFilteredPartitionedData={
              finishedQuestionsFilteredPartitionedData
            }
            currentChunkIndex={currentChunkIndex}
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
      {isExportModeEnabled && (
        <ExportBar
          allQuestions={topicalData?.data ?? []}
          questionsForExport={questionsForExport}
          setIsExportModeEnabled={setIsExportModeEnabled}
          setQuestionsForExport={setQuestionsForExport}
        />
      )}
    </>
  );
};

export default AppMainContent;

export const MainContent = memo(
  ({
    filteredDisplayData,
    questionsForExport,
    isExportModeEnabled,
    handleQuestionClick,
    handleInfiniteScrollNext,
    finishedQuestionsFilteredPartitionedData,
    currentChunkIndex,
  }: {
    doesSearchYieldAnyQuestions: boolean;
    filteredDisplayData: SelectedQuestion[];
    questionsForExport: Set<string>;
    isExportModeEnabled: boolean;
    handleQuestionClick: (questionId: string) => void;
    handleInfiniteScrollNext: () => void;
    finishedQuestionsFilteredPartitionedData: SelectedQuestion[][] | undefined;
    currentChunkIndex: number;
  }) => {
    const { uiPreferences } = useTopicalApp();

    return (
      <>
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
            {filteredDisplayData?.map((question) =>
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
        </ResponsiveMasonry>

        {uiPreferences.layoutStyle === "infinite" && (
          <InfiniteScroll
            next={handleInfiniteScrollNext}
            hasMore={
              !!finishedQuestionsFilteredPartitionedData &&
              currentChunkIndex <
                finishedQuestionsFilteredPartitionedData.length - 1
            }
            isLoading={!finishedQuestionsFilteredPartitionedData}
          />
        )}
      </>
    );
  }
);

MainContent.displayName = "MainContent";

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
          "relative transition-all duration-200 border-2 border-transparent ease-in-out w-full ",
          isQuestionForExport &&
            "transform-[scale(0.975)]  border-logo-main rounded-md"
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
