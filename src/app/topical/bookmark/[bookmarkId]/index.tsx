"use client";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import {
  COLUMN_BREAKPOINTS,
  DEFAULT_CACHE,
  DEFAULT_IMAGE_THEME,
  DEFAULT_LAYOUT_STYLE,
  DEFAULT_NUMBER_OF_COLUMNS,
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  DEFAULT_SORT_BY,
  FILTERS_CACHE_KEY,
  INFINITE_SCROLL_CHUNK_SIZE,
  INVALID_INPUTS_DEFAULT,
} from "@/features/topical/constants/constants";
import {
  SelectedFinishedQuestion,
  SelectedQuestion,
  LayoutStyle,
  FiltersCache,
  SelectedBookmark,
  InvalidInputs,
  SelectedPublickBookmark,
} from "@/features/topical/constants/types";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Monitor,
  ScanText,
  SlidersHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  extractCurriculumCode,
  extractSubjectCode,
  hasOverlap,
  isValidInputs as isValidInputsUtils,
  isOverScrolling,
} from "@/features/topical/lib/utils";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth/auth-client";
import { cn } from "@/lib/utils";
import { JumpToTabButton } from "@/features/topical/components/JumpToTabButton";
import { SortBy } from "@/features/topical/components/SortBy";
import { ValidCurriculum } from "@/constants/types";
import { useIsMobile } from "@/hooks/use-mobile";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import VisualSetting from "@/features/topical/components/VisualSetting";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import Link from "next/link";
import Image from "next/image";
import {
  CURRICULUM_COVER_IMAGE,
  SUBJECT_COVER_IMAGE,
} from "@/constants/constants";

export const BookmarkView = ({
  data,
  BETTER_AUTH_URL,
  listId,
  ownerInfo,
}: {
  data: SelectedPublickBookmark[];
  BETTER_AUTH_URL: string;
  listId: string;
  ownerInfo: {
    ownerName: string;
    ownerId: string;
    listName: string;
    ownerAvatar: string;
  };
}) => {
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
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] = useState({
    isOpen: false,
    questionId: "",
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const metadata = useMemo(() => {
    const tempMetadata: Partial<Record<ValidCurriculum, string[]>> = {};
    data?.forEach((question) => {
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
  }, [data]);
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
    data?.forEach((question) => {
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
        question.question.topics.forEach((topic) => {
          if (topic) {
            if (!temp.topic.includes(topic)) {
              temp.topic.push(topic);
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
  }, [data, selectedCurriculumn, selectedSubject]);
  const isMobileDevice = useIsMobile();
  const [selectedTopic, setSelectedTopic] = useState<string[] | null>(null);
  const [selectedYear, setSelectedYear] = useState<string[] | null>(null);
  const [selectedPaperType, setSelectedPaperType] = useState<string[] | null>(
    null
  );
  const [imageTheme, setImageTheme] = useState<"dark" | "light">(
    DEFAULT_IMAGE_THEME
  );
  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const [isUltilityOverflowingLeft, setIsUltilityOverflowingLeft] =
    useState(false);
  const [isUltilityOverflowingRight, setIsUltilityOverflowingRight] =
    useState(false);
  const overflowScrollHandler = useCallback(() => {
    const isOverScrollingResult = isOverScrolling({
      child: ultilityRef.current,
      parent: sideBarInsetRef.current,
      specialLeftCase: !isMobileDevice,
    });
    setIsUltilityOverflowingLeft(isOverScrollingResult.isOverScrollingLeft);
    setIsUltilityOverflowingRight(isOverScrollingResult.isOverScrollingRight);
  }, [isMobileDevice]);
  const ultilityHorizontalScrollBarRef = useRef<HTMLDivElement | null>(null);
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState<string[] | null>(null);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<{
    topic: string[];
    year: string[];
    paperType: string[];
    season: string[];
  } | null>(null);

  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);
  const [sortBy, setSortBy] = useState<"descending" | "ascending">(
    "descending"
  );
  const [layoutStyle, setLayoutStyle] =
    useState<LayoutStyle>(DEFAULT_LAYOUT_STYLE);
  const [numberOfQuestionsPerPage, setNumberOfQuestionsPerPage] = useState(
    DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
  );
  const [scrollUpWhenPageChange, setScrollUpWhenPageChange] = useState(true);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const [numberOfColumns, setNumberOfColumns] = useState(
    DEFAULT_NUMBER_OF_COLUMNS
  );
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(true);
  const [showFinishedQuestionTint, setShowFinishedQuestionTint] =
    useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    try {
      if (savedState) {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setNumberOfColumns(
          parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
        );
        setSortBy(
          parsedState.finishedQuestionsSearchSortedBy ?? DEFAULT_SORT_BY
        );
        setImageTheme(parsedState.imageTheme ?? DEFAULT_IMAGE_THEME);
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
      setIsMounted(true);
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

  useEffect(() => {
    if (selectedTopic && selectedTopic.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedPaperType && selectedPaperType.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    if (selectedYear && selectedYear.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSeason && selectedSeason.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason]);

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    setIsQuestionInspectOpen({ isOpen: false, questionId: "" });
  }, [currentFilter]);

  useEffect(() => {
    overflowScrollHandler();
  }, [overflowScrollHandler, fullPartitionedData, layoutStyle]);

  const topicalData = useMemo(() => {
    if (!currentFilter || !selectedCurriculumn || !selectedSubject || !data)
      return [];
    return data.filter((item) => {
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
          item.question.topics
            .map((topic) => topic)
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
  }, [currentFilter, data, selectedCurriculumn, selectedSubject]);

  useEffect(() => {
    if (topicalData) {
      const chunkedData: SelectedQuestion[][] = [];
      let currentChunks: SelectedQuestion[] = [];
      const chunkSize =
        layoutStyle === "pagination"
          ? numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;
      const sortedData: SelectedPublickBookmark[] = topicalData.toSorted(
        (a: SelectedPublickBookmark, b: SelectedPublickBookmark) => {
          const aIndex = new Date(a.updatedAt).getTime();
          const bIndex = new Date(b.updatedAt).getTime();
          return sortBy === "descending" ? bIndex - aIndex : aIndex - bIndex;
        }
      );
      sortedData.forEach((item: SelectedPublickBookmark) => {
        if (currentChunks.length === chunkSize) {
          chunkedData.push(currentChunks);
          currentChunks = [];
        }
        currentChunks.push(item.question);
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

  const isValidInputs = ({
    scrollOnError = true,
  }: {
    scrollOnError?: boolean;
  }) => {
    return isValidInputsUtils({
      topicLengthConstraint: false,
      scrollOnError,
      topicRef: topicRef,
      yearRef: yearRef,
      paperTypeRef: paperTypeRef,
      seasonRef: seasonRef,
      selectedTopic: selectedTopic ?? [],
      selectedYear: selectedYear ?? [],
      selectedPaperType: selectedPaperType ?? [],
      selectedSeason: selectedSeason ?? [],
      setInvalidInputs: setInvalidInputs,
    });
  };

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") {
      return;
    }
    try {
      let stateToSave: FiltersCache;

      try {
        const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
        stateToSave = existingStateJSON
          ? JSON.parse(existingStateJSON)
          : { ...DEFAULT_CACHE };
      } catch {
        stateToSave = { ...DEFAULT_CACHE };
      }

      stateToSave = {
        ...stateToSave,
        showFinishedQuestionTint:
          showFinishedQuestionTint ?? stateToSave.showFinishedQuestionTint,
        scrollUpWhenPageChange:
          scrollUpWhenPageChange ?? stateToSave.scrollUpWhenPageChange,
        showScrollToTopButton:
          showScrollToTopButton ?? stateToSave.showScrollToTopButton,
        imageTheme: imageTheme ?? stateToSave.imageTheme,
        finishedQuestionsSearchSortedBy:
          sortBy ?? stateToSave.finishedQuestionsSearchSortedBy,
        numberOfColumns: numberOfColumns ?? stateToSave.numberOfColumns,
        layoutStyle: layoutStyle ?? stateToSave.layoutStyle,
        numberOfQuestionsPerPage:
          numberOfQuestionsPerPage ?? stateToSave.numberOfQuestionsPerPage,
      };

      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save settings to localStorage:", error);
    }
  }, [
    layoutStyle,
    numberOfColumns,
    numberOfQuestionsPerPage,
    scrollUpWhenPageChange,
    showFinishedQuestionTint,
    showScrollToTopButton,
    sortBy,
    imageTheme,
    isMounted,
  ]);

  const isQuestionViewDisabled = useMemo(() => {
    return (
      !selectedCurriculumn ||
      !selectedSubject ||
      !currentFilter ||
      !fullPartitionedData ||
      !displayedData ||
      displayedData.length === 0
    );
  }, [
    selectedCurriculumn,
    selectedSubject,
    currentFilter,
    fullPartitionedData,
    displayedData,
  ]);

  return (
    <>
      <div className="pt-16 relative z-[10] flex flex-col w-full items-center justify-start p-4 overflow-hidde h-screen">
        <div
          className="flex flex-row items-center justify-between w-full sm:w-[95%] mb-4 flex-wrap gap-2"
          ref={sideBarInsetRef}
        >
          <Breadcrumb className="self-end mr-0 sm:mr-6 max-w-full w-max">
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
          <ScrollArea
            viewPortOnScroll={overflowScrollHandler}
            className="max-w-full w-max relative"
            viewportRef={ultilityHorizontalScrollBarRef}
          >
            {isUltilityOverflowingRight && (
              <Button
                className="absolute right-0 top-1 rounded-full cursor-pointer w-7 h-7 z-[200]"
                title="Move right"
                onClick={() => {
                  if (ultilityHorizontalScrollBarRef.current) {
                    ultilityHorizontalScrollBarRef.current.scrollBy({
                      left: 200,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <ChevronRight size={5} />
              </Button>
            )}
            {isUltilityOverflowingLeft && (
              <Button
                className="absolute left-0 top-1 rounded-full cursor-pointer w-7 h-7 z-[200]"
                title="Move left"
                onClick={() => {
                  if (ultilityHorizontalScrollBarRef.current) {
                    ultilityHorizontalScrollBarRef.current.scrollBy({
                      left: -200,
                      behavior: "smooth",
                    });
                  }
                }}
              >
                <ChevronLeft size={5} />
              </Button>
            )}
            <div
              className="flex flex-row h-full items-center justify-start gap-2 w-max pr-2"
              ref={ultilityRef}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="!bg-background flex cursor-pointer items-center gap-2 border"
                      onClick={() => {
                        setIsSidebarOpen(!isSidebarOpen);
                      }}
                      disabled={isQuestionViewDisabled}
                      variant="outline"
                    >
                      Filters
                      <SlidersHorizontal />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className={cn(!isQuestionViewDisabled && "hidden")}
                >
                  To filter questions, select a subject first
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="flex cursor-pointer items-center gap-2 border"
                      disabled={isQuestionViewDisabled}
                      onClick={() => {
                        setIsQuestionInspectOpen((prev) => ({
                          ...prev,
                          isOpen: true,
                        }));
                      }}
                      variant="default"
                    >
                      Inspect
                      <Monitor />
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className={cn(!isQuestionViewDisabled && "hidden")}
                >
                  To inspect questions, select a subject first
                </TooltipContent>
              </Tooltip>
              {layoutStyle === "pagination" && !isQuestionViewDisabled && (
                <>
                  <Separator orientation="vertical" className="!h-[30px]" />
                  <div className="flex flex-row items-center justify-center gap-2 rounded-sm px-2">
                    <Button
                      variant="outline"
                      className="cursor-pointer !p-[8px] rounded-[2px]"
                      title="First page"
                      disabled={currentChunkIndex === 0}
                      onClick={() => {
                        if (currentChunkIndex === 0) return;
                        setCurrentChunkIndex(0);
                        setDisplayedData(fullPartitionedData![0]);
                        if (scrollUpWhenPageChange) {
                          scrollAreaRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                    >
                      <ChevronsLeft />
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer !p-[8px] rounded-[2px]"
                      title="Previous page"
                      disabled={currentChunkIndex === 0}
                      onClick={() => {
                        if (currentChunkIndex === 0) return;
                        setCurrentChunkIndex(currentChunkIndex - 1);
                        setDisplayedData(
                          fullPartitionedData![currentChunkIndex - 1]
                        );
                        if (scrollUpWhenPageChange) {
                          scrollAreaRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                    >
                      <ChevronLeft />
                    </Button>
                    <JumpToTabButton
                      className="mx-4"
                      tab={currentChunkIndex}
                      totalTabs={fullPartitionedData!.length}
                      prefix="page"
                      onTabChangeCallback={({ tab }) => {
                        setCurrentChunkIndex(tab);
                        setDisplayedData(fullPartitionedData![tab]);
                        if (scrollUpWhenPageChange) {
                          scrollAreaRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      className="cursor-pointer !p-[8px] rounded-[2px]"
                      title="Next page"
                      disabled={
                        currentChunkIndex === fullPartitionedData!.length - 1
                      }
                      onClick={() => {
                        if (
                          currentChunkIndex ===
                          fullPartitionedData!.length - 1
                        )
                          return;
                        setCurrentChunkIndex(currentChunkIndex + 1);
                        setDisplayedData(
                          fullPartitionedData![currentChunkIndex + 1]
                        );
                        if (scrollUpWhenPageChange) {
                          scrollAreaRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                    >
                      <ChevronRight />
                    </Button>
                    <Button
                      variant="outline"
                      className="cursor-pointer !p-[8px] rounded-[2px]"
                      title="Last page"
                      disabled={
                        currentChunkIndex === fullPartitionedData!.length - 1
                      }
                      onClick={() => {
                        if (
                          currentChunkIndex ===
                          fullPartitionedData!.length - 1
                        )
                          return;
                        setCurrentChunkIndex(fullPartitionedData!.length - 1);
                        setDisplayedData(
                          fullPartitionedData![fullPartitionedData!.length - 1]
                        );
                        if (scrollUpWhenPageChange) {
                          scrollAreaRef.current?.scrollTo({
                            top: 0,
                            behavior: "instant",
                          });
                        }
                      }}
                    >
                      <ChevronsRight />
                    </Button>
                  </div>
                </>
              )}
              <Separator orientation="vertical" className="!h-[30px]" />
              <SortBy
                sortBy={sortBy}
                setSortBy={setSortBy}
                disabled={isQuestionViewDisabled}
              />
              <ShareFilter
                isDisabled={false}
                type="bookmark"
                url={`${BETTER_AUTH_URL}/topical/bookmark/${listId}`}
              />
            </div>

            <ScrollBar
              orientation="horizontal"
              className="[&_.bg-border]:bg-transparent"
            />
          </ScrollArea>
        </div>
        <div className="flex flex-row items-center justify-start w-full gap-1 mb-1">
          <Image
            src={ownerInfo.ownerAvatar}
            alt="owner avatar"
            width={25}
            height={25}
            loading="lazy"
            className="rounded-full"
          />
          <p className="text-sm text-logo-main">
            {ownerInfo.ownerName}&apos;s list - {ownerInfo.listName}
          </p>
        </div>
        {metadata &&
          !selectedCurriculumn &&
          Object.keys(metadata).length > 0 && (
            <div className="flex flex-col gap-4 items-center justify-center w-full">
              <h1 className="font-semibold text-2xl">
                Choose your curriculumn
              </h1>
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
                    <Image
                      width={182}
                      height={80}
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

        {Object.keys(metadata).length === 0 && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <p className="text-sm text-muted-foreground">
              Nothing found in this bookmark list!
            </p>
            <Button className="!bg-logo-main !text-white" asChild>
              <Link href="/topical/bookmark" className="w-[250px]">
                Go back to your bookmark
              </Link>
            </Button>
          </div>
        )}

        <ScrollToTopButton
          showScrollToTopButton={showScrollToTopButton}
          isScrollingAndShouldShowScrollButton={
            isScrollingAndShouldShowScrollButton && displayedData.length > 0
          }
          scrollAreaRef={scrollAreaRef}
        />
        {metadata && selectedCurriculumn && !selectedSubject && (
          <div className="flex flex-col gap-4 items-center justify-center w-full">
            <h1 className="font-semibold text-2xl">Choose your subject</h1>
            <ScrollArea
              className="h-[60dvh] px-4 w-full [&_.bg-border]:bg-logo-main "
              type="always"
            >
              <div className="flex flex-row flex-wrap gap-8 items-start justify-center w-full  ">
                {metadata[selectedCurriculumn]?.map((subject) => (
                  <div
                    key={subject}
                    className="flex flex-col items-center justify-center gap-1 cursor-pointer w-[160px]"
                    onClick={() => {
                      setSelecteSubject(subject);
                    }}
                  >
                    <Image
                      width={160}
                      height={200}
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
                    <p className="text-sm text-muted-foreground text-center px-1">
                      {subject}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {displayedData.length > 0 && (
          <ScrollArea
            viewportRef={scrollAreaRef}
            className=" h-[70dvh] lg:h-[78dvh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
            type="always"
            viewPortOnScrollEnd={() => {
              if (scrollAreaRef.current?.scrollTop === 0) {
                setIsScrollingAndShouldShowScrollButton(false);
              } else {
                setIsScrollingAndShouldShowScrollButton(true);
              }
            }}
          >
            <p> {topicalData.length} items</p>
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
                      showFinishedQuestionTint={false}
                      isBookmarkError={isUserSessionError || isBookmarksError}
                      isValidSession={!!userSession?.data?.session}
                      key={`${question.id}-${imageSrc}`}
                      isBookmarksFetching={isBookmarksFetching}
                      imageSrc={imageSrc}
                      imageTheme={imageTheme}
                      listId={
                        ownerInfo.ownerId === userSession?.data?.user?.id
                          ? listId
                          : undefined
                      }
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
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent
          className="z-[100006] overflow-hidden  py-2"
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <ScrollArea className="h-full" type="always">
            <SheetHeader className="sr-only">
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="flex w-full flex-col items-center justify-start gap-4">
              <div
                className="flex flex-col items-start justify-start gap-1"
                ref={topicRef}
              >
                <h3
                  className={cn(
                    "w-max font-medium text-sm",
                    invalidInputs.topic && "text-destructive"
                  )}
                >
                  Topic
                </h3>
                <EnhancedMultiSelect
                  data={subjectMetadata?.topic}
                  label="Topic"
                  onValuesChange={(values) =>
                    setSelectedTopic(values as string[])
                  }
                  prerequisite="Subject"
                  values={selectedTopic ?? []}
                />
                {invalidInputs.topic && (
                  <p className="text-destructive text-sm">Topic is required</p>
                )}
              </div>
              <div
                className="flex flex-col items-start justify-start gap-1"
                ref={paperTypeRef}
              >
                <h3
                  className={cn(
                    "w-max font-medium text-sm",
                    invalidInputs.paperType && "text-destructive"
                  )}
                >
                  Paper
                </h3>
                <EnhancedMultiSelect
                  data={subjectMetadata?.paperType}
                  label="Paper"
                  onValuesChange={(values) =>
                    setSelectedPaperType(values as string[])
                  }
                  prerequisite="Subject"
                  values={selectedPaperType ?? []}
                />
                {invalidInputs.paperType && (
                  <p className="text-destructive text-sm">Paper is required</p>
                )}
              </div>
              <div
                className="flex flex-col items-start justify-start gap-1"
                ref={yearRef}
              >
                <h3
                  className={cn(
                    "w-max font-medium text-sm",
                    invalidInputs.year && "text-destructive"
                  )}
                >
                  Year
                </h3>
                <EnhancedMultiSelect
                  data={subjectMetadata?.year}
                  label="Year"
                  onValuesChange={(values) =>
                    setSelectedYear(values as string[])
                  }
                  prerequisite="Subject"
                  values={selectedYear ?? []}
                />
                {invalidInputs.year && (
                  <p className="text-destructive text-sm">Year is required</p>
                )}
              </div>
              <div
                className="flex flex-col items-start justify-start gap-1"
                ref={seasonRef}
              >
                <h3
                  className={cn(
                    "w-max font-medium text-sm",
                    invalidInputs.season && "text-destructive"
                  )}
                >
                  Season
                </h3>
                <EnhancedMultiSelect
                  data={subjectMetadata?.season}
                  label="Season"
                  onValuesChange={(values) =>
                    setSelectedSeason(values as string[])
                  }
                  prerequisite="Subject"
                  values={selectedSeason ?? []}
                />
                {invalidInputs.season && (
                  <p className="text-destructive text-sm">Season is required</p>
                )}
              </div>
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-4 px-4 mt-2">
              <ButtonUltility
                isMounted={isMounted}
                setIsSidebarOpen={setIsSidebarOpen}
                revert={() => {
                  setSelectedTopic(currentFilter?.topic ?? []);
                  setSelectedYear(currentFilter?.year ?? []);
                  setSelectedPaperType(currentFilter?.paperType ?? []);
                  setSelectedSeason(currentFilter?.season ?? []);
                }}
                resetEverything={() => {
                  setSelectedPaperType([]);
                  setSelectedTopic([]);
                  setSelectedYear([]);
                  setSelectedSeason([]);
                  setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
                }}
              >
                <Button
                  className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
                  disabled={!isMounted}
                  onClick={() => {
                    const filter = {
                      curriculumId: selectedCurriculumn,
                      subjectId: selectedSubject,
                      topic: selectedTopic?.toSorted() ?? [],
                      paperType: selectedPaperType?.toSorted() ?? [],
                      year:
                        selectedYear?.toSorted(
                          (a, b) => Number(b) - Number(a)
                        ) ?? [],
                      season: selectedSeason?.toSorted() ?? [],
                    };
                    const isSameQuery =
                      JSON.stringify(currentFilter) == JSON.stringify(filter);
                    if (
                      isValidInputs({ scrollOnError: true }) &&
                      !isSameQuery
                    ) {
                      setCurrentFilter({
                        ...filter,
                      });
                      // Update URL parameters without page reload
                    } else if (isSameQuery) {
                      setIsSidebarOpen(false);
                    }
                  }}
                >
                  Search
                  <ScanText />
                </Button>
              </ButtonUltility>
              <Separator />

              <LayoutSetting
                layoutStyle={layoutStyle}
                numberOfColumns={numberOfColumns}
                setLayoutStyle={setLayoutStyle}
                setNumberOfColumns={setNumberOfColumns}
                numberOfQuestionsPerPage={numberOfQuestionsPerPage}
                setNumberOfQuestionsPerPage={setNumberOfQuestionsPerPage}
              />
              <VisualSetting
                showFinishedQuestionTint={showFinishedQuestionTint}
                setShowFinishedQuestionTint={setShowFinishedQuestionTint}
                showScrollToTopButton={showScrollToTopButton}
                setShowScrollToTopButton={setShowScrollToTopButton}
                scrollUpWhenPageChange={scrollUpWhenPageChange}
                setScrollUpWhenPageChange={setScrollUpWhenPageChange}
                imageTheme={imageTheme}
                setImageTheme={setImageTheme}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
      <QuestionInspect
        sortBy={sortBy}
        setSortBy={setSortBy}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        isOpen={isQuestionInspectOpen}
        setIsOpen={setIsQuestionInspectOpen}
        partitionedTopicalData={fullPartitionedData}
        imageTheme={imageTheme}
        bookmarks={bookmarks ?? []}
        isValidSession={!!userSession?.data?.session}
        isBookmarksFetching={isBookmarksFetching}
        isUserSessionPending={isUserSessionPending}
        isBookmarkError={isUserSessionError || isBookmarksError}
        isFinishedQuestionsFetching={isUserFinishedQuestionsFetching}
        isInspectSidebarOpen={isInspectSidebarOpen}
        setIsInspectSidebarOpen={setIsInspectSidebarOpen}
        isFinishedQuestionsError={isUserFinishedQuestionsError}
        userFinishedQuestions={userFinishedQuestions ?? []}
        listId={
          ownerInfo.ownerId === userSession?.data?.user?.id ? listId : undefined
        }
      />
    </>
  );
};
