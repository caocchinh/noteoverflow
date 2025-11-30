"use client";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { CACHE_EXPIRE_TIME } from "@/features/topical/constants/constants";
import type {
  CurrentQuery,
  AppUltilityBarRef,
  RecentQueryRef,
} from "@/features/topical/constants/types";
import { SelectedQuestion } from "@/features/topical/constants/types";
import { updateSearchParams } from "@/features/topical/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCache, setCache } from "@/lib/client-cache";
import { INITIAL_QUERY } from "@/constants/constants";
import AppSidebar from "@/features/topical/components/AppSidebar";
import AppMainContent from "@/features/topical/components/AppMainContent";
import { api } from "@/lib/eden";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const isMobileDevice = useIsMobile();
  const mountedRef = useRef(false);
  const { isAppSidebarOpen, setIsAppSidebarOpen, uiPreferences } =
    useTopicalApp();
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery>({
    ...INITIAL_QUERY,
  });
  const [isValidSearchParams, setIsValidSearchParams] = useState(true);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const [isExportModeEnabled, setIsExportModeEnabled] = useState(false);
  const recentQueryRef = useRef<RecentQueryRef | null>(null);
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
    const { data, error } = await api.topical.get({
      query: {
        curriculumId: encodeURIComponent(currentQuery.curriculumId),
        subjectId: encodeURIComponent(currentQuery.subjectId),
        topic: encodeURIComponent(JSON.stringify(currentQuery.topic)),
        paperType: encodeURIComponent(JSON.stringify(currentQuery.paperType)),
        year: encodeURIComponent(JSON.stringify(currentQuery.year)),
        season: encodeURIComponent(JSON.stringify(currentQuery.season)),
      },
    });

    if (error) {
      // @ts-expect-error Wait for the library to fix the type inference
      throw new Error(error.value.error);
    }

    return data;
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
      recentQueryRef.current?.mutateRecentQuery(currentQuery);

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

  useEffect(() => {
    if (isMobileDevice) {
      setIsAppSidebarOpen(false);
    }
  }, [currentQuery, isMobileDevice, setIsAppSidebarOpen]);

  const appUltilityBarRef = useRef<AppUltilityBarRef | null>(null);

  return (
    <>
      <div className="pt-12 h-screen overflow-hidden!">
        <SidebarProvider
          onOpenChange={setIsAppSidebarOpen}
          onOpenChangeMobile={setIsAppSidebarOpen}
          open={isAppSidebarOpen && !isExportModeEnabled}
          openMobile={isAppSidebarOpen && !isExportModeEnabled}
        >
          <AppSidebar
            currentQuery={currentQuery}
            setCurrentQuery={setCurrentQuery}
            isExportModeEnabled={isExportModeEnabled}
            setIsSearchEnabled={setIsSearchEnabled}
            isTopicalDataFetching={isTopicalDataFetching}
            filterUrl={filterUrl}
            mountedRef={mountedRef}
            searchParams={searchParams}
            setIsValidSearchParams={setIsValidSearchParams}
            recentQueryRef={recentQueryRef}
            appUltilityBarRef={appUltilityBarRef}
          />
          <AppMainContent
            isExportModeEnabled={isExportModeEnabled}
            setIsExportModeEnabled={setIsExportModeEnabled}
            currentQuery={currentQuery}
            topicalData={topicalData}
            isSearchEnabled={isSearchEnabled}
            appUltilityBarRef={appUltilityBarRef}
            isTopicalDataError={isTopicalDataError}
            isTopicalDataFetching={isTopicalDataFetching}
            isTopicalDataFetched={isTopicalDataFetched}
            isValidSearchParams={isValidSearchParams}
            BETTER_AUTH_URL={BETTER_AUTH_URL}
            refetchTopicalData={refetchTopicalData}
            mountedRef={mountedRef}
            searchParams={searchParams}
            sideBarInsetRef={sideBarInsetRef}
            ultilityRef={ultilityRef}
            filterUrl={filterUrl}
          />
        </SidebarProvider>
      </div>
    </>
  );
};

export default TopicalClient;
