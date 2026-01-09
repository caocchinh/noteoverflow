import { InspectTriggerButton } from "@/features/topical/components/AppUltilityBar";
import Masonry from "@/features/topical/components/Masonry";
import QuestionInspect from "@/features/topical/components/QuestionInspect/QuestionInspect";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import Sort from "@/features/topical/components/Sort";
import { DEFAULT_SORT_OPTIONS } from "@/features/topical/constants/constants";
import {
  QuestionInspectRef,
  SelectedQuestion,
  SortParameters,
} from "@/features/topical/constants/types";
import TopicalLayoutProvider from "@/features/topical/context/TopicalLayoutProvider";
import { chunkQuestionsData } from "@/features/topical/lib/utils";
import { Search } from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

const MainContent = memo(
  ({
    results,
    isSearching,
    enableSavedActivitiesQuery = true,
  }: {
    results: SelectedQuestion[] | null;
    isSearching: boolean;
    enableSavedActivitiesQuery?: boolean;
  }) => {
    const questionInspectRef = useRef<QuestionInspectRef | null>(null);
    const [sortParameters, setSortParameters] = useState<SortParameters>({
      sortBy: DEFAULT_SORT_OPTIONS,
    });
    const [fullPartitionedData, setFullPartitionedData] = useState<
      SelectedQuestion[][] | undefined
    >(undefined);

    const sortedData = useMemo(() => {
      if (!results) return [];
      return results.toSorted((a: SelectedQuestion, b: SelectedQuestion) => {
        if (sortParameters.sortBy === "ascending") {
          return a.year - b.year;
        } else {
          // Default to year-desc
          return b.year - a.year;
        }
      });
    }, [sortParameters.sortBy, results]);

    const chunkedData = useMemo(() => {
      if (!sortedData || sortedData.length === 0) return null;

      const chunkSize = 25;

      return chunkQuestionsData(sortedData, chunkSize);
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
              <div className="flex items-center justify-between px-2 mb-1 gap-2">
                <div className="flex items-center justify-between px-2 mb-1">
                  <p className="text-sm text-muted-foreground font-medium">
                    Found{" "}
                    <span className="text-foreground font-bold">
                      {results?.length ?? 0}
                    </span>{" "}
                    question{(results?.length ?? 0) !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <InspectTriggerButton
                    isQuestionViewDisabled={false}
                    setIsQuestionInspectOpen={() => {
                      questionInspectRef.current?.setIsInspectOpen((prev) => ({
                        ...prev,
                        isOpen: true,
                      }));
                    }}
                  />
                  <Sort
                    sortParameters={sortParameters}
                    setSortParameters={setSortParameters}
                    isDisabled={false}
                    disabledMessage="Please run a search first"
                    descendingSortText="Newest year first"
                    ascendingSortText="Oldest year first"
                  />
                </div>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-4 rounded-3xl">
                  <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-background flex items-center justify-center shadow-sm">
                    <Search className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    No matches found
                  </h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your filters or search terms
                  </p>
                </div>
              ) : (
                <>
                  <Masonry>
                    {results.map((question, index) =>
                      question?.questionImages.map((imageSrc: string) => {
                        const isBestMatch = index === 0;

                        if (isBestMatch) {
                          return (
                            <div
                              key={`${question.id}-${imageSrc}-${index}`}
                              className="w-full [column-span:3] mb-6 p-1 rounded-xl bg-logo-main relative"
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
                                  className="border-logo-main/20 shadow-lg"
                                />
                              </div>
                            </div>
                          );
                        }
                        return (
                          <QuestionPreview
                            question={question}
                            onQuestionClick={() => {
                              questionInspectRef.current?.setIsInspectOpen({
                                isOpen: true,
                                questionId: question.id,
                              });
                            }}
                            imageSrc={imageSrc}
                            key={`${question.id}-${imageSrc}-${index}`}
                          />
                        );
                      })
                    )}
                  </Masonry>
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
