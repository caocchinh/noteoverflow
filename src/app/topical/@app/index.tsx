"use client";
import { memo, useCallback, useMemo } from "react";
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
import AppMainContent from "@/features/topical/components/AppMainContent";
import AppSidebar from "@/features/topical/components/AppSidebar";
import { api } from "@/lib/eden";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Github } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const isMobileDevice = useIsMobile();
  const { isAppSidebarOpen, setIsAppSidebarOpen, uiPreferences } =
    useTopicalApp();
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<CurrentQuery>({
    ...INITIAL_QUERY,
  });
  const [isValidSearchParams, setIsValidSearchParams] = useState(true);
  const [isExportModeEnabled, setIsExportModeEnabled] = useState(false);
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const ultilityRef = useRef<HTMLDivElement | null>(null);
  const recentQueryRef = useRef<RecentQueryRef | null>(null);
  const appUltilityBarRef = useRef<AppUltilityBarRef | null>(null);
  const mountedRef = useRef(false);

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

  const search = useCallback(async () => {
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
  }, [currentQuery]);

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
      <SupportDialog />
    </>
  );
};

export default TopicalClient;

const SupportDialog = memo(() => {
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    const hasSeenSupportDialog = localStorage.getItem("hasSeenSupportDialog");
    if (!hasSeenSupportDialog) {
      const timer = setTimeout(() => {
        setIsSupportDialogOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const handleCloseSupportDialog = (open: boolean) => {
    if (!open) {
      setIsSupportDialogOpen(false);
      localStorage.setItem("hasSeenSupportDialog", "true");
    }
  };

  return (
    <Dialog open={isSupportDialogOpen} onOpenChange={handleCloseSupportDialog}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">
            Support <span className="text-logo-main!">NoteOverflow</span>
          </DialogTitle>
          <DialogDescription>
            This project is completely free and open source. If you find it
            useful, please consider starring it on GitHub to support the founder
            to help him releases more features and add more curriculums. I love
            you ❤️🫦🥰🤗
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center">
          <Button asChild className="w-full gap-2">
            <Link
              href="https://github.com/caocchinh/noteoverflow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </Link>
          </Button>
        </div>
        <DialogFooter className="w-full -mt-2">
          <Button
            variant="outline"
            onClick={() => handleCloseSupportDialog(false)}
            className="w-full"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

SupportDialog.displayName = "SupportDialog";
