import { InspectTriggerButton } from "@/features/topical/components/AppUltilityBar";
import DisplayModeToggle from "@/features/topical/components/DisplayModeToggle";
import Masonry from "@/features/topical/components/Masonry";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { DEFAULT_SORT_OPTIONS } from "@/features/topical/constants/constants";
import TopicalLayoutProvider from "@/features/topical/context/TopicalLayoutProvider";
import { chunkQuestionsData } from "@/features/topical/lib/utils";
import { QuestionInspectRef } from "@/features/topical/types/components";
import { SortParameters, VectorizeSelectedQuestion } from "@/features/topical/types/models";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SearchResultsHeaderProps } from "../constants/type";
import Ultility from "./Ultility";

const isImageUrl = (str: string) => str.startsWith("http");

type DisplayMode = "questions" | "answers";

const SearchResultsHeader = memo(
  ({
    resultCount,
    displayMode,
    setDisplayMode,
    currentTab,
    onInspectOpen,
    sortParameters,
    setSortParameters,
    isSticky,
  }: SearchResultsHeaderProps) => {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-2 transition-all duration-300",
          isSticky
            ? "bg-background/80 animate-in slide-in-from-top-2 fixed top-13 right-0 left-0 z-20 border-b px-4 py-2 shadow-sm backdrop-blur-md"
            : "animate-in fade-in slide-in-from-bottom-8 relative mb-6 px-2 duration-700",
        )}
      >
        <div className="mb-1 flex items-center gap-3 px-2">
          <p className="text-muted-foreground text-sm font-medium">
            Found <span className="text-foreground font-bold">{resultCount}</span>{" "}
            {displayMode === "questions" ? "question" : "answer"}
            {resultCount !== 1 ? "s" : ""}
          </p>
          <DisplayModeToggle displayMode={displayMode} setDisplayMode={setDisplayMode} />
          {currentTab == "text" && (
            <ShareFilter
              isDisabled={false}
              url={typeof window !== "undefined" ? window.location.href : ""}
              type="search result"
            />
          )}
        </div>
        {resultCount > 0 && (
          <div className="mb-1 flex items-center justify-between gap-2">
            <InspectTriggerButton
              isQuestionViewDisabled={false}
              setIsQuestionInspectOpen={onInspectOpen}
            />
            <Ultility sortParameters={sortParameters} setSortParameters={setSortParameters} />
          </div>
        )}
      </div>
    );
  },
);
SearchResultsHeader.displayName = "SearchResultsHeader";

const MainContent = memo(
  ({
    results,
    isSearching,
    currentTab,
    enableSavedActivitiesQuery = true,
  }: {
    results: VectorizeSelectedQuestion[] | null;
    isSearching: boolean;
    currentTab: "text" | "image";
    enableSavedActivitiesQuery?: boolean;
  }) => {
    const questionInspectRef = useRef<QuestionInspectRef | null>(null);
    const [sortParameters, setSortParameters] = useState<SortParameters>({
      sortBy: DEFAULT_SORT_OPTIONS,
    });

    const [displayMode, setDisplayMode] = useState<DisplayMode>("questions");
    const [isSticky, setIsSticky] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setIsSticky(!entry.isIntersecting);
        },
        { threshold: 0.1, rootMargin: "-50px 0px 0px 0px" },
      );

      const element = sentinelRef.current;
      if (element) {
        observer.observe(element);
      }

      return () => {
        if (element) observer.unobserve(element);
        observer.disconnect();
      };
    }, [results, isSearching]);

    const handleInspectOpen = useCallback(() => {
      questionInspectRef.current?.setIsInspectOpen((prev) => ({
        ...prev,
        isOpen: true,
      }));
    }, []);

    // Helper to check if a string is an image URL
    const filteredResults = useMemo(() => {
      if (!results) return [];
      if (displayMode === "questions") return results;
      return results.filter((q) => q.answers.some((answer) => isImageUrl(answer)));
    }, [results, displayMode]);

    const sortedData = useMemo(() => {
      if (!filteredResults) return [];
      return filteredResults.toSorted(
        (a: VectorizeSelectedQuestion, b: VectorizeSelectedQuestion) => {
          if (sortParameters.sortBy === "ascending") {
            return a.score - b.score;
          } else {
            // Default to year-desc
            return b.score - a.score;
          }
        },
      );
    }, [sortParameters.sortBy, filteredResults]);

    const fullPartitionedData = useMemo(() => {
      if (!sortedData || sortedData.length === 0) return [];

      const chunkSize = 25;

      return chunkQuestionsData(sortedData, chunkSize) as VectorizeSelectedQuestion[][];
    }, [sortedData]);

    return (
      <TopicalLayoutProvider
        enableSavedActivitiesQuery={enableSavedActivitiesQuery && (results?.length ?? 0) > 0}
      >
        <div className="relative">
          {results && !isSearching && (
            <>
              <div
                ref={sentinelRef}
                className="pointer-events-none absolute top-0 h-px w-full -translate-y-4 opacity-0"
              />
              <SearchResultsHeader
                resultCount={sortedData.length}
                displayMode={displayMode}
                setDisplayMode={setDisplayMode}
                currentTab={currentTab}
                onInspectOpen={handleInspectOpen}
                sortParameters={sortParameters}
                setSortParameters={setSortParameters}
                isSticky={isSticky}
              />
              {isSticky && <div className="h-[76px] w-full" />}

              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                {sortedData.length === 0 ? (
                  <div className="rounded-3xl py-4 text-center">
                    <div className="bg-background mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full shadow-sm">
                      <Search className="text-muted-foreground/30 h-10 w-10" />
                    </div>
                    <h3 className="text-foreground text-lg font-bold">
                      {displayMode === "answers" ? "No answers found" : "No questions found"}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {displayMode === "answers"
                        ? "Try switching to questions mode or adjust your search (note: multiple choice answers are not searchable)"
                        : "Try adjusting your filters or search terms"}
                    </p>
                  </div>
                ) : (
                  <MasonryContent
                    sortedData={sortedData}
                    results={results}
                    displayMode={displayMode}
                    questionInspectRef={questionInspectRef}
                  />
                )}
              </div>
            </>
          )}
        </div>
        <QuestionInspect
          ref={questionInspectRef}
          partitionedTopicalData={fullPartitionedData}
          currentQuery={undefined}
          BETTER_AUTH_URL="https://noteoverflow.com"
          setSortParameters={setSortParameters}
          sortParameters={sortParameters}
        />
      </TopicalLayoutProvider>
    );
  },
);

const MasonryContent = memo(
  ({
    sortedData,
    results,
    displayMode,
    questionInspectRef,
  }: {
    sortedData: VectorizeSelectedQuestion[];
    results: VectorizeSelectedQuestion[] | null;
    displayMode: DisplayMode;
    questionInspectRef: React.RefObject<QuestionInspectRef | null>;
  }) => {
    const highestScore = useMemo(() => {
      if (!results || results.length === 0) return null;
      return Math.max(...results.map((q) => q.score));
    }, [results]);

    return (
      <Masonry
        items={sortedData.flatMap((question, index) => {
          const imagesToShow =
            displayMode === "questions"
              ? question.questionImages
              : question.answers.filter((answer) => isImageUrl(answer));

          const dimensionsToUse =
            displayMode === "questions"
              ? question.questionImagesDimensions
              : question.answersImagesDimensions;

          return imagesToShow.map((imageSrc: string, imageIndex: number) => {
            const isBestMatch = question.score === highestScore;
            const width = dimensionsToUse?.[imageIndex]?.width;
            const height = dimensionsToUse?.[imageIndex]?.height;

            const element = isBestMatch ? (
              <div
                key={`${question.id}-${imageSrc}-${index}`}
                className="bg-logo-main mansory-item relative mb-6 w-full rounded-xl p-1"
              >
                <div className="bg-logo-main absolute -top-3 left-4 z-15 flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md">
                  <span>✨</span> Best Match
                </div>
                <div className="bg-background/50 rounded-lg p-2 backdrop-blur-xs">
                  <QuestionPreview
                    question={question}
                    onQuestionClick={() => {
                      questionInspectRef.current?.setIsInspectOpen({
                        isOpen: true,
                        questionId: question.id,
                      });
                    }}
                    imageSrc={imageSrc}
                    imageWidth={width}
                    showCurriculumBadge={true}
                    showSubjectBadge={true}
                    imageHeight={height}
                    className="border-logo-main/20 mb-0! shadow-lg"
                  />
                </div>
              </div>
            ) : (
              <QuestionPreview
                question={question}
                onQuestionClick={() => {
                  questionInspectRef.current?.setIsInspectOpen({
                    isOpen: true,
                    questionId: question.id,
                  });
                }}
                imageSrc={imageSrc}
                imageWidth={width}
                showCurriculumBadge={true}
                showSubjectBadge={true}
                imageHeight={height}
                key={`${question.id}-${imageSrc}-${index}`}
              />
            );

            return { element, width, height };
          });
        })}
      />
    );
  },
);

MasonryContent.displayName = "MasonryContent";

MainContent.displayName = "MainContent";
export default MainContent;
