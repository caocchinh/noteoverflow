"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  Loader2,
  Monitor,
  OctagonAlert,
  RefreshCcw,
  ScanText,
  Send,
  SlidersHorizontal,
} from "lucide-react";
import { default as NextImage } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
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
  DEFAULT_NUMBER_OF_COLUMNS,
  COLUMN_BREAKPOINTS,
  INFINITE_SCROLL_CHUNK_SIZE,
  CACHE_EXPIRE_TIME,
  DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  DEFAULT_LAYOUT_STYLE,
  DEFAULT_CACHE,
  DEFAULT_IMAGE_THEME,
} from "@/features/topical/constants/constants";
import type {
  FilterData,
  FiltersCache,
  InvalidInputs,
  LayoutStyle,
  SelectedBookmark,
  SelectedFinishedQuestion,
  SortParameters,
  CurrentQuery,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  validateCurriculum,
  validateFilterData,
  validateSubject,
  isOverScrolling,
  syncFilterCacheToLocalStorage,
  computeDefaultSortParams,
  updateSearchParams,
  isValidInputs as isValidInputsUtils,
} from "@/features/topical/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { authClient } from "@/lib/auth/auth-client";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import { getCache, setCache } from "@/drizzle/db";
import ButtonUltility from "@/features/topical/components/ButtonUltility";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import CacheSetting from "@/features/topical/components/CacheSetting";
import LayoutSetting from "@/features/topical/components/LayoutSetting";
import VisualSetting from "@/features/topical/components/VisualSetting";
import { Separator } from "@/components/ui/separator";
import { JumpToTabButton } from "@/features/topical/components/JumpToTabButton";
import Sort from "@/features/topical/components/Sort";
import { Switch } from "@/components/ui/switch";
import { RecentQuery } from "@/features/topical/components/RecentQuery";
import { addRecentQuery } from "@/features/topical/server/actions";
import { toast } from "sonner";
import { BAD_REQUEST, TOPICAL_DATA } from "@/constants/constants";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import { ArrowDown } from "lucide-react";
import { QR } from "@/features/topical/components/QR";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<ValidCurriculum>("CIE A-LEVEL");
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
  const isMobileDevice = useIsMobile();
  const [numberOfColumns, setNumberOfColumns] = useState(
    DEFAULT_NUMBER_OF_COLUMNS
  );
  const [showFinishedQuestionTint, setShowFinishedQuestionTint] =
    useState(true);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const [layoutStyle, setLayoutStyle] =
    useState<LayoutStyle>(DEFAULT_LAYOUT_STYLE);
  const [numberOfQuestionsPerPage, setNumberOfQuestionsPerPage] = useState(
    DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE
  );
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
  const [showFinishedQuestion, setShowFinishedQuestion] = useState(true);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery>({
    curriculumId: "",
    subjectId: "",
    topic: [],
    paperType: [],
    year: [],
    season: [],
  });
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(true);
  const [scrollUpWhenPageChange, setScrollUpWhenPageChange] = useState(true);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
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
  const isOverwriting = useRef(false);
  const [isValidSearchParams, setIsValidSearchParams] = useState(true);
  const [imageTheme, setImageTheme] = useState<"dark" | "light">(
    DEFAULT_IMAGE_THEME
  );
  const url = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams(window.location.search);
    params.set("queryKey", JSON.stringify(currentQuery));
    return `${BETTER_AUTH_URL}/topical?${params.toString()}`;
  }, [BETTER_AUTH_URL, currentQuery]);

  useEffect(() => {
    window.addEventListener("resize", overflowScrollHandler);

    return () => {
      window.removeEventListener("resize", overflowScrollHandler);
    };
  }, [overflowScrollHandler]);

  const resetEverything = () => {
    isOverwriting.current = true;
    try {
      const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
      const stateToSave: FiltersCache = existingStateJSON
        ? JSON.parse(existingStateJSON)
        : { ...DEFAULT_CACHE };

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
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }

    setSelectedCurriculum("CIE A-LEVEL");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    if (!isMobileDevice) {
      setSidebarKey((prev) => prev + 1);
    }
    setTimeout(() => {
      isOverwriting.current = false;
    }, 0);
  };

  const revert = () => {
    if (!currentQuery.curriculumId || !currentQuery.subjectId) {
      return;
    }
    isOverwriting.current = true;
    setSelectedCurriculum(currentQuery.curriculumId as ValidCurriculum);
    setSelectedSubject(currentQuery.subjectId);
    setSelectedTopic(currentQuery.topic);
    setSelectedYear(currentQuery.year);
    setSelectedPaperType(currentQuery.paperType);
    setSelectedSeason(currentQuery.season);
    setTimeout(() => {
      isOverwriting.current = false;
    }, 0);
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
    let parsedQueryFromSearchParams;
    if (searchParams.queryKey) {
      try {
        parsedQueryFromSearchParams = JSON.parse(
          searchParams.queryKey as string
        );
      } catch {
        parsedQueryFromSearchParams = undefined;
        setIsValidSearchParams(false);
      }
      if (
        !parsedQueryFromSearchParams ||
        !validateCurriculum(parsedQueryFromSearchParams.curriculumId) ||
        !validateSubject(
          parsedQueryFromSearchParams.curriculumId,
          parsedQueryFromSearchParams.subjectId
        ) ||
        !validateFilterData({
          data: {
            topic: parsedQueryFromSearchParams.topic,
            paperType: parsedQueryFromSearchParams.paperType,
            year: parsedQueryFromSearchParams.year,
            season: parsedQueryFromSearchParams.season,
          },
          curriculumn: parsedQueryFromSearchParams.curriculumId,
          subject: parsedQueryFromSearchParams.subjectId,
        })
      ) {
        parsedQueryFromSearchParams = undefined;
        setIsValidSearchParams(false);
      } else {
        setIsValidSearchParams(true);
        setCurrentQuery(parsedQueryFromSearchParams);
        setIsSearchEnabled(true);
        setSortParameters(
          computeDefaultSortParams({
            paperType: parsedQueryFromSearchParams.paperType,
            topic: parsedQueryFromSearchParams.topic,
            year: parsedQueryFromSearchParams.year,
            season: parsedQueryFromSearchParams.season,
          })
        );
      }
    }

    try {
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      try {
        if (savedState && !parsedQueryFromSearchParams) {
          const parsedState: FiltersCache = JSON.parse(savedState);
          setIsSessionCacheEnabled(parsedState.isSessionCacheEnabled ?? true);
          setIsPersistantCacheEnabled(
            parsedState.isPersistantCacheEnabled ?? true
          );
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
        } else if (parsedQueryFromSearchParams) {
          setSelectedCurriculum(
            parsedQueryFromSearchParams.curriculumId as ValidCurriculum
          );
          setSelectedSubject(parsedQueryFromSearchParams.subjectId);
          setSelectedPaperType(parsedQueryFromSearchParams.paperType);
          setSelectedTopic(parsedQueryFromSearchParams.topic);
          setSelectedYear(parsedQueryFromSearchParams.year);
          setSelectedSeason(parsedQueryFromSearchParams.season);
          syncFilterCacheToLocalStorage({
            selectedCurriculum: parsedQueryFromSearchParams.curriculumId,
            selectedSubject: parsedQueryFromSearchParams.subjectId,
            selectedTopic: parsedQueryFromSearchParams.topic,
            selectedPaperType: parsedQueryFromSearchParams.paperType,
            selectedYear: parsedQueryFromSearchParams.year,
            selectedSeason: parsedQueryFromSearchParams.season,
          });
        }
      } catch {
        localStorage.removeItem(FILTERS_CACHE_KEY);
      }
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      // Set default values
      setIsSessionCacheEnabled(true);
      setIsPersistantCacheEnabled(true);
      setNumberOfColumns(DEFAULT_NUMBER_OF_COLUMNS);
      setLayoutStyle(DEFAULT_LAYOUT_STYLE);
      setNumberOfQuestionsPerPage(DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE);
      setShowScrollToTopButton(true);
      setShowFinishedQuestionTint(true);
    }

    setTimeout(() => {
      mountedRef.current = true;
      setIsMounted(true);
    }, 0);
  }, [searchParams]);

  useEffect(() => {
    if (!mountedRef.current || isOverwriting.current) {
      return;
    }
    try {
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
                parsedState.filters[selectedCurriculum][selectedSubject]
                  .paperType
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
    } catch (error) {
      console.error("Failed to access localStorage:", error);
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
    }
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (currentQuery.curriculumId && currentQuery.subjectId) {
      updateSearchParams({
        query: JSON.stringify(currentQuery),
      });
    }
  }, [currentQuery, searchParams]);

  useEffect(() => {
    if (!mountedRef.current || isOverwriting.current) {
      return;
    }
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [selectedCurriculum, isOverwriting]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    syncFilterCacheToLocalStorage({
      isSessionCacheEnabled,
      imageTheme,
      isPersistantCacheEnabled,
      showFinishedQuestionTint,
      scrollUpWhenPageChange,
      showScrollToTopButton,
      numberOfColumns,
      layoutStyle,
      numberOfQuestionsPerPage,
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedPaperType,
      selectedYear,
      selectedSeason,
    });
  }, [
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedPaperType,
    selectedYear,
    selectedSeason,
    isSessionCacheEnabled,
    imageTheme,
    isPersistantCacheEnabled,
    showFinishedQuestionTint,
    showScrollToTopButton,
    layoutStyle,
    numberOfQuestionsPerPage,
    scrollUpWhenPageChange,
    numberOfColumns,
  ]);

  const isValidInputs = ({
    scrollOnError = true,
  }: {
    scrollOnError?: boolean;
  }) => {
    return isValidInputsUtils({
      scrollOnError,
      curriculumRef: curriculumRef,
      subjectRef: subjectRef,
      topicRef: topicRef,
      yearRef: yearRef,
      paperTypeRef: paperTypeRef,
      seasonRef: seasonRef,
      selectedCurriculum: selectedCurriculum,
      selectedSubject: selectedSubject,
      selectedTopic: selectedTopic,
      selectedYear: selectedYear,
      selectedPaperType: selectedPaperType,
      selectedSeason: selectedSeason,
      setInvalidInputs: setInvalidInputs,
    });
  };

  const search = async () => {
    if (isValidInputs({ scrollOnError: false })) {
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
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data as {
        data: SelectedQuestion[];
        isRateLimited: boolean;
      };
    }
    throw new Error("Invalid inputs");
  };

  const { mutate: mutateRecentQuery, isPending: isAddRecentQueryPending } =
    useMutation({
      mutationKey: ["add_recent_query"],
      mutationFn: async (
        queryKey: {
          curriculumId: string;
          subjectId: string;
        } & FilterData
      ) => {
        const result = await addRecentQuery({ queryKey: queryKey });
        if (result.error) {
          throw new Error(result.error);
        }
        return {
          deletedKey: result.data?.deletedKey,
          lastSearch: result.data?.lastSearch,
          realQueryKey: queryKey,
        };
      },
      onSuccess: (data) => {
        queryClient.setQueryData<
          {
            queryKey: string;
            sortParams: string | null;
            lastSearch: number;
          }[]
        >(["user_recent_query"], (oldData) => {
          if (!oldData) {
            return oldData;
          }
          if (data && data.realQueryKey) {
            let newData = oldData;
            if (data.deletedKey) {
              newData = newData.filter(
                (item) => item.queryKey !== data.deletedKey
              );
            }
            const isQueryAlreadyExist = newData.find(
              (item) => item.queryKey === JSON.stringify(data.realQueryKey)
            );
            if (!isQueryAlreadyExist) {
              newData.unshift({
                queryKey: JSON.stringify(data.realQueryKey),
                sortParams: null,
                lastSearch: data.lastSearch?.getTime() ?? 0,
              });
            } else {
              newData = newData.map((item) => {
                if (item.queryKey === JSON.stringify(data.realQueryKey)) {
                  return {
                    ...item,
                    lastSearch: data.lastSearch?.getTime() ?? 0,
                  };
                }
                return item;
              });
            }
            return newData;
          }
          return oldData;
        });
      },
      onError: (error) => {
        if (error.message === BAD_REQUEST) {
          toast.error(
            "Failed to add recent search to database. Invalid or outdata data. Please refresh the website!"
          );
          return;
        }
        toast.error(
          "Failed to add recent search to database: " +
            error.message +
            ". Please refresh the page."
        );
      },
    });

  const {
    data: topicalData,
    isFetching: isTopicalDataFetching,
    isFetched: isTopicalDataFetched,
    isError: isTopicalDataError,
    refetch: refetchTopicalData,
  } = useQuery({
    queryKey: ["topical_questions", currentQuery],
    queryFn: async () => {
      mutateRecentQuery(currentQuery);

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
  const [sortParameters, setSortParameters] = useState<SortParameters | null>(
    null
  );

  useEffect(() => {
    if (topicalData?.data) {
      const chunkedData: SelectedQuestion[][] = [];
      let currentChunks: SelectedQuestion[] = [];
      const chunkSize =
        layoutStyle === "pagination"
          ? numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;
      const sortedData = topicalData.data.toSorted(
        (a: SelectedQuestion, b: SelectedQuestion) => {
          const aPaperTypeScore =
            (sortParameters?.paperType.data?.[a.paperType] ?? 0) *
            (sortParameters?.paperType.weight ?? 0);
          const bPaperTypeScore =
            (sortParameters?.paperType.data?.[b.paperType] ?? 0) *
            (sortParameters?.paperType.weight ?? 0);
          const aTopicScore =
            a.topics.reduce((acc, curr) => {
              if (sortParameters?.topic && curr) {
                return (
                  acc +
                  sortParameters.topic.data?.[curr] *
                    (sortParameters.topic.weight ?? 0)
                );
              }
              return acc;
            }, 0) / a.topics.length;
          const bTopicScore =
            b.topics.reduce((acc, curr) => {
              if (sortParameters?.topic && curr) {
                return (
                  acc +
                  sortParameters.topic.data?.[curr] *
                    (sortParameters.topic.weight ?? 0)
                );
              }
              return acc;
            }, 0) / b.topics.length;

          const aYearScore =
            (sortParameters?.year.data?.[a.year] ?? 0) *
            (sortParameters?.year.weight ?? 0);
          const bYearScore =
            (sortParameters?.year.data?.[b.year] ?? 0) *
            (sortParameters?.year.weight ?? 0);
          const aSeasonScore =
            (sortParameters?.season.data?.[a.season] ?? 0) *
            (sortParameters?.season.weight ?? 0);
          const bSeasonScore =
            (sortParameters?.season.data?.[b.season] ?? 0) *
            (sortParameters?.season.weight ?? 0);
          return (
            bPaperTypeScore -
            aPaperTypeScore +
            (!Number.isNaN(bTopicScore) ? bTopicScore : 0) -
            (!Number.isNaN(aTopicScore) ? aTopicScore : 0) +
            bYearScore -
            aYearScore +
            bSeasonScore -
            aSeasonScore
          );
        }
      );

      sortedData.forEach((item: SelectedQuestion) => {
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
    sortParameters,
  ]);

  useEffect(() => {
    setIsQuestionInspectOpen({ isOpen: false, questionId: "" });
  }, [fullPartitionedData]);

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentQuery]);

  useEffect(() => {
    if (isMobileDevice) {
      setIsSidebarOpen(false);
    }
  }, [currentQuery, isMobileDevice, setIsSidebarOpen]);

  useEffect(() => {
    overflowScrollHandler();
  }, [overflowScrollHandler, fullPartitionedData, layoutStyle]);
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
      isSearchEnabled &&
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["all_user_bookmarks"]),
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
      isSearchEnabled &&
      !!userSession?.data?.session &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_finished_questions"]),
  });

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] = useState({
    isOpen: false,
    questionId: "",
  });
  const isQuestionViewDisabled = useMemo(() => {
    return (
      !isSearchEnabled ||
      topicalData?.data?.length === 0 ||
      isTopicalDataError ||
      !fullPartitionedData ||
      fullPartitionedData.length === 0 ||
      isTopicalDataFetching ||
      !isTopicalDataFetched
    );
  }, [
    isSearchEnabled,
    topicalData?.data?.length,
    isTopicalDataError,
    fullPartitionedData,
    isTopicalDataFetching,
    isTopicalDataFetched,
  ]);

  useEffect(() => {
    if (isQuestionInspectOpen.isOpen && isMobileDevice) {
      setIsSidebarOpen(false);
    }
  }, [isMobileDevice, isQuestionInspectOpen.isOpen, setIsSidebarOpen]);

  return (
    <>
      <div className="pt-12 h-screen overflow-hidden">
        <SidebarProvider
          onOpenChange={setIsSidebarOpen}
          onOpenChangeMobile={setIsSidebarOpen}
          open={isSidebarOpen}
          openMobile={isSidebarOpen}
        >
          <Sidebar
            key={sidebarKey}
            variant="floating"
            onTransitionEnd={(e) => {
              if (e.propertyName == "left") {
                overflowScrollHandler();
              }
            }}
          >
            <SidebarHeader className="sr-only m-0 p-0 ">Filters</SidebarHeader>
            <ScrollArea className="h-full" type="always">
              <SidebarContent className="flex w-full flex-col items-center justify-start gap-4 overflow-x-hidden p-4 pt-2">
                <RecentQuery
                  isAddRecentQueryPending={isAddRecentQueryPending}
                  setSortParameters={setSortParameters}
                  setIsSidebarOpen={setIsSidebarOpen}
                  setIsSearchEnabled={setIsSearchEnabled}
                  setCurrentQuery={setCurrentQuery}
                  isUserSessionPending={isUserSessionPending}
                  isValidSession={!!userSession?.data?.session}
                  currentQuery={currentQuery}
                  setSelectedCurriculum={setSelectedCurriculum}
                  setSelectedSubject={setSelectedSubject}
                  setSelectedTopic={setSelectedTopic}
                  setSelectedYear={setSelectedYear}
                  setSelectedPaperType={setSelectedPaperType}
                  setSelectedSeason={setSelectedSeason}
                  isOverwriting={isOverwriting}
                />
                <SidebarSeparator />

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
                              src="/assets/pointing.webp"
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
                        onValuesChange={(values) =>
                          setSelectedTopic(values as string[])
                        }
                        prerequisite="Subject"
                        values={selectedTopic}
                      />
                      {invalidInputs.topic && (
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
                  <div className="flex w-full flex-col items-center justify-center gap-3">
                    <ButtonUltility
                      isMounted={isMounted}
                      revert={revert}
                      resetEverything={resetEverything}
                      setIsSidebarOpen={setIsSidebarOpen}
                    >
                      <Button
                        className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
                        disabled={!isMounted || isTopicalDataFetching}
                        onClick={() => {
                          const query = {
                            curriculumId: selectedCurriculum,
                            subjectId: selectedSubject,
                            topic: selectedTopic.toSorted(),
                            paperType: selectedPaperType.toSorted(),
                            year: selectedYear.toSorted(
                              (a, b) => Number(b) - Number(a)
                            ),
                            season: selectedSeason.toSorted(),
                          };
                          const isSameQuery =
                            JSON.stringify(currentQuery) ==
                            JSON.stringify(query);
                          if (
                            isValidInputs({ scrollOnError: true }) &&
                            !isSameQuery
                          ) {
                            setIsSearchEnabled(true);
                            setCurrentQuery({
                              ...query,
                            });
                            // Update URL parameters without page reload
                            setSortParameters(
                              computeDefaultSortParams({
                                paperType: query.paperType,
                                topic: query.topic,
                                year: query.year,
                                season: query.season,
                              })
                            );
                          } else if (isSameQuery && isMobileDevice) {
                            setIsSidebarOpen(false);
                          }
                        }}
                      >
                        {isTopicalDataFetching ? "Searching" : "Search"}
                        <ScanText />
                      </Button>
                      <ShareFilterButton
                        isQuestionViewDisabled={isQuestionViewDisabled}
                        url={url}
                      />
                    </ButtonUltility>
                  </div>
                </div>
                <SidebarSeparator />
                <CacheSetting
                  isPersistantCacheEnabled={isPersistantCacheEnabled}
                  isSessionCacheEnabled={isSessionCacheEnabled}
                  setIsPersistantCacheEnabled={setIsPersistantCacheEnabled}
                  setIsSessionCacheEnabled={setIsSessionCacheEnabled}
                />
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
              </SidebarContent>
            </ScrollArea>
            <SidebarRail />
          </Sidebar>
          <SidebarInset
            className="!relative flex flex-col items-center justify-start !px-0 gap-4 p-4 pl-2 md:items-start w-full overflow-hidden"
            ref={sideBarInsetRef}
          >
            <ScrollToTopButton
              showScrollToTopButton={showScrollToTopButton}
              isScrollingAndShouldShowScrollButton={
                isScrollingAndShouldShowScrollButton
              }
              scrollAreaRef={scrollAreaRef}
            />

            {isUltilityOverflowingRight && (
              <Button
                className="absolute right-0 top-5 rounded-full cursor-pointer w-7 h-7 z-[200]"
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
                className="absolute left-0 top-5 rounded-full cursor-pointer w-7 h-7 z-[200]"
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
            <ScrollArea
              viewPortOnScroll={overflowScrollHandler}
              className="w-full  "
              viewportRef={ultilityHorizontalScrollBarRef}
            >
              <div
                className="flex flex-row h-full items-center justify-start gap-2 w-max pl-4 pr-2"
                ref={ultilityRef}
              >
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
                    className={cn(
                      !isQuestionViewDisabled && "hidden",
                      "flex justify-center items-center gap-2"
                    )}
                  >
                    <Info className="w-4 h-4" />
                    To inspect questions, run a search first.
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
                            fullPartitionedData![
                              fullPartitionedData!.length - 1
                            ]
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
                <Sort
                  sortParameters={sortParameters}
                  setSortParameters={setSortParameters}
                  isDisabled={isQuestionViewDisabled}
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "border-1 h-full flex items-center justify-center gap-1 p-2 rounded-md cursor-pointer",
                        isQuestionViewDisabled && "opacity-50",
                        showFinishedQuestion
                          ? "border-green-600"
                          : "border-muted-foreground"
                      )}
                      onClick={() => {
                        if (isQuestionViewDisabled) {
                          return;
                        }
                        setShowFinishedQuestion(!showFinishedQuestion);
                      }}
                    >
                      <Switch
                        className="border cursor-pointer border-dashed data-[state=checked]:bg-green-600 dark:data-[state=checked]:border-solid "
                        id="show-finished-question"
                        checked={showFinishedQuestion ?? false}
                      />
                      <p
                        className={cn(
                          showFinishedQuestion
                            ? "text-green-600"
                            : "text-muted-foreground",
                          "cursor-pointer text-sm"
                        )}
                      >
                        Show finished questions
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    className={cn(
                      !isQuestionViewDisabled && "hidden",
                      "flex justify-center items-center gap-2"
                    )}
                  >
                    <Info className="w-4 h-4" />
                    To toggle this, run a search first.
                  </TooltipContent>
                </Tooltip>
                <ShareFilter isDisabled={isQuestionViewDisabled} url={url} />
              </div>

              <ScrollBar
                orientation="horizontal"
                className="[&_.bg-border]:bg-transparent"
              />
            </ScrollArea>
            <ScrollArea
              viewportRef={scrollAreaRef}
              className="h-[78vh] px-4 w-full [&_.bg-border]:bg-logo-main overflow-auto"
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
                  <div className="w-full md:w-[500px] text-center m-auto text-logo-main">
                    You can bookmark questions and save them to your own list
                    and share them with your friends. Or mark a question as
                    completed to track your progress and for revision.
                  </div>

                  <div className="w-full md:w-[500px] text-center m-auto text-muted-foreground mt-2">
                    Use the mini menu bar below to navigate.
                  </div>
                  <ArrowDown size={20} strokeWidth={1.5} />
                </div>
              )}
              {!isTopicalDataFetching &&
                !isTopicalDataFetched &&
                !isValidSearchParams && (
                  <div className="text-red-500 text-center">
                    Invalid URL parameters, or data has been outdated! Please
                    input manually using the filter on the left.
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
                <Masonry gutter="11px">
                  {displayedData
                    .filter((question: SelectedQuestion) => {
                      if (
                        !userFinishedQuestions ||
                        !userSession?.data?.session
                      ) {
                        return true;
                      }
                      if (
                        !showFinishedQuestion &&
                        userFinishedQuestions.some(
                          (item) => item.question.id === question.id
                        )
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((question) =>
                      question?.questionImages.map((imageSrc: string) => (
                        <QuestionPreview
                          bookmarks={bookmarks ?? []}
                          question={question}
                          imageTheme={imageTheme}
                          setIsQuestionInspectOpen={setIsQuestionInspectOpen}
                          isUserSessionPending={isUserSessionPending}
                          userFinishedQuestions={userFinishedQuestions ?? []}
                          showFinishedQuestionTint={showFinishedQuestionTint}
                          isBookmarkError={
                            isUserSessionError || isBookmarksError
                          }
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
          </SidebarInset>
        </SidebarProvider>
      </div>
      <QuestionInspect
        isOpen={isQuestionInspectOpen}
        setIsOpen={setIsQuestionInspectOpen}
        partitionedTopicalData={fullPartitionedData}
        bookmarks={bookmarks ?? []}
        imageTheme={imageTheme}
        isValidSession={!!userSession?.data?.session}
        isBookmarksFetching={isBookmarksFetching}
        isUserSessionPending={isUserSessionPending}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        setSortParameters={setSortParameters}
        sortParameters={sortParameters}
        isBookmarkError={isUserSessionError || isBookmarksError}
        isFinishedQuestionsFetching={isUserFinishedQuestionsFetching}
        isInspectSidebarOpen={isInspectSidebarOpen}
        setIsInspectSidebarOpen={setIsInspectSidebarOpen}
        isFinishedQuestionsError={isUserFinishedQuestionsError}
        userFinishedQuestions={userFinishedQuestions ?? []}
      />
    </>
  );
};

export default TopicalClient;

const ShareFilterButton = ({
  isQuestionViewDisabled,
  url,
}: {
  isQuestionViewDisabled: boolean;
  url: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <Button
        className="w-full cursor-pointer bg-logo-main text-white hover:bg-logo-main/90"
        disabled={isQuestionViewDisabled}
        onClick={() => {
          setIsOpen(true);
        }}
      >
        Share filter
        <Send />
      </Button>
      <QR url={url} isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};
