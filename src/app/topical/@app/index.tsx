"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { INITIAL_QUERY } from "@/constants/constants";
import { useAuth } from "@/context/AuthContext";
import AppMainContent from "@/features/topical/components/AppMainContent";
import AppSidebar from "@/features/topical/components/AppSidebar/AppSidebar";
import { CACHE_EXPIRE_TIME } from "@/features/topical/constants/constants";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { AppUltilityBarRef, RecentQueryRef } from "@/features/topical/types/components";
import { CurrentQuery, SelectedQuestion } from "@/features/topical/types/models";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCache, setCache } from "@/lib/client-cache";
import { api } from "@/lib/eden";
import { useQuery } from "@tanstack/react-query";
import { Github } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

const TopicalClient = ({
  searchParams,
  BETTER_AUTH_URL,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
  BETTER_AUTH_URL: string;
}) => {
  const isMobileDevice = useIsMobile();
  const { isAppSidebarOpen, setIsAppSidebarOpen } = useTopicalApp();
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
        if (parsedCachedData && currentTime > parsedCachedData.cacheExpireTime) {
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
      <div className="h-screen overflow-hidden! pt-12">
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
      <CopyrightAnnouncementDialog />
    </>
  );
};

export default TopicalClient;

const CopyrightAnnouncementDialog = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const onShowCopyrightAnnouncement = useEffectEvent(() => {
    setIsOpen(true);
  });

  useEffect(() => {
    const hasSeenCopyrightAnnouncement = localStorage.getItem("hasSeenCopyrightAnnouncement");
    if (!hasSeenCopyrightAnnouncement) {
      // Show immediately when user first visits
      onShowCopyrightAnnouncement();
    }
  }, []);

  const handleClose = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      localStorage.setItem("hasSeenCopyrightAnnouncement", "true");
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="sm:max-w-[450px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center justify-center gap-2 text-center">
            ⚠️ Important Announcement
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 pt-2 text-left">
              <p>
                The <strong>download</strong> and <strong>export</strong> features have been{" "}
                <strong>permanently disabled</strong> due to copyright considerations.
              </p>
              <p className="text-muted-foreground text-sm">
                Cambridge Assessment International Education holds the copyright for all examination
                materials. Reproducing and distributing these materials without explicit permission
                may constitute copyright infringement.
              </p>
              <p className="text-muted-foreground text-sm">
                You can still browse, annotate, and bookmark questions. Your annotations are saved
                to your account.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="w-full flex-col gap-2 sm:flex-col">
          <AlertDialogAction onClick={() => handleClose(false)} className="w-full">
            I Understand
          </AlertDialogAction>
          <Link
            href="/disclaimer"
            className="text-muted-foreground hover:text-foreground text-center text-sm underline"
            onClick={() => handleClose(false)}
          >
            Read full disclaimer
          </Link>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

CopyrightAnnouncementDialog.displayName = "CopyrightAnnouncementDialog";

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
            This project is completely free and open source. If you find it useful, please consider
            starring it on GitHub to support the founder to help him releases more features and add
            more curriculums. I love you ❤️🫦🥰🤗
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
        <DialogFooter className="-mt-2 w-full">
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
