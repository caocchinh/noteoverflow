"use client";
import React, { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { usePathname } from "next/navigation";
import {
  COLUMN_BREAKPOINTS,
  INFINITE_SCROLL_CHUNK_SIZE,
  CACHE_EXPIRE_TIME,
  MANSONRY_GUTTER_BREAKPOINTS,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import type {
  FilterData,
  SortParameters,
  CurrentQuery,
  QuestionInspectOpenState,
  SavedActivitiesResponse,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import {
  updateSearchParams,
  isSubset,
  chunkQuestionsData,
} from "@/features/topical/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import QuestionPreview from "@/features/topical/components/QuestionPreview";
import { authClient } from "@/lib/auth/auth-client";
import InfiniteScroll from "@/features/topical/components/InfiniteScroll";
import { getCache, setCache } from "@/drizzle/db";
import QuestionInspect from "@/features/topical/components/QuestionInspect";
import { addRecentQuery } from "@/features/topical/server/actions";
import { toast } from "sonner";
import { BAD_REQUEST, INITIAL_QUERY } from "@/constants/constants";
import { ScrollToTopButton } from "@/features/topical/components/ScrollToTopButton";
import AppUltilityBar from "@/features/topical/components/AppUltilityBar";
import { UtilityOverflowProvider } from "@/features/topical/hooks/useUtilityOverflow";
import AppSidebar from "@/features/topical/components/AppSidebar";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const pathname = usePathname();
  const [openInspectOnMount, setOpenInspectOnMount] = useState(false);
  const isMobileDevice = useIsMobile();
  // UI preferences hook
  const [showFinishedQuestion, setShowFinishedQuestion] = useState(true);

  const [numberOfQuestion, setNumberOfQuetion] = useState(0);
  const [
    isScrollingAndShouldShowScrollButton,
    setIsScrollingAndShouldShowScrollButton,
  ] = useState(false);
  const mountedRef = useRef(false);
  const { isAppSidebarOpen, setIsAppSidebarOpen, uiPreferences } =
    useTopicalApp();
  const [isInspectSidebarOpen, setIsInspectSidebarOpen] = useState(true);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery>({
    ...INITIAL_QUERY,
  });
  const [isValidSearchParams, setIsValidSearchParams] = useState(true);

  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const ultilityRef = useRef<HTMLDivElement | null>(null);

  const filterUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const params = new URLSearchParams(window.location.search);
    params.set("queryKey", JSON.stringify(currentQuery));
    return `${BETTER_AUTH_URL}/topical?${params.toString()}`;
  }, [BETTER_AUTH_URL, currentQuery]);

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
  }, [currentQuery, uiPreferences.isStrictModeEnabled]);

  const search = async () => {
    const params = new URLSearchParams();
    params.append(
      "curriculumId",
      encodeURIComponent(currentQuery.curriculumId)
    );
    params.append("subjectId", encodeURIComponent(currentQuery.subjectId));
    params.append(
      "topic",
      encodeURIComponent(JSON.stringify(currentQuery.topic))
    );
    params.append(
      "paperType",
      encodeURIComponent(JSON.stringify(currentQuery.paperType))
    );
    params.append(
      "year",
      encodeURIComponent(JSON.stringify(currentQuery.year))
    );
    params.append(
      "season",
      encodeURIComponent(JSON.stringify(currentQuery.season))
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
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });

  // Memoized data processing to prevent expensive recalculations
  const processedData = useMemo(() => {
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

    const sortedData = filteredStrictModeData.toSorted(
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
      totalCount: sortedData.length,
    };
  }, [
    topicalData?.data,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    uiPreferences.isStrictModeEnabled,
    currentQuery.topic,
    sortParameters.sortBy,
  ]);

  // Memoized callbacks to prevent child re-renders
  const handleQuestionClick = useCallback((questionId: string) => {
    setIsQuestionInspectOpen({
      isOpen: true,
      questionId,
    });
  }, []);

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
    if (fullPartitionedData) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      setDisplayedData([
        ...displayedData,
        ...(fullPartitionedData[currentChunkIndex + 1] ?? []),
      ]);
    }
  }, [fullPartitionedData, currentChunkIndex, displayedData]);

  useEffect(() => {
    if (processedData) {
      setNumberOfQuetion(processedData.totalCount);
      setFullPartitionedData(processedData.chunkedData);
      setDisplayedData(processedData.chunkedData[0]);
      setCurrentChunkIndex(0);
      mainContentScrollAreaRef.current?.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [processedData]);

  useEffect(() => {
    if (topicalData) {
      setIsQuestionInspectOpen({ isOpen: false, questionId: "" });
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
  }, [
    uiPreferences.isQuestionCacheEnabled,
    openInspectOnMount,
    searchParams,
    topicalData,
  ]);

  useEffect(() => {
    mainContentScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [currentQuery]);

  useEffect(() => {
    if (isMobileDevice) {
      setIsAppSidebarOpen(false);
    }
  }, [currentQuery, isMobileDevice, setIsAppSidebarOpen]);

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

  const isValidSession = !!userSession?.data?.session;

  const {
    data: userSavedActivities,
    isFetching: isUserSavedActivitiesFetching,
    isError: isUserSavedActivitiesError,
  } = useQuery({
    queryKey: ["user_saved_activities"],
    queryFn: async () => {
      const response = await fetch("/api/topical/saved-activities", {
        method: "GET",
      });
      const data: SavedActivitiesResponse = await response.json();
      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data && "error" in data
            ? String(data.error)
            : "An error occurred";
        throw new Error(errorMessage);
      }

      return data;
    },
    enabled:
      isSearchEnabled &&
      isValidSession &&
      !isUserSessionError &&
      !queryClient.getQueryData(["user_saved_activities"]),
  });

  const userFinishedQuestions = useMemo(() => {
    return userSavedActivities?.finishedQuestions;
  }, [userSavedActivities]);
  const bookmarks = useMemo(() => {
    return userSavedActivities?.bookmarks;
  }, [userSavedActivities]);

  const mainContentScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [isQuestionInspectOpen, setIsQuestionInspectOpen] =
    useState<QuestionInspectOpenState>({
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
      setIsAppSidebarOpen(false);
    }
  }, [isMobileDevice, isQuestionInspectOpen.isOpen, setIsAppSidebarOpen]);

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
      <div className="pt-12 h-screen !overflow-hidden">
        <UtilityOverflowProvider
          sideBarInsetRef={sideBarInsetRef}
          ultilityRef={ultilityRef}
        >
          <SidebarProvider
            onOpenChange={setIsAppSidebarOpen}
            onOpenChangeMobile={setIsAppSidebarOpen}
            open={isAppSidebarOpen}
            openMobile={isAppSidebarOpen}
          >
            <AppSidebar
              currentQuery={currentQuery}
              setCurrentQuery={setCurrentQuery}
              setIsSearchEnabled={setIsSearchEnabled}
              setSortParameters={setSortParameters}
              isTopicalDataFetching={isTopicalDataFetching}
              isQuestionViewDisabled={isQuestionViewDisabled}
              filterUrl={filterUrl}
              mountedRef={mountedRef}
              searchParams={searchParams}
              setIsValidSearchParams={setIsValidSearchParams}
              isUserSessionPending={isUserSessionPending}
              isValidSession={isValidSession}
              isAddRecentQueryPending={isAddRecentQueryPending}
            />
            <SidebarInset
              className="!relative flex flex-col items-center justify-start !px-0 gap-4 p-4 pl-2 md:items-start w-full overflow-hidden"
              ref={sideBarInsetRef}
            >
              <ScrollToTopButton
                isScrollingAndShouldShowScrollButton={
                  isScrollingAndShouldShowScrollButton
                }
                scrollAreaRef={mainContentScrollAreaRef}
              />

              <AppUltilityBar
                fullPartitionedData={fullPartitionedData}
                ultilityRef={ultilityRef}
                isQuestionViewDisabled={isQuestionViewDisabled}
                setIsQuestionInspectOpen={setIsQuestionInspectOpen}
                scrollAreaRef={mainContentScrollAreaRef}
                currentChunkIndex={currentChunkIndex}
                setCurrentChunkIndex={setCurrentChunkIndex}
                setDisplayedData={setDisplayedData}
                sortParameters={sortParameters}
                setSortParameters={setSortParameters}
                showFinishedQuestion={showFinishedQuestion}
                setShowFinishedQuestion={setShowFinishedQuestion}
                filterUrl={filterUrl}
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
                          <span className="md:hidden inline">top</span> to
                          search for questions
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
                              <span>
                                to toggle between questions and answers
                              </span>
                            </li>
                          </ul>
                        </div>

                        <div className="w-full md:w-[377px] !max-w-full h-[inherit] p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg shadow-sm ">
                          <h3 className="text-lg font-semibold text-center mb-2 text-gray-700 dark:text-gray-300">
                            Customize Your Experience
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-center">
                            Scroll down to the bottom of the sidebar to adjust
                            content layout, cache behaviour, and visual settings
                            to your preference.
                          </p>
                        </div>

                        <div className="w-full md:w-[377px]  !max-w-full h-[inherit] p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm">
                          <h3 className="text-lg font-semibold text-center mb-2 text-blue-700 dark:text-blue-400">
                            Track Your Progress
                          </h3>
                          <div className="flex flex-col gap-2 items-center justify-center">
                            <p className="text-blue-600 dark:text-blue-400 text-center">
                              Bookmark questions to create your personal list,
                              share with friends, and mark completed questions
                              to track your revision progress. Use the mini
                              sidebar below to access it.
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
                      website, or use the filter at the top left to choose
                      another subject
                    </p>
                  )}
                {isTopicalDataError &&
                  !isTopicalDataFetching &&
                  isTopicalDataFetched && (
                    <div className="flex flex-col items-center justify-center w-full h-full mb-3">
                      <div className="flex items-start justify-center gap-2">
                        <p className="text-md text-center mb-2 text-red-600">
                          An error occurred while fetching data. Please try
                          again.
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
                      uiPreferences.numberOfColumns as keyof typeof COLUMN_BREAKPOINTS
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
                            onQuestionClick={() =>
                              handleQuestionClick(question.id)
                            }
                            isUserSessionPending={isUserSessionPending}
                            userFinishedQuestions={userFinishedQuestions ?? []}
                            isSavedActivitiesError={isUserSavedActivitiesError}
                            isValidSession={isValidSession}
                            key={`${question.id}-${imageSrc}`}
                            isSavedActivitiesFetching={
                              isUserSavedActivitiesFetching
                            }
                            imageSrc={imageSrc}
                          />
                        ))
                      )}
                  </Masonry>
                </ResponsiveMasonry>

                {uiPreferences.layoutStyle === "infinite" && (
                  <InfiniteScroll
                    next={handleInfiniteScrollNext}
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
        </UtilityOverflowProvider>
      </div>
      <QuestionInspect
        isOpen={isQuestionInspectOpen}
        setIsOpen={setIsQuestionInspectOpen}
        partitionedTopicalData={fullPartitionedData}
        bookmarks={bookmarks ?? []}
        currentQuery={currentQuery}
        isValidSession={isValidSession}
        isSavedActivitiesFetching={isUserSavedActivitiesFetching}
        isUserSessionPending={isUserSessionPending}
        BETTER_AUTH_URL={BETTER_AUTH_URL}
        setSortParameters={setSortParameters}
        sortParameters={sortParameters}
        isSavedActivitiesError={isUserSavedActivitiesError}
        isInspectSidebarOpen={isInspectSidebarOpen}
        setIsInspectSidebarOpen={setIsInspectSidebarOpen}
        userFinishedQuestions={userFinishedQuestions ?? []}
      />
    </>
  );
};

export default TopicalClient;
