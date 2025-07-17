"use client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpFromLine,
  Blocks,
  LandPlot,
  Loader2,
  Monitor,
  OctagonAlert,
  RefreshCcw,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import { default as NextImage } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import type { ValidCurriculum } from "@/constants/types";
import EnhancedMultiSelect from "@/features/topical/components/EnhancedMultiSelect";
import EnhancedSelect from "@/features/topical/components/EnhancedSelect";
import { useSidebar } from "@/features/topical/components/TopicalLayoutProvider";
import {
  FILTERS_CACHE_KEY,
  INVALID_INPUTS_DEFAULT,
  TOPICAL_DATA,
  DEFAULT_NUMBER_OF_COLUMNS,
  COLUMN_BREAKPOINTS,
  MAX_TOPIC_SELECTION,
  CHUNK_SIZE,
  CACHE_EXPIRE_TIME,
} from "@/features/topical/constants/constants";
import type {
  FilterData,
  FiltersCache,
  InvalidInputs,
  SelectedBookmark,
  SelectedFinishedQuestion,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
} from "@/features/topical/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import ElasticSlider from "@/features/topical/components/ElasticSlider";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { authClient } from "@/lib/auth/auth-client";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import { getCache, setCache } from "@/drizzle/db";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import CacheAccordion from "@/features/topical/components/CacheAccordion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import { Switch } from "@/components/ui/switch";

const TopicalPage = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<
    ValidCurriculum | ""
  >("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [sidebarKey, setSidebarKey] = useState(0);
  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const availableTopics = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.topic;
  }, [availableSubjects, selectedSubject]);
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const availableYears = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.year;
  }, [availableSubjects, selectedSubject]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const availablePaperTypes = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.paperType;
  }, [availableSubjects, selectedSubject]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const availableSeasons = useMemo(() => {
    return availableSubjects?.find((item) => item.code === selectedSubject)
      ?.season;
  }, [availableSubjects, selectedSubject]);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const isMobileDevice = useIsMobile();
  const [numberOfColumns, setNumberOfColumns] = useState(
    DEFAULT_NUMBER_OF_COLUMNS
  );
  const [showFinishedQuestionTint, setShowFinishedQuestionTint] =
    useState(true);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const [isSessionCacheEnabled, setIsSessionCacheEnabled] = useState(true);
  const [isPersistantCacheEnabled, setIsPersistantCacheEnabled] =
    useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<
    {
      curriculumId: string;
      subjectId: string;
    } & FilterData
  >({
    curriculumId: "",
    subjectId: "",
    topic: [],
    paperType: [],
    year: [],
    season: [],
  });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);

  const resetEverything = () => {
    const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
    let stateToSave: FiltersCache = existingStateJSON
      ? JSON.parse(existingStateJSON)
      : { filters: {} };

    stateToSave = {
      ...stateToSave,
      isSessionCacheEnabled,
      isPersistantCacheEnabled,
      showScrollToTopButton,
      showFinishedQuestionTint,
    };

    stateToSave.lastSessionCurriculum = "";
    stateToSave.lastSessionCurriculum = "";
    if (selectedCurriculum && selectedSubject) {
      stateToSave.filters = {
        ...stateToSave.filters,
        [selectedCurriculum]: {
          ...stateToSave.filters?.[selectedCurriculum],
          [selectedSubject]: {
            topic: [],
            paperType: [],
            year: [],
            season: [],
          },
        },
      };
    }

    localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));

    setSelectedCurriculum("");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    if (!isMobileDevice) {
      setSidebarKey((prev) => prev + 1);
    }

    setIsResetConfirmationOpen(false);
  };

  const isValidInputs = (visualFeedback = false) => {
    const fieldsToValidate: {
      name: keyof InvalidInputs;
      value: string | string[];
      ref: React.RefObject<HTMLDivElement | null>;
      isInvalid: boolean;
    }[] = [
      {
        name: "curriculum",
        value: selectedCurriculum,
        ref: curriculumRef,
        isInvalid: !selectedCurriculum,
      },
      {
        name: "subject",
        value: selectedSubject,
        ref: subjectRef,
        isInvalid: !selectedSubject,
      },
      {
        name: "topic",
        value: selectedTopic,
        ref: topicRef,
        isInvalid:
          selectedTopic.length === 0 ||
          selectedTopic.length > MAX_TOPIC_SELECTION,
      },
      {
        name: "year",
        value: selectedYear,
        ref: yearRef,
        isInvalid: selectedYear.length === 0,
      },
      {
        name: "paperType",
        value: selectedPaperType,
        ref: paperTypeRef,
        isInvalid: selectedPaperType.length === 0,
      },
      {
        name: "season",
        value: selectedSeason,
        ref: seasonRef,
        isInvalid: selectedSeason.length === 0,
      },
    ];

    const newInvalidInputsState: InvalidInputs = {
      ...INVALID_INPUTS_DEFAULT,
    };

    let isFormValid = true;
    let firstInvalidRef: React.RefObject<HTMLDivElement | null> | null = null;

    for (const field of fieldsToValidate) {
      if (field.isInvalid) {
        newInvalidInputsState[field.name] = true;
        if (isFormValid) {
          firstInvalidRef = field.ref;
        }
        isFormValid = false;
      }
    }
    if (visualFeedback) {
      setInvalidInputs(newInvalidInputsState);

      firstInvalidRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    return isFormValid;
  };

  useEffect(() => {
    if (selectedCurriculum) {
      setInvalidInputs((prev) => ({ ...prev, curriculum: false }));
    }
  }, [selectedCurriculum]);

  useEffect(() => {
    if (selectedSubject) {
      setInvalidInputs((prev) => ({ ...prev, subject: false }));
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    }
  }, [selectedTopic]);

  useEffect(() => {
    if (selectedPaperType.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType]);

  useEffect(() => {
    if (selectedYear.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [selectedYear]);

  useEffect(() => {
    if (selectedSeason.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason]);

  useEffect(() => {
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    if (savedState) {
      try {
        const parsedState: FiltersCache = JSON.parse(savedState);
        setIsSessionCacheEnabled(parsedState.isSessionCacheEnabled ?? true);
        setIsPersistantCacheEnabled(
          parsedState.isPersistantCacheEnabled ?? true
        );
        setNumberOfColumns(
          parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
        );
        setShowScrollToTopButton(parsedState.showScrollToTopButton ?? true);
        setShowFinishedQuestionTint(
          parsedState.showFinishedQuestionTint ?? true
        );
        if (
          parsedState.isSessionCacheEnabled &&
          parsedState.lastSessionCurriculum &&
          validateCurriculum(parsedState.lastSessionCurriculum)
        ) {
          setSelectedCurriculum(
            parsedState.lastSessionCurriculum as ValidCurriculum
          );
          const isSubjectValid = validateSubject(
            parsedState.lastSessionCurriculum,
            parsedState.lastSessionSubject
          );
          if (parsedState.lastSessionSubject && isSubjectValid) {
            setSelectedSubject(parsedState.lastSessionSubject);
          }
          if (
            isSubjectValid &&
            validateFilterData({
              curriculumn: parsedState.lastSessionCurriculum,
              data: parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ],
              subject: parsedState.lastSessionSubject,
            })
          ) {
            setSelectedSubject(parsedState.lastSessionSubject);
            setSelectedTopic(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].topic
            );
            setSelectedPaperType(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].paperType
            );
            setSelectedYear(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].year
            );
            setSelectedSeason(
              parsedState.filters[parsedState.lastSessionCurriculum][
                parsedState.lastSessionSubject
              ].season
            );
          }
        }
      } catch {
        localStorage.removeItem(FILTERS_CACHE_KEY);
      }
    }

    setTimeout(() => {
      mountedRef.current = true;
      setIsMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    if (savedState) {
      try {
        const parsedState: FiltersCache = JSON.parse(savedState);
        if (parsedState.isPersistantCacheEnabled) {
          const isSubjectValid = validateSubject(
            selectedCurriculum,
            selectedSubject
          );
          if (selectedSubject && isSubjectValid) {
            setSelectedSubject(selectedSubject);
          }
          if (
            isSubjectValid &&
            validateFilterData({
              data: parsedState.filters[selectedCurriculum][selectedSubject],
              curriculumn: selectedCurriculum,
              subject: selectedSubject,
            })
          ) {
            setSelectedTopic(
              parsedState.filters[selectedCurriculum][selectedSubject].topic
            );
            setSelectedPaperType(
              parsedState.filters[selectedCurriculum][selectedSubject].paperType
            );
            setSelectedYear(
              parsedState.filters[selectedCurriculum][selectedSubject].year
            );
            setSelectedSeason(
              parsedState.filters[selectedCurriculum][selectedSubject].season
            );
          } else {
            setSelectedTopic([]);
            setSelectedYear([]);
            setSelectedPaperType([]);
            setSelectedSeason([]);
          }
        } else {
          setSelectedTopic([]);
          setSelectedYear([]);
          setSelectedPaperType([]);
          setSelectedSeason([]);
        }
      } catch {
        setSelectedTopic([]);
        setSelectedYear([]);
        setSelectedPaperType([]);
        setSelectedSeason([]);
      }
    } else {
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
    }
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedCurriculum]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
    let stateToSave: FiltersCache = existingStateJSON
      ? JSON.parse(existingStateJSON)
      : { filters: {} };

    stateToSave = {
      ...stateToSave,
      isSessionCacheEnabled,
      showScrollToTopButton,
      isPersistantCacheEnabled,
      showFinishedQuestionTint,
    };

    if (selectedCurriculum && selectedSubject) {
      stateToSave.filters = {
        ...stateToSave.filters,
        [selectedCurriculum]: {
          ...stateToSave.filters?.[selectedCurriculum],
          [selectedSubject]: {
            topic: selectedTopic,
            paperType: selectedPaperType,
            year: selectedYear,
            season: selectedSeason,
          },
        },
      };
    }
    if (selectedCurriculum && isSessionCacheEnabled) {
      stateToSave.lastSessionCurriculum = selectedCurriculum;
    }
    if (selectedSubject && isSessionCacheEnabled) {
      stateToSave.lastSessionSubject = selectedSubject;
    }
    localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
  }, [
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedPaperType,
    selectedYear,
    selectedSeason,
    isSessionCacheEnabled,
    isPersistantCacheEnabled,
    showFinishedQuestionTint,
    showScrollToTopButton,
  ]);

  const search = async () => {
    if (isValidInputs(false)) {
      const params = new URLSearchParams();
      params.append("curriculumId", selectedCurriculum);
      params.append("subjectId", selectedSubject);
      params.append("topic", JSON.stringify(selectedTopic));
      params.append("paperType", JSON.stringify(selectedPaperType));
      params.append("year", JSON.stringify(selectedYear));
      params.append("season", JSON.stringify(selectedSeason));
      const response = await fetch(`/api/topical?${params.toString()}`, {
        method: "GET",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      return data as {
        data: SelectedQuestion[];
        isRateLimited: boolean;
      };
    }
    throw new Error("Invalid inputs");
  };

  const {
    data: topicalData,
    isFetching: isTopicalDataFetching,
    isFetched: isTopicalDataFetched,
    isError: isTopicalDataError,
    refetch: refetchTopicalData,
  } = useQuery({
    queryKey: ["topical_questions", currentQuery],
    queryFn: async () => {
      try {
        const cachedData = await getCache<string>(JSON.stringify(currentQuery));
        const currentTime = Date.now();
        const parsedCachedData: {
          data: SelectedQuestion[];
          isRateLimited: boolean;
          cacheExpireTime: number;
        } | null = cachedData ? JSON.parse(cachedData) : null;
        if (
          parsedCachedData &&
          currentTime > parsedCachedData.cacheExpireTime
        ) {
          throw new Error("Cache expired");
        }
        if (parsedCachedData) {
          return {
            data: parsedCachedData.data,
            isRateLimited: parsedCachedData.isRateLimited,
          };
        }
      } catch {
        const result = await search();
        try {
          if (result.data && result.data.length > 0 && !result.isRateLimited) {
            const currentTime = Date.now();
            const cacheExpireTime = currentTime + CACHE_EXPIRE_TIME;
            const cacheData = {
              data: result.data,
              cacheExpireTime,
            };
            setCache(JSON.stringify(currentQuery), JSON.stringify(cacheData));
          } else {
            console.log("rate limited or no questions found");
          }
          return result;
        } catch {
          return result;
        }
      }
      const result = await search();
      try {
        if (result.data && result.data.length > 0 && !result.isRateLimited) {
          const currentTime = Date.now();
          const cacheExpireTime = currentTime + CACHE_EXPIRE_TIME;
          const cacheData = {
            data: result.data,
            cacheExpireTime,
          };
          setCache(JSON.stringify(currentQuery), JSON.stringify(cacheData));
          console.log("setting new cache on new query");
        } else {
          console.log("rate limited or no questions found");
        }
        return result;
      } catch {
        return result;
      }
    },

    enabled: isSearchEnabled,
  });
  const [fullPartitionedData, setFullPartitionedData] = useState<
    SelectedQuestion[][] | undefined
  >(undefined);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [displayedData, setDisplayedData] = useState<SelectedQuestion[]>([]);

  useEffect(() => {
    if (topicalData?.data) {
      const chunkedData: SelectedQuestion[][] = [];
      let currentChunks: SelectedQuestion[] = [];

      topicalData.data.forEach((item: SelectedQuestion) => {
        if (currentChunks.length === CHUNK_SIZE) {
          chunkedData.push(currentChunks);
          currentChunks = [];
        }
        currentChunks.push(item);
      });
      chunkedData.push(currentChunks);

      setFullPartitionedData(chunkedData);
      setDisplayedData(chunkedData[0]);
      setCurrentChunkIndex(0);
    }
  }, [topicalData, numberOfColumns]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentQuery]);

  const {
    data: userSession,
    isError: isUserSessionError,
    isPending: isUserSessionPending,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await authClient.getSession(),
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
        data: SelectedBookmark;
        error?: string;
      } = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }

      return data.data;
    },
    enabled:
      isSearchEnabled && !!userSession?.data?.session && !isUserSessionError,
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
        data: SelectedFinishedQuestion;
        error?: string;
      } = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      return new Set(
        data.data.map((item: { questionId: string }) => item.questionId)
      );
    },
    enabled:
      isSearchEnabled && !!userSession?.data?.session && !isUserSessionError,
  });

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isQuestionViewOpen, setIsQuestionViewOpen] = useState({
    isOpen: false,
    questionId: "",
  });
  const isQuestionViewDisabled = useMemo(() => {
    return (
      !isSearchEnabled ||
      topicalData?.data?.length === 0 ||
      isTopicalDataError ||
      isTopicalDataFetching ||
      !isTopicalDataFetched
    );
  }, [
    isSearchEnabled,
    topicalData,
    isTopicalDataError,
    isTopicalDataFetching,
    isTopicalDataFetched,
  ]);

  useEffect(() => {
    if (isQuestionViewOpen.isOpen && isMobileDevice) {
      setIsSidebarOpen(false);
    }
  }, [isMobileDevice, isQuestionViewOpen.isOpen, setIsSidebarOpen]);

  return (
    <>
      <div className="pt-16 h-screen overflow-hidden">
        <SidebarProvider
          onOpenChange={setIsSidebarOpen}
          onOpenChangeMobile={setIsSidebarOpen}
          open={isSidebarOpen}
          openMobile={isSidebarOpen}
        >
          <Sidebar key={sidebarKey} variant="floating">
            <SidebarHeader className="sr-only m-0 p-0 ">Filters</SidebarHeader>
            <ScrollArea className="h-full" type="always">
              <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
                <div className="flex w-full flex-col items-center justify-start gap-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <AnimatePresence mode="wait">
                        {selectedSubject && selectedCurriculum ? (
                          <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            key={selectedSubject}
                            transition={{
                              duration: 0.15,
                              ease: "easeInOut",
                            }}
                          >
                            <NextImage
                              alt="cover"
                              className="self-center rounded-[2px]"
                              height={126}
                              src={
                                availableSubjects.find(
                                  (item) => item.code === selectedSubject
                                )?.coverImage ?? ""
                              }
                              width={100}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            key={selectedSubject}
                            transition={{
                              duration: 0.15,
                              ease: "easeInOut",
                            }}
                          >
                            <NextImage
                              alt="default subject"
                              className="self-center"
                              height={100}
                              src="/assets/pointing.png"
                              width={100}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="flex flex-col items-start justify-start gap-6">
                        <div
                          className="flex flex-col items-start justify-start gap-1"
                          ref={curriculumRef}
                        >
                          <h3
                            className={cn(
                              "w-max font-medium text-sm",
                              invalidInputs.curriculum && "text-destructive"
                            )}
                          >
                            Curriculum
                          </h3>
                          <EnhancedSelect
                            data={TOPICAL_DATA.map((item) => ({
                              code: item.curriculum,
                              coverImage: item.coverImage,
                            }))}
                            label="Curriculum"
                            prerequisite=""
                            selectedValue={selectedCurriculum}
                            setSelectedValue={(value) => {
                              setSelectedCurriculum(value as ValidCurriculum);
                            }}
                          />
                          {invalidInputs.curriculum && (
                            <p className="text-destructive text-sm">
                              Curriculum is required
                            </p>
                          )}
                        </div>

                        <div
                          className="flex flex-col items-start justify-start gap-1"
                          ref={subjectRef}
                        >
                          <h3
                            className={cn(
                              "w-max font-medium text-sm",
                              invalidInputs.subject && "text-destructive"
                            )}
                          >
                            Subject
                          </h3>
                          <EnhancedSelect
                            data={availableSubjects}
                            label="Subject"
                            prerequisite={
                              selectedCurriculum ? "" : "Curriculum"
                            }
                            selectedValue={selectedSubject}
                            setSelectedValue={setSelectedSubject}
                          />
                          {invalidInputs.subject && (
                            <p className="text-destructive text-sm">
                              Subject is required
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4">
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
                        data={availableTopics}
                        label="Topic"
                        maxLength={MAX_TOPIC_SELECTION}
                        onValuesChange={(values) =>
                          setSelectedTopic(values as string[])
                        }
                        prerequisite="Subject"
                        values={selectedTopic}
                      />
                      {invalidInputs.topic &&
                        selectedTopic.length < MAX_TOPIC_SELECTION && (
                          <p className="text-destructive text-sm">
                            Topic is required
                          </p>
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
                        data={availablePaperTypes?.map((item) =>
                          item.toString()
                        )}
                        label="Paper"
                        onValuesChange={(values) =>
                          setSelectedPaperType(values as string[])
                        }
                        prerequisite="Subject"
                        values={selectedPaperType}
                      />
                      {invalidInputs.paperType && (
                        <p className="text-destructive text-sm">
                          Paper is required
                        </p>
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
                        data={availableYears?.map((item) => item.toString())}
                        label="Year"
                        onValuesChange={(values) =>
                          setSelectedYear(values as string[])
                        }
                        prerequisite="Subject"
                        values={selectedYear}
                      />
                      {invalidInputs.year && (
                        <p className="text-destructive text-sm">
                          Year is required
                        </p>
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
                        data={availableSeasons}
                        label="Season"
                        onValuesChange={(values) =>
                          setSelectedSeason(values as string[])
                        }
                        prerequisite="Subject"
                        values={selectedSeason}
                      />
                      {invalidInputs.season && (
                        <p className="text-destructive text-sm">
                          Season is required
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex w-full flex-col items-center justify-center gap-2">
                    <ButtonUltility
                      isMounted={isMounted}
                      isResetConfirmationOpen={isResetConfirmationOpen}
                      isValidInput={isValidInputs}
                      query={{
                        curriculumId: selectedCurriculum,
                        subjectId: selectedSubject,
                        topic: selectedTopic,
                        paperType: selectedPaperType,
                        year: selectedYear,
                        season: selectedSeason,
                      }}
                      resetEverything={resetEverything}
                      setCurrentQuery={setCurrentQuery}
                      setIsResetConfirmationOpen={setIsResetConfirmationOpen}
                      setIsSearchEnabled={setIsSearchEnabled}
                      setIsSidebarOpen={setIsSidebarOpen}
                    />
                  </div>
                </div>
                <SidebarSeparator />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="flex w-full cursor-pointer items-center justify-start gap-2"
                      variant="secondary"
                    >
                      <Settings />
                      Cache settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[100006]">
                    <CacheAccordion
                      isPersistantCacheEnabled={isPersistantCacheEnabled}
                      isSessionCacheEnabled={isSessionCacheEnabled}
                      setIsPersistantCacheEnabled={setIsPersistantCacheEnabled}
                      setIsSessionCacheEnabled={setIsSessionCacheEnabled}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
                      variant="secondary"
                    >
                      <Blocks />
                      Layout settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[100006] h-[190px] flex flex-col items-center justify-center gap-3">
                    <h4 className="text-sm font-medium text-center mb-2">
                      Number of maximum displayed columns
                    </h4>
                    <ElasticSlider
                      startingValue={1}
                      maxValue={5}
                      isStepped
                      stepSize={1}
                      setColumnsProp={setNumberOfColumns}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      className="flex w-full -mt-1 cursor-pointer items-center justify-start gap-2"
                      variant="secondary"
                    >
                      <LandPlot />
                      Visual settings
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="z-[100006] flex flex-col items-center justify-center gap-3">
                    <div className="flex flex-row items-center justify-center gap-2">
                      <h4 className="text-sm font-medium text-center">
                        Show green tint on finished questions?
                      </h4>
                      <Switch
                        checked={showFinishedQuestionTint}
                        onCheckedChange={setShowFinishedQuestionTint}
                      />
                    </div>
                    <hr />
                    <div className="flex flex-row items-center justify-center gap-2">
                      <h4 className="text-sm font-medium text-center ">
                        Show scroll to top button?
                      </h4>
                      <Switch
                        checked={showScrollToTopButton}
                        onCheckedChange={setShowScrollToTopButton}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </SidebarContent>
            </ScrollArea>
            <SidebarRail />
          </Sidebar>
          <SidebarInset className="!relative flex flex-col items-center justify-start !px-0 gap-6 p-4 pl-2 md:items-start">
            {showScrollToTopButton && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className={cn(
                      "fixed cursor-pointer !px-[10px] bottom-[3%] right-[1.5%] rounded-sm z-[10]",
                      !isScrollingAndShouldShowScrollButton && "!hidden"
                    )}
                    onClick={() =>
                      scrollAreaRef.current?.scrollTo({
                        top: 0,
                        behavior: "instant",
                      })
                    }
                  >
                    <ArrowUpFromLine />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Scroll to top</p>
                </TooltipContent>
              </Tooltip>
            )}
            <div className="flex flex-row items-center justify-start gap-2 ml-2 w-full">
              <Button
                className="!bg-background flex cursor-pointer items-center gap-2 border"
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                variant="outline"
              >
                Filters
                <SlidersHorizontal />
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      className="flex cursor-pointer items-center gap-2 border"
                      disabled={isQuestionViewDisabled}
                      onClick={() => {
                        setIsQuestionViewOpen((prev) => ({
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
                  To inspect questions, run a search first.
                </TooltipContent>
              </Tooltip>
            </div>

            <ScrollArea
              viewportRef={scrollAreaRef}
              className="h-[75vh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
              type="always"
              viewPortOnScrollEnd={() => {
                if (scrollAreaRef.current?.scrollTop === 0) {
                  setIsScrollingAndShouldShowScrollButton(false);
                } else {
                  setIsScrollingAndShouldShowScrollButton(true);
                }
              }}
            >
              {!isTopicalDataFetching && !isTopicalDataFetched && (
                <div className="flex flex-col items-center justify-center w-full h-full mb-3 gap-4">
                  <h1 className="w-full text-center font-bold text-2xl">
                    Topical questions
                  </h1>

                  <div className="flex flex-row items-center justify-center w-full h-full dark:text-green-600 text-green-700 text-center">
                    <ArrowLeft className="hidden md:block" size={16} /> Use the
                    sidebar/filter on the left to search for questions.
                  </div>
                  <div className="w-full md:w-[500px] text-center m-auto">
                    You can scroll down to bottom of the sidebar to adjust
                    content layout, cache behaviour, and visual related settings
                    to your own preference.
                  </div>
                </div>
              )}
              {topicalData?.data && topicalData?.data.length > 0 && (
                <p className="text-sm text-left mb-1">
                  {topicalData?.data.length} question
                  {topicalData?.data.length > 1 ? "s" : ""} found
                </p>
              )}
              {topicalData?.isRateLimited && (
                <p className="text-md text-center mb-2 text-red-600">
                  Limited results displayed due to rate limiting. Sign in for
                  complete access.
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
                      onClick={() => {
                        refetchTopicalData();
                      }}
                      className="flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Refetch
                      <RefreshCcw />
                    </Button>
                  </div>
                )}
              {topicalData?.data.length == 0 &&
                isTopicalDataFetched &&
                !isTopicalDataError &&
                !isTopicalDataFetching && (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-md text-center mb-2 text-red-600">
                      No questions found. Try changing the filters.
                    </p>
                  </div>
                )}
              {isTopicalDataFetching && (
                <Loader2 className="animate-spin m-auto mb-2" />
              )}
              <ResponsiveMasonry
                columnsCountBreakPoints={
                  COLUMN_BREAKPOINTS[
                    numberOfColumns as keyof typeof COLUMN_BREAKPOINTS
                  ]
                }
              >
                <Masonry gutter="10px">
                  {displayedData?.map((question) =>
                    question?.questionImages.map((imageSrc: string) => (
                      <QuestionPreview
                        bookmarks={bookmarks || []}
                        question={question}
                        setIsQuestionViewOpen={setIsQuestionViewOpen}
                        isUserSessionPending={isUserSessionPending}
                        userFinishedQuestions={
                          (userFinishedQuestions as Set<string>) || new Set()
                        }
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
            </ScrollArea>
          </SidebarInset>
        </SidebarProvider>
      </div>
      <QuestionInspect
        isOpen={isQuestionViewOpen}
        setIsOpen={setIsQuestionViewOpen}
        partitionedTopicalData={fullPartitionedData}
        bookmarks={bookmarks || []}
        isValidSession={!!userSession?.data?.session}
        isBookmarksFetching={isBookmarksFetching}
        isUserSessionPending={isUserSessionPending}
        isBookmarkError={isUserSessionError || isBookmarksError}
        isFinishedQuestionsFetching={isUserFinishedQuestionsFetching}
        isInspectSidebarOpen={isInspectSidebarOpen}
        setIsInspectSidebarOpen={setIsInspectSidebarOpen}
        isFinishedQuestionsError={isUserFinishedQuestionsError}
        userFinishedQuestions={userFinishedQuestions as Set<string>}
      />
    </>
  );
};

export default TopicalPage;
