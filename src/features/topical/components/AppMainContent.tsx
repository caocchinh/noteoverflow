"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset } from "@/components/ui/sidebar";
import AppUltilityBar from "@/features/topical/components/AppUltilityBar";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { useExportMode, useQuestionData, useQuestionInspect } from "@/features/topical/hooks";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, OctagonAlert, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { AppMainContentProps } from "../types/components";
import { DisplayMode, SelectedQuestion } from "../types/models";
import DisplayModeToggle from "./DisplayModeToggle";
import ExportBar from "./ExportMode/ExportBar";
import IntergrationTips from "./IntergrationTips";
import Masonry from "./Masonry";

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
  const [isScrollingAndShouldShowScrollButton, setIsScrollingAndShouldShowScrollButton] =
    useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("questions");

  // Hooks
  const {
    sortParameters,
    setSortParameters,
    showFinishedQuestion,
    setShowFinishedQuestion,
    currentChunkIndex,
    setCurrentChunkIndex,
    fullPartitionedData,
    finishedQuestionsFilteredPartitionedData,
    filteredProcessedData,
    doesSearchYieldAnyQuestions,
    finishedQuestionsFilteredDisplayData,
    handleInfiniteScrollNext,
    mainContentScrollAreaRef,
  } = useQuestionData({
    topicalData,
    currentQuery,
  });

  const {
    questionsForExport,
    questionsForExportArray,
    setQuestionsForExport,
    setQuestionsForExportArray,
    toggleQuestionSelection,
    useAllQuestions,
    useNoQuestions,
  } = useExportMode({
    isExportModeEnabled,
    setIsExportModeEnabled,
    allQuestions: filteredProcessedData?.filteredFinishedData ?? [],
  });

  const { isInspectOpen, setIsInspectOpen } = useQuestionInspect({
    mountedRef,
    currentQuery,
    topicalData,
    searchParams,
  });

  const handleQuestionClick = useCallback(
    (questionId: string) => {
      if (isExportModeEnabled) {
        toggleQuestionSelection(questionId);
        return;
      }
      setIsInspectOpen({
        isOpen: true,
        questionId,
      });
    },
    [isExportModeEnabled, toggleQuestionSelection, setIsInspectOpen],
  );

  const handleScrollEnd = useCallback(() => {
    if (mainContentScrollAreaRef.current?.scrollTop === 0) {
      setIsScrollingAndShouldShowScrollButton(false);
    } else {
      setIsScrollingAndShouldShowScrollButton(true);
    }
  }, [mainContentScrollAreaRef]);

  const handleRefetch = useCallback(() => {
    refetchTopicalData();
  }, [refetchTopicalData]);

  const isQuestionViewDisabled =
    !isSearchEnabled ||
    !doesSearchYieldAnyQuestions ||
    isTopicalDataError ||
    !fullPartitionedData ||
    fullPartitionedData.length === 0 ||
    isTopicalDataFetching ||
    !isTopicalDataFetched;

  return (
    <>
      <SidebarInset
        className="relative! flex w-full flex-col items-center justify-start gap-2 overflow-hidden p-4 px-0! pl-2 md:items-start"
        ref={sideBarInsetRef}
      >
        <ScrollToTopButton
          isScrollingAndShouldShowScrollButton={isScrollingAndShouldShowScrollButton}
          scrollAreaRef={mainContentScrollAreaRef}
        />

        <AppUltilityBar
          finishedQuestionsFilteredPartitionedData={finishedQuestionsFilteredPartitionedData}
          ultilityRef={ultilityRef}
          ref={appUltilityBarRef}
          isQuestionViewDisabled={isQuestionViewDisabled}
          setIsQuestionInspectOpen={setIsInspectOpen}
          scrollAreaRef={mainContentScrollAreaRef}
          currentChunkIndex={currentChunkIndex}
          setCurrentChunkIndex={setCurrentChunkIndex}
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
          className="[&_.bg-border]:bg-logo-main h-[78vh] w-full overflow-auto px-4"
          type="always"
          viewPortOnScrollEnd={handleScrollEnd}
        >
          {!isTopicalDataFetching && !isTopicalDataFetched && isValidSearchParams && (
            <div className="mb-3 flex h-full w-full flex-col items-center justify-center gap-2">
              <h1 className="-mb-1 w-full text-center text-2xl font-bold">Topical questions</h1>

              <div className="mb-1 flex w-full flex-row items-center justify-center gap-2 rounded-lg px-4">
                <ArrowLeft
                  className="hidden text-green-600 md:block dark:text-green-700"
                  size={20}
                />
                <ArrowUp className="block text-green-600 md:hidden dark:text-green-700" size={20} />
                <span className="text-center text-lg font-medium text-green-700 dark:text-green-700">
                  Use the sidebar/filter on the <span className="hidden md:inline">left</span>
                  <span className="inline md:hidden">top</span> to search for questions
                </span>
              </div>

              <div className="flex w-full flex-row flex-wrap items-stretch justify-center gap-4">
                <div className="flex h-[inherit] w-full max-w-full! flex-col items-center justify-center gap-2 rounded-lg bg-orange-50 p-3 shadow-sm md:w-[377px] dark:bg-orange-900/20">
                  <h3 className="mb-3 text-center text-lg font-semibold text-orange-700 dark:text-orange-400">
                    Inspect Mode Keyboard Navigation
                  </h3>
                  <ul className="flex flex-col items-center justify-center">
                    <li className="flex flex-col items-center gap-2 text-orange-600 dark:text-orange-400">
                      <div className="flex flex-row items-center gap-2">
                        <kbd className="rounded bg-orange-100 px-2 py-1 dark:bg-orange-800">↑↓</kbd>
                        <span>or</span>
                        <kbd className="rounded bg-orange-100 px-2 py-1 dark:bg-orange-800">
                          WASD
                        </kbd>
                      </div>
                      <span>to navigate between questions during inspect</span>
                    </li>
                    <li className="flex items-center gap-3 text-orange-600 dark:text-orange-400">
                      <kbd className="rounded bg-orange-100 px-2 py-1 dark:bg-orange-800">E</kbd>
                      <span>to toggle between questions and answers</span>
                    </li>
                  </ul>
                </div>

                <div className="h-[inherit] w-full max-w-full! rounded-lg bg-gray-50 p-3 shadow-sm md:w-[377px] dark:bg-gray-800/50">
                  <h3 className="mb-2 text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                    Customize Your Experience
                  </h3>
                  <p className="text-center text-gray-600 dark:text-gray-400">
                    Scroll down to the bottom of the sidebar to adjust content layout, cache
                    behaviour, and visual settings to your preference.
                  </p>
                </div>

                <div className="h-[inherit] w-full max-w-full! rounded-lg bg-blue-50 p-3 shadow-sm md:w-[377px] dark:bg-blue-900/20">
                  <h3 className="mb-2 text-center text-lg font-semibold text-blue-700 dark:text-blue-400">
                    Track Your Progress
                  </h3>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-center text-blue-600 dark:text-blue-400">
                      Bookmark questions to create your personal list, share with friends, and mark
                      completed questions to track your revision progress. Use the mini sidebar
                      below to access it.
                    </p>
                    <ArrowDown className="text-blue-700" />
                  </div>
                </div>
              </div>
            </div>
          )}
          {!isTopicalDataFetching && !isTopicalDataFetched && !isValidSearchParams && (
            <div className="text-center text-red-500">
              Invalid URL parameters, or data has been outdated! Please input manually using the
              filter on the left.
            </div>
          )}
          {topicalData?.isRateLimited && (
            <p className="text-md mb-2 text-center text-red-600">
              Limited results displayed due to rate limiting. Sign in for complete access.
            </p>
          )}
          {topicalData?.isRateLimited &&
            window.location.href ===
              "https://noteoverflow.com/topical?queryKey=%7B%22curriculumId%22%3A%22CIE+A-LEVEL%22%2C%22subjectId%22%3A%22Physics+%289702%29%22%2C%22topic%22%3A%5B%22GRAVITATIONAL+FIELDS%22%2C%22MOTION+IN+A+CIRCLE%22%5D%2C%22paperType%22%3A%5B%224%22%5D%2C%22year%22%3A%5B%222025%22%2C%222024%22%2C%222023%22%2C%222022%22%2C%222021%22%2C%222020%22%2C%222019%22%2C%222018%22%2C%222017%22%2C%222016%22%2C%222015%22%2C%222014%22%2C%222013%22%2C%222012%22%2C%222011%22%2C%222010%22%2C%222009%22%5D%2C%22season%22%3A%5B%22Spring%22%2C%22Summer%22%2C%22Winter%22%5D%7D" && (
              <p className="text-md mb-2 text-center text-green-600">
                New user here? Look around these questions and try out the website, or use the
                filter at the top left to choose another subject
              </p>
            )}
          {isTopicalDataError && !isTopicalDataFetching && isTopicalDataFetched && (
            <div className="mb-3 flex h-full w-full flex-col items-center justify-center">
              <div className="flex items-start justify-center gap-2">
                <p className="text-md mb-2 text-center text-red-600">
                  An error occurred while fetching data. Please try again.
                </p>
                <OctagonAlert className="text-red-600" />
              </div>
              <Button
                variant="outline"
                onClick={handleRefetch}
                className="flex cursor-pointer items-center justify-center gap-1"
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
              <div className="flex h-full w-full items-center justify-center">
                <p className="text-md mb-2 text-center text-red-600">
                  No questions found. Try changing the filters. Certain topics may be paired with
                  specific papers.
                </p>
              </div>
            )}
          {doesSearchYieldAnyQuestions && (
            <div className="mb-3 flex items-center justify-start gap-2">
              <p className="text-muted-foreground text-sm font-medium">
                <span className="text-foreground font-bold">{topicalData?.data.length ?? 0}</span>{" "}
                question
                {(topicalData?.data.length ?? 0) > 1 ? "s" : ""} found,{" "}
                <span className="text-foreground font-bold">
                  {filteredProcessedData?.filteredFinishedData.length ?? 0}
                </span>{" "}
                displayed
              </p>
              <DisplayModeToggle displayMode={displayMode} setDisplayMode={setDisplayMode} />
            </div>
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
              <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                <p className="text-center text-xl font-semibold text-green-700">
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
          {isTopicalDataFetching && <Loader2 className="m-auto mb-2 animate-spin" />}
          <MainContent
            doesSearchYieldAnyQuestions={doesSearchYieldAnyQuestions}
            filteredDisplayData={finishedQuestionsFilteredDisplayData}
            questionsForExport={questionsForExport}
            isExportModeEnabled={isExportModeEnabled}
            handleQuestionClick={handleQuestionClick}
            handleInfiniteScrollNext={handleInfiniteScrollNext}
            finishedQuestionsFilteredPartitionedData={finishedQuestionsFilteredPartitionedData}
            currentChunkIndex={currentChunkIndex}
            displayMode={displayMode}
          />
        </ScrollArea>
      </SidebarInset>

      <QuestionInspect
        isInspectOpen={isInspectOpen}
        setIsInspectOpen={setIsInspectOpen}
        partitionedTopicalData={fullPartitionedData}
        currentQuery={currentQuery}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        setSortParameters={setSortParameters}
        sortParameters={sortParameters}
      />
      {isExportModeEnabled && (
        <ExportBar
          allQuestions={filteredProcessedData?.filteredFinishedData ?? []}
          questionsForExport={questionsForExport}
          questionsForExportArray={questionsForExportArray}
          setIsExportModeEnabled={setIsExportModeEnabled}
          setQuestionsForExportArray={setQuestionsForExportArray}
          setQuestionsForExport={setQuestionsForExport}
          useAllQuestions={useAllQuestions}
          useNoQuestions={useNoQuestions}
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
    displayMode,
  }: {
    doesSearchYieldAnyQuestions: boolean;
    filteredDisplayData: SelectedQuestion[];
    questionsForExport: Set<string>;
    isExportModeEnabled: boolean;
    handleQuestionClick: (questionId: string) => void;
    handleInfiniteScrollNext: () => void;
    finishedQuestionsFilteredPartitionedData: SelectedQuestion[][] | undefined;
    currentChunkIndex: number;
    displayMode: DisplayMode;
  }) => {
    const { uiPreferences } = useTopicalApp();
    const isImageUrl = (str: string) => str.startsWith("http");

    return (
      <>
        <Masonry
          items={filteredDisplayData?.flatMap((question) => {
            const imagesToShow =
              displayMode === "questions"
                ? question.questionImages
                : question.answers.filter((answer) => isImageUrl(answer));

            const dimensionsToUse =
              displayMode === "questions"
                ? question.questionImagesDimensions
                : question.answersImagesDimensions;

            return imagesToShow.map((imageSrc: string, imageIndex: number) => ({
              element: (
                <QuestionViewItem
                  key={`${question.id}-${imageSrc}`}
                  isQuestionForExport={questionsForExport.has(question.id)}
                  question={question}
                  handleQuestionClick={handleQuestionClick}
                  imageSrc={imageSrc}
                  isExportModeEnabled={isExportModeEnabled}
                  imageWidth={dimensionsToUse?.[imageIndex]?.width}
                  imageHeight={dimensionsToUse?.[imageIndex]?.height}
                />
              ),
              width: dimensionsToUse?.[imageIndex]?.width,
              height: dimensionsToUse?.[imageIndex]?.height,
            }));
          })}
        />

        {uiPreferences.layoutStyle === "infinite" && (
          <InfiniteScroll
            next={handleInfiniteScrollNext}
            hasMore={
              !!finishedQuestionsFilteredPartitionedData &&
              currentChunkIndex < finishedQuestionsFilteredPartitionedData.length - 1
            }
            isLoading={!finishedQuestionsFilteredPartitionedData}
          />
        )}
      </>
    );
  },
);

MainContent.displayName = "MainContent";

// Memoized wrapper with custom comparison to prevent unnecessary re-renders
const QuestionViewItem = memo(
  ({
    question,
    imageSrc,
    imageWidth,
    imageHeight,
    handleQuestionClick,
    isExportModeEnabled,
    isQuestionForExport,
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
