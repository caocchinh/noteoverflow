import { InspectTriggerButton } from "@/features/topical/components/AppUltilityBar";
import Masonry from "@/features/topical/components/Masonry";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { DEFAULT_SORT_OPTIONS } from "@/features/topical/constants/constants";
import {
  QuestionInspectRef,
  SortParameters,
  VectorizeSelectedQuestion,
} from "@/features/topical/constants/types";
import TopicalLayoutProvider from "@/features/topical/context/TopicalLayoutProvider";
import { chunkQuestionsData } from "@/features/topical/lib/utils";
import { Search } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import Ultility from "./Ultility";

type DisplayMode = "questions" | "answers";

const MainContent = memo(
  ({
    results,
    isSearching,
    enableSavedActivitiesQuery = true,
  }: {
    results: VectorizeSelectedQuestion[] | null;
    isSearching: boolean;
    enableSavedActivitiesQuery?: boolean;
  }) => {
    const questionInspectRef = useRef<QuestionInspectRef | null>(null);
    const [sortParameters, setSortParameters] = useState<SortParameters>({
      sortBy: DEFAULT_SORT_OPTIONS,
    });
    const [fullPartitionedData, setFullPartitionedData] = useState<
      VectorizeSelectedQuestion[][] | undefined
    >(undefined);
    const [displayMode, setDisplayMode] = useState<DisplayMode>("questions");

    // Helper to check if a string is an image URL
    const isImageUrl = (str: string) => str.startsWith("http");

    const filteredResults = useMemo(() => {
      if (!results) return [];
      if (displayMode === "questions") return results;
      return results.filter((q) =>
        q.answers.some((answer) => isImageUrl(answer))
      );
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
        }
      );
    }, [sortParameters.sortBy, filteredResults]);

    const highestScore = useMemo(() => {
      if (!results || results.length === 0) return null;
      return Math.max(...results.map((q) => q.score));
    }, [results]);

    const chunkedData = useMemo(() => {
      if (!sortedData || sortedData.length === 0) return null;

      const chunkSize = 25;

      return chunkQuestionsData(
        sortedData,
        chunkSize
      ) as VectorizeSelectedQuestion[][];
    }, [sortedData]);

    useEffect(() => {
      if (chunkedData) {
        setFullPartitionedData(chunkedData);
      }
    }, [chunkedData]);

    return (
      <TopicalLayoutProvider
        enableSavedActivitiesQuery={
          enableSavedActivitiesQuery && (results?.length ?? 0) > 0
        }
      >
        <div className="relative">
          {results && !isSearching && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between px-2 mb-6 gap-2 flex-wrap">
                <div className="flex items-center gap-3 px-2 mb-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    Found{" "}
                    <span className="text-foreground font-bold">
                      {sortedData.length}
                    </span>{" "}
                    {displayMode === "questions" ? "question" : "answer"}
                    {sortedData.length !== 1 ? "s" : ""}
                  </p>
                  <ToggleGroup
                    type="single"
                    value={displayMode}
                    onValueChange={(value) => {
                      if (value) setDisplayMode(value as DisplayMode);
                    }}
                    className="bg-muted/50 rounded-lg p-0.5 border"
                  >
                    <ToggleGroupItem
                      value="questions"
                      size="sm"
                      className="text-xs px-3 py-1 data-[state=on]:bg-logo-main data-[state=on]:text-white data-[state=on]:shadow-sm rounded-md cursor-pointer"
                    >
                      Questions
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="answers"
                      size="sm"
                      className="text-xs px-3 py-1 data-[state=on]:bg-logo-main data-[state=on]:text-white data-[state=on]:shadow-sm rounded-md cursor-pointer"
                    >
                      Answers
                    </ToggleGroupItem>
                  </ToggleGroup>
                  <ShareFilter
                    isDisabled={false}
                    url={
                      typeof window !== "undefined" ? window.location.href : ""
                    }
                    type="search result"
                  />
                </div>
                {sortedData.length > 0 && (
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <InspectTriggerButton
                      isQuestionViewDisabled={false}
                      setIsQuestionInspectOpen={() => {
                        questionInspectRef.current?.setIsInspectOpen(
                          (prev) => ({
                            ...prev,
                            isOpen: true,
                          })
                        );
                      }}
                    />
                    <Ultility
                      sortParameters={sortParameters}
                      setSortParameters={setSortParameters}
                    />
                  </div>
                )}
              </div>

              {sortedData.length === 0 ? (
                <div className="text-center py-4 rounded-3xl">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Search className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {displayMode === "answers"
                      ? "No answers found"
                      : "No questions found"}
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    {displayMode === "answers"
                      ? "Try switching to questions mode or adjust your search (note: multiple choice answers are not searchable)"
                      : "Try adjusting your filters or search terms"}
                  </p>
                </div>
              ) : (
                <>
                  <Masonry
                    items={sortedData.flatMap((question, index) => {
                      const imagesToShow =
                        displayMode === "questions"
                          ? question.questionImages
                          : question.answers.filter((answer) =>
                              isImageUrl(answer)
                            );

                      const dimensionsToUse =
                        displayMode === "questions"
                          ? question.questionImagesDimensions
                          : question.answersImagesDimensions;

                      return imagesToShow.map(
                        (imageSrc: string, imageIndex: number) => {
                          const isBestMatch = question.score === highestScore;
                          const width = dimensionsToUse?.[imageIndex]?.width;
                          const height = dimensionsToUse?.[imageIndex]?.height;

                          const element = isBestMatch ? (
                            <div
                              key={`${question.id}-${imageSrc}-${index}`}
                              className="w-full mb-6 p-1 rounded-xl bg-logo-main relative mansory-item"
                            >
                              <div className="absolute -top-3 left-4 bg-logo-main text-white px-3 py-1 rounded-full text-xs font-bold shadow-md z-20 flex items-center gap-1">
                                <span>✨</span> Best Match
                              </div>
                              <div className="bg-background/50 rounded-lg p-2 backdrop-blur-xs">
                                <QuestionPreview
                                  question={question}
                                  onQuestionClick={() => {
                                    questionInspectRef.current?.setIsInspectOpen(
                                      {
                                        isOpen: true,
                                        questionId: question.id,
                                      }
                                    );
                                  }}
                                  imageSrc={imageSrc}
                                  imageWidth={width}
                                  showCurriculumBadge={true}
                                  showSubjectBadge={true}
                                  imageHeight={height}
                                  className="border-logo-main/20 shadow-lg mb-0!"
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
                        }
                      );
                    })}
                  />
                </>
              )}
            </div>
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
  }
);

MainContent.displayName = "MainContent";
export default MainContent;
