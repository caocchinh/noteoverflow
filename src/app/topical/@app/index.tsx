"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BookMarked,
  CalendarOff,
  ChevronLeft,
  ChevronRight,
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
import { usePathname } from "next/navigation";
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
  MANSONRY_GUTTER_BREAKPOINTS,
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
  updateSearchParams,
  isValidInputs as isValidInputsUtils,
  isSubset,
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
import { QR } from "@/features/topical/components/QR";
import {
  FirstPageButton,
  PreviousPageButton,
  NextPageButton,
  LastPageButton,
} from "@/features/topical/components/PaginationButtons";

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
  const pathname = usePathname();
  const availableSubjects = useMemo(() => {
    return TOPICAL_DATA[
      TOPICAL_DATA.findIndex((item) => item.curriculum === selectedCurriculum)
    ]?.subject;
  }, [selectedCurriculum]);
  const [openInspectOnMount, setOpenInspectOnMount] = useState(false);
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
  const [numberOfQuestion, setNumberOfQuetion] = useState(0);
  const [isStrictModeEnabled, setIsStrictModeEnabled] = useState(false);
  const [isQuestionCacheEnabled, setIsQuestionCacheEnabled] = useState(true);
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
    if (mountedRef.current) {
      return;
    }
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
        setSortParameters({
          sortBy: "year-desc",
        });
      }
    }

    try {
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);

      const parsedState: FiltersCache = savedState
        ? JSON.parse(savedState)
        : false;

      if (parsedState) {
        setIsSessionCacheEnabled(parsedState.isSessionCacheEnabled ?? true);
        setIsPersistantCacheEnabled(
          parsedState.isPersistantCacheEnabled ?? true
        );
        setIsQuestionCacheEnabled(parsedState.isQuestionCacheEnabled ?? true);
        setNumberOfColumns(
          parsedState.numberOfColumns ?? DEFAULT_NUMBER_OF_COLUMNS
        );
        setIsStrictModeEnabled(parsedState.isStrictModeEnabled ?? false);
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

      try {
        if (savedState && !parsedQueryFromSearchParams) {
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
            isQuestionCacheEnabled: parsedState.isQuestionCacheEnabled,
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
      setIsStrictModeEnabled(false);
      setIsQuestionCacheEnabled(true);
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
        questionId: "",
        isInspectOpen: false,
      });
    }
  }, [currentQuery, isStrictModeEnabled]);

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
      isQuestionCacheEnabled,
      showScrollToTopButton,
      numberOfColumns,
      layoutStyle,
      isStrictModeEnabled,
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
    isStrictModeEnabled,
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
    isQuestionCacheEnabled,
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
      params.append("curriculumId", encodeURIComponent(selectedCurriculum));
      params.append("subjectId", encodeURIComponent(selectedSubject));
      params.append("topic", encodeURIComponent(JSON.stringify(selectedTopic)));
      params.append(
        "paperType",
        encodeURIComponent(JSON.stringify(selectedPaperType))
      );
      params.append("year", encodeURIComponent(JSON.stringify(selectedYear)));
      params.append(
        "season",
        encodeURIComponent(JSON.stringify(selectedSeason))
      );
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
  const [sortParameters, setSortParameters] = useState<SortParameters | null>({
    sortBy: "year-desc",
  });
  const subjectSyllabus = TOPICAL_DATA.find(
    (item) => item.curriculum === selectedCurriculum
  )?.subject.find((sub) => sub.code === selectedSubject)?.syllabusLink;

  useEffect(() => {
    if (topicalData?.data) {
      const chunkedData: SelectedQuestion[][] = [];
      let currentChunks: SelectedQuestion[] = [];
      const chunkSize =
        layoutStyle === "pagination"
          ? numberOfQuestionsPerPage
          : INFINITE_SCROLL_CHUNK_SIZE;

      const filteredStrictModeData = isStrictModeEnabled
        ? topicalData.data.filter((item) => {
            return isSubset(item.topics, currentQuery.topic);
          })
        : topicalData.data;

      const sortedData = filteredStrictModeData.toSorted(
        (a: SelectedQuestion, b: SelectedQuestion) => {
          if (sortParameters?.sortBy === "year-asc") {
            return a.year - b.year;
          } else {
            // Default to year-desc
            return b.year - a.year;
          }
        }
      );
      setNumberOfQuetion(sortedData.length);

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
    isStrictModeEnabled,
    currentQuery.topic,
  ]);

  useEffect(() => {
    if (topicalData) {
      setIsQuestionInspectOpen({ isOpen: false, questionId: "" });
    }
  }, [topicalData, isStrictModeEnabled]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    if (!isQuestionCacheEnabled) {
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
            setIsQuestionInspectOpen({
              isOpen: searchParams.isInspectOpen === "true",
              questionId: existingQuestionid,
            });
          }
        }
      } finally {
        setOpenInspectOnMount(true);
      }
    }
  }, [isQuestionCacheEnabled, openInspectOnMount, searchParams, topicalData]);

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
      numberOfQuestion === 0 ||
      isTopicalDataError ||
      !fullPartitionedData ||
      fullPartitionedData.length === 0 ||
      isTopicalDataFetching ||
      !isTopicalDataFetched
    );
  }, [
    isSearchEnabled,
    numberOfQuestion,
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

  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (pathname === "/topical") {
      if (currentQuery.curriculumId && currentQuery.subjectId) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: isQuestionInspectOpen.questionId
            ? isQuestionInspectOpen.questionId
            : "",
          isInspectOpen: false,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

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

                <div className="w-full flex items-center justify-around rounded-md border border-muted-foreground/20 bg-muted p-2">
                  <div className="w-[70%] flex items-start justify-center flex-col">
                    <p className="text-sm font-semibold">Strict mode</p>
                    <p className="text-xs text-muted-foreground">
                      Questions containing unrelated topics will be excluded .
                    </p>
                  </div>
                  <Switch
                    checked={isStrictModeEnabled}
                    title="Toggle"
                    className="hover:cursor-pointer"
                    onCheckedChange={setIsStrictModeEnabled}
                  />
                </div>

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
                            className="flex flex-col gap-2"
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
                            {subjectSyllabus ? (
                              <a
                                className="w-full flex items-center text-sm justify-center rounded-md border border-muted-foreground/20 bg-muted p-1 gap-1 flex-row"
                                href={subjectSyllabus}
                                target="_blank"
                                title="Open syllabus"
                                rel="noreferrer"
                              >
                                Syllabus
                                <BookMarked size={15} />
                              </a>
                            ) : (
                              <div className="w-full flex items-center text-sm justify-center rounded-md border border-muted-foreground/20 bg-muted p-1 gap-1 flex-row">
                                Outdated
                                <CalendarOff size={15} />
                              </div>
                            )}
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
                        onClick={(e) => {
                          e.preventDefault();
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
                            setSortParameters({
                              sortBy: "year-desc",
                            });
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
                  isQuestionCacheEnabled={isQuestionCacheEnabled}
                  setIsQuestionCacheEnabled={setIsQuestionCacheEnabled}
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
                      !isQuestionViewDisabled && "!hidden",
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
                      <FirstPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={scrollUpWhenPageChange}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <PreviousPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={scrollUpWhenPageChange}
                        scrollAreaRef={scrollAreaRef}
                      />
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
                      <NextPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={scrollUpWhenPageChange}
                        scrollAreaRef={scrollAreaRef}
                      />
                      <LastPageButton
                        currentChunkIndex={currentChunkIndex}
                        setCurrentChunkIndex={setCurrentChunkIndex}
                        fullPartitionedData={fullPartitionedData}
                        setDisplayedData={setDisplayedData}
                        scrollUpWhenPageChange={scrollUpWhenPageChange}
                        scrollAreaRef={scrollAreaRef}
                      />
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
                      !isQuestionViewDisabled && "!hidden",
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
                      <span className="md:hidden inline">top</span> to search
                      for questions
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
                              ↑↓←→
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
                        Scroll down to the bottom of the sidebar to adjust
                        content layout, cache behaviour, and visual settings to
                        your preference.
                      </p>
                    </div>

                    <div className="w-full md:w-[377px]  !max-w-full h-[inherit] p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                      <h3 className="text-lg font-semibold text-center mb-2 text-blue-700 dark:text-blue-400">
                        Track Your Progress
                      </h3>
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <p className="text-blue-600 dark:text-blue-400 text-center">
                          Bookmark questions to create your personal list, share
                          with friends, and mark completed questions to track
                          your revision progress. Use the mini sidebar below to
                          access it.
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
                    Invalid URL parameters, or data has been outdated! Please
                    input manually using the filter on the left.
                  </div>
                )}

              {topicalData?.data && topicalData?.data.length > 0 && (
                <p className="text-sm text-left mb-1">
                  {numberOfQuestion} question
                  {numberOfQuestion > 1 ? "s" : ""} found
                </p>
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
              {numberOfQuestion == 0 &&
                isTopicalDataFetched &&
                !isTopicalDataError &&
                !isTopicalDataFetching && (
                  <div className="flex items-center justify-center w-full h-full">
                    <p className="text-md text-center mb-2 text-red-600">
                      No questions found. Try changing the filters. Certain
                      topics may be paired with specific papers.
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
                // @ts-expect-error - gutterBreakPoints is not typed by the library
                gutterBreakPoints={MANSONRY_GUTTER_BREAKPOINTS}
              >
                <Masonry>
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
        currentQuery={currentQuery}
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
