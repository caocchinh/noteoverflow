/* eslint-disable @next/next/no-img-element */
"use client";

import { ValidCurriculum } from "@/constants/types";
import {
  CURRICULUM_COVER_IMAGE,
  DEFAULT_NUMBER_OF_COLUMNS,
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  DEFAULT_LAYOUT_STYLE,
  INFINITE_SCROLL_CHUNK_SIZE,
  SUBJECT_COVER_IMAGE,
  FILTERS_CACHE_KEY,
  COLUMN_BREAKPOINTS,
} from "@/features/topical/constants/constants";
import {
  SelectedFinishedQuestion,
  SelectedQuestion,
  LayoutStyle,
  FiltersCache,
  SelectedBookmark,
} from "@/features/topical/constants/types";
import {
  extractCurriculumCode,
  extractSubjectCode,
  hasOverlap,
} from "@/features/topical/lib/utils";
import { authClient } from "@/lib/auth/auth-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import Masonry from "react-responsive-masonry";

const FinishedQuestionsPage = () => {
  const queryClient = useQueryClient();

  const {
    data: userSession,
    isError: isUserSessionError,
    isPending: isUserSessionPending,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
    enabled: !queryClient.getQueryData(["user"]),
  });

  const {
    data: userFinishedQuestions,
    isFetching: isUserFinishedQuestionsFetching,
    isError: isUserFinishedQuestionsError,
  } = useQuery({
    queryKey: ["user_finished_questions"],
    queryFn: async () => {
      const response = await fetch("/api/topical/finished");
      const data: {
        data: SelectedFinishedQuestion[];
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }
      return data.data;
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_finished_questions"]),
  });

  const {
    data: bookmarks,
    isFetching: isBookmarksFetching,
    isError: isBookmarksError,
  } = useQuery({
    queryKey: ["all_user_bookmarks"],
    queryFn: async () => {
      const response = await fetch("/api/topical/bookmark", {
        method: "GET",
      });
      const data: {
        data: SelectedBookmark[];
        error?: string;
      } = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data.data;
    },
    enabled:
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["all_user_bookmarks"]),
  });

  const metadata = useMemo(() => {
    const tempMetadata: Record<Partial<ValidCurriculum>, string[]> = {};
    userFinishedQuestions?.forEach((question) => {
      const extractedCurriculumn = extractCurriculumCode({
        questionId: question.question.id,
      });
      if (extractedCurriculumn) {
        const extractedSubjectCode = extractSubjectCode({
          questionId: question.question.id,
        });
        if (!tempMetadata[extractedCurriculumn]) {
          tempMetadata[extractedCurriculumn] = [];
        }
        if (
          !tempMetadata[extractedCurriculumn].includes(extractedSubjectCode)
        ) {
          tempMetadata[extractedCurriculumn].push(extractedSubjectCode);
        }
      }
    });

    return tempMetadata;
  }, [userFinishedQuestions]);
  const [selectedCurriculumn, setSelectedCurriculum] =
    useState<ValidCurriculum | null>(null);
  const [selectedSubject, setSelecteSubject] = useState<string | null>(null);

  const subjectMetadata = useMemo(() => {
    if (!selectedCurriculumn || !selectedSubject) return null;
    const temp: {
      topic: string[];
      year: string[];
      paperType: string[];
      season: string[];
    } = {
      topic: [],
      year: [],
      paperType: [],
      season: [],
    };
    userFinishedQuestions?.forEach((question) => {
      const extractedCurriculumn = extractCurriculumCode({
        questionId: question.question.id,
      });
      const extractedSubjectCode = extractSubjectCode({
        questionId: question.question.id,
      });
      if (
        extractedCurriculumn === selectedCurriculumn &&
        extractedSubjectCode === selectedSubject
      ) {
        question.question.questionTopics.forEach((topic) => {
          if (topic.topic) {
            if (!temp.topic.includes(topic.topic)) {
              temp.topic.push(topic.topic);
            }
          }
        });
        if (!temp.year.includes(question.question.year.toString())) {
          temp.year.push(question.question.year.toString());
        }
        if (!temp.paperType.includes(question.question.paperType.toString())) {
          temp.paperType.push(question.question.paperType.toString());
        }
        if (!temp.season.includes(question.question.season)) {
          temp.season.push(question.question.season);
        }
      }
    });
    return temp;
  }, [selectedCurriculumn, selectedSubject, userFinishedQuestions]);
  const [selectedTopic, setSelectedTopic] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string[] | null>(null);
  const [selectedPaperType, setSelectedPaperType] = useState<string[] | null>(
    null
  );
  const [selectedSeason, setSelectedSeason] = useState<string[] | null>(null);
  const [currentFilter, setCurrentFilter] = useState<{
    topic: string[];
    year: string[];
    paperType: string[];
    season: string[];
  } | null>(null);

  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedFinishedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<
    SelectedFinishedQuestion[]
  >([]);
  const [sortBy, setSortBy] = useState<"descending" | "ascending">(
    "descending"
  );
  const [layoutStyle, setLayoutStyle] =
    useState<LayoutStyle>(DEFAULT_LAYOUT_STYLE);
  const [numberOfQuestionsPerPage, setNumberOfQuestionsPerPage] = useState(
    DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
  );
  const [scrollUpWhenPageChange, setScrollUpWhenPageChange] = useState(true);

  const [numberOfColumns, setNumberOfColumns] = useState(
    DEFAULT_NUMBER_OF_COLUMNS
  );
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [showFinishedQuestionTint, setShowFinishedQuestionTint] =
    useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    try {
      if (savedState) {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setNumberOfColumns(
          parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
        );
        setScrollUpWhenPageChange(parsedState.scrollUpWhenPageChange ?? true);
        setLayoutStyle(parsedState.layoutStyle ?? DEFAULT_LAYOUT_STYLE);
        setNumberOfQuestionsPerPage(
          parsedState.numberOfQuestionsPerPage ??
            DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
        );
        setShowScrollToTopButton(parsedState.showScrollToTopButton ?? true);
        setShowFinishedQuestionTint(
          parsedState.showFinishedQuestionTint ?? true
        );
      }
    } catch {
      localStorage.removeItem(FILTERS_CACHE_KEY);
    }
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, []);

  useEffect(() => {
    if (subjectMetadata) {
      setSelectedTopic(subjectMetadata.topic);
      setSelectedYear(subjectMetadata.year);
      setSelectedPaperType(subjectMetadata.paperType);
      setSelectedSeason(subjectMetadata.season);
      setCurrentFilter({
        topic: subjectMetadata.topic,
        year: subjectMetadata.year,
        paperType: subjectMetadata.paperType,
        season: subjectMetadata.season,
      });
    }
  }, [subjectMetadata]);

  const topicalData = useMemo(() => {
    if (
      !userFinishedQuestions ||
      !currentFilter ||
      !selectedCurriculumn ||
      !selectedSubject
    )
      return [];
    return userFinishedQuestions.filter((item) => {
      const extractedCurriculumn = extractCurriculumCode({
        questionId: item.question.id,
      });
      if (extractedCurriculumn !== selectedCurriculumn) {
        return false;
      }
      const extractedSubjectCode = extractSubjectCode({
        questionId: item.question.id,
      });
      if (extractedSubjectCode !== selectedSubject) {
        return false;
      }
      if (
        !currentFilter.paperType.includes(item.question.paperType.toString())
      ) {
        return false;
      }
      if (!currentFilter.year.includes(item.question.year.toString())) {
        return false;
      }
      if (
        !hasOverlap(
          item.question.questionTopics
            .map((topic) => topic.topic)
            .filter((topic) => topic !== null),
          currentFilter.topic
        )
      ) {
        return false;
      }
      if (!currentFilter.season.includes(item.question.season)) {
        return false;
      }
      return true;
    });
  }, [
    currentFilter,
    selectedCurriculumn,
    selectedSubject,
    userFinishedQuestions,
  ]);

  useEffect(() => {
    if (topicalData) {
      const chunkedData: SelectedFinishedQuestion[][] = [];
      let currentChunks: SelectedFinishedQuestion[] = [];
      const chunkSize =
        layoutStyle === "pagination"
          ? numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;
      const sortedData: SelectedFinishedQuestion[] = topicalData.sort(
        (a: SelectedFinishedQuestion, b: SelectedFinishedQuestion) => {
          const aIndex = new Date(a.updatedAt).getTime();
          const bIndex = new Date(b.updatedAt).getTime();
          return sortBy === "descending" ? bIndex - aIndex : aIndex - bIndex;
        }
      );
      sortedData.forEach((item: SelectedFinishedQuestion) => {
        if (currentChunks.length === chunkSize) {
          chunkedData.push(currentChunks);
          currentChunks = [];
        }
        currentChunks.push(item);
      });
      chunkedData.push(currentChunks);

      setFullPartitionedData(chunkedData);
      setDisplayedData(chunkedData[0]);
      setCurrentChunkIndex(0);
      scrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [
    topicalData,
    numberOfColumns,
    layoutStyle,
    numberOfQuestionsPerPage,
    sortBy,
  ]);

  return (
    <div className="pt-16 relative z-[10] flex flex-col w-full items-center justify-center p-4">
      <div className="flex flex-row items-center justify-between w-[95%]">
        <Breadcrumb className="self-end">
          <BreadcrumbList>
            <BreadcrumbItem
              className="cursor-pointer"
              onClick={() => {
                setSelectedCurriculum(null);
                setSelecteSubject(null);
              }}
            >
              Curriculum
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {selectedCurriculumn && (
              <>
                <BreadcrumbItem
                  className="cursor-pointer"
                  onClick={() => {
                    setSelecteSubject(null);
                  }}
                >
                  Subject
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            {selectedSubject && (
              <BreadcrumbItem className="cursor-pointer">
                {selectedCurriculumn + " " + selectedSubject}
              </BreadcrumbItem>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {(isUserFinishedQuestionsFetching || isUserSessionPending) && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <Loader2 className="animate-spin" />
        </div>
      )}

      {metadata && !selectedCurriculumn && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your curriculumn</h1>
          <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full  ">
            {Object.keys(metadata).map((curriculum) => (
              <div
                key={curriculum}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  setSelectedCurriculum(curriculum as ValidCurriculum);
                }}
                title={curriculum}
              >
                <img
                  loading="lazy"
                  className="!h-20 object-cover border border-foreground p-2 rounded-sm bg-white "
                  alt="Curriculum cover image"
                  src={
                    CURRICULUM_COVER_IMAGE[
                      curriculum as keyof typeof CURRICULUM_COVER_IMAGE
                    ]
                  }
                />
                <p>{curriculum}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {metadata && selectedCurriculumn && !selectedSubject && (
        <div className="flex flex-col gap-4 items-center justify-center w-full">
          <h1 className="font-semibold text-2xl">Choose your subject</h1>
          <div className="flex flex-row flex-wrap gap-5 items-center justify-center w-full  ">
            {metadata[selectedCurriculumn].map((subject) => (
              <div
                key={subject}
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  setSelecteSubject(subject);
                }}
              >
                <img
                  loading="lazy"
                  title={subject}
                  className="!h-[200px] w-40 object-cover rounded-[1px] "
                  alt="Curriculum cover image"
                  src={
                    SUBJECT_COVER_IMAGE[
                      selectedCurriculumn as keyof typeof SUBJECT_COVER_IMAGE
                    ][subject]
                  }
                />
                <p>{subject}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {displayedData.length > 0 && (
        <ScrollArea>
          <ResponsiveMasonry
            columnsCountBreakPoints={
              COLUMN_BREAKPOINTS[
                numberOfColumns as keyof typeof COLUMN_BREAKPOINTS
              ]
            }
          >
            <Masonry gutter="11px">
              {displayedData.map((question) =>
                question?.questionImages.map((imageSrc: string) => (
                  <QuestionPreview
                    bookmarks={bookmarks ?? []}
                    question={question}
                    setIsQuestionInspectOpen={setIsQuestionInspectOpen}
                    isUserSessionPending={isUserSessionPending}
                    userFinishedQuestions={userFinishedQuestions ?? []}
                    showFinishedQuestionTint={showFinishedQuestionTint}
                    isBookmarkError={isUserSessionError || isBookmarksError}
                    isValidSession={!!userSession?.data?.session}
                    key={`${question.id}-${imageSrc}`}
                    isBookmarksFetching={isBookmarksFetching}
                    imageSrc={imageSrc}
                  />
                ))
              )}
            </Masonry>
          </ResponsiveMasonry>

          {layoutStyle === "infinite" && (
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
  );
};

export default FinishedQuestionsPage;
