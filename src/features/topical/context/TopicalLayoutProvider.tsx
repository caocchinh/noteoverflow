"use client";
import { usePathname } from "next/navigation";
import {
  createContext,
  useContext,
  useState,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from "react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { TOPICAL_QUESTION_APP_ROUTE } from "@/constants/constants";
import {
  DEFAULT_UI_PREFERENCES_CACHE,
  UI_PREFERENCES_CACHE_KEY,
} from "@/features/topical/constants/constants";
import DockWrapper from "@/features/topical/components/DockWrapper";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  UiPreferences,
  UiPreferencesCache,
  SavedActivitiesResponse,
} from "@/features/topical/constants/types";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";

type UiPreferencesKey = keyof UiPreferences;

const getInitialUiPreferences = (): UiPreferences => {
  if (typeof window === "undefined") {
    return { ...DEFAULT_UI_PREFERENCES_CACHE };
  }

  const savedState = localStorage.getItem(UI_PREFERENCES_CACHE_KEY);
  if (savedState) {
    const parsedState: UiPreferencesCache = JSON.parse(savedState);
    return {
      numberOfColumns:
        parsedState.numberOfColumns ??
        DEFAULT_UI_PREFERENCES_CACHE.numberOfColumns,
      layoutStyle:
        parsedState.layoutStyle ?? DEFAULT_UI_PREFERENCES_CACHE.layoutStyle,
      numberOfQuestionsPerPage:
        parsedState.numberOfQuestionsPerPage ??
        DEFAULT_UI_PREFERENCES_CACHE.numberOfQuestionsPerPage,
      imageTheme:
        parsedState.imageTheme ?? DEFAULT_UI_PREFERENCES_CACHE.imageTheme,
      isStrictModeEnabled:
        parsedState.isStrictModeEnabled ??
        DEFAULT_UI_PREFERENCES_CACHE.isStrictModeEnabled,
      isQuestionCacheEnabled:
        parsedState.isQuestionCacheEnabled ??
        DEFAULT_UI_PREFERENCES_CACHE.isQuestionCacheEnabled,
      showFinishedQuestionTint:
        parsedState.showFinishedQuestionTint ??
        DEFAULT_UI_PREFERENCES_CACHE.showFinishedQuestionTint,
      showScrollToTopButton:
        parsedState.showScrollToTopButton ??
        DEFAULT_UI_PREFERENCES_CACHE.showScrollToTopButton,
      scrollUpWhenPageChange:
        parsedState.scrollUpWhenPageChange ??
        DEFAULT_UI_PREFERENCES_CACHE.scrollUpWhenPageChange,
      isSessionCacheEnabled:
        parsedState.isSessionCacheEnabled ??
        DEFAULT_UI_PREFERENCES_CACHE.isSessionCacheEnabled,
      isPersistantCacheEnabled:
        parsedState.isPersistantCacheEnabled ??
        DEFAULT_UI_PREFERENCES_CACHE.isPersistantCacheEnabled,
      recentlySearchSortedBy:
        parsedState.recentlySearchSortedBy ??
        DEFAULT_UI_PREFERENCES_CACHE.recentlySearchSortedBy,
    };
  } else {
    localStorage.setItem(
      UI_PREFERENCES_CACHE_KEY,
      JSON.stringify(DEFAULT_UI_PREFERENCES_CACHE)
    );
  }

  return {
    ...DEFAULT_UI_PREFERENCES_CACHE,
  };
};

const DesmosCalculator = dynamic(
  () => import("@/features/topical/components/DesmosCalculator"),
  {
    ssr: false,
  }
);

const TopicalContext = createContext<{
  // Original state
  isAppSidebarOpen: boolean;
  setIsAppSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: Dispatch<SetStateAction<boolean>>;
  // UI Preferences
  uiPreferences: UiPreferences;
  setUiPreference: <K extends keyof UiPreferences>(
    key: K,
    value: SetStateAction<UiPreferences[K]>
  ) => void;
  // Optimized user saved activities - separated to prevent unnecessary re-renders
  bookmarksData: SavedActivitiesResponse["bookmarks"] | undefined;
  finishedQuestionsData:
    | SavedActivitiesResponse["finishedQuestions"]
    | undefined;
  annotationsData: SavedActivitiesResponse["annotations"] | undefined;
  savedActivitiesError: Error | null;
  savedActivitiesIsLoading: boolean;
  savedActivitiesIsFetching: boolean;
  savedActivitiesIsError: boolean;
} | null>(null);

export const useTopicalApp = () => {
  const context = useContext(TopicalContext);
  if (!context) {
    throw new Error("useTopicalApp must be used within TopicalLayoutProvider");
  }
  return context;
};

export default function TopicalLayoutProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAppSidebarOpen, setIsAppSidebarOpen] = useState(true);
  const isMobileDevice = useIsMobile();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const isMounted = useRef(false);
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // UI Preferences state
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(
    DEFAULT_UI_PREFERENCES_CACHE
  );

  useEffect(() => {
    if (isMounted.current) return;
    setUiPreferences(getInitialUiPreferences());
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, []);

  // Save to localStorage whenever UI preferences change before mount
  useEffect(() => {
    if (typeof window === "undefined" || !isMounted.current) return;

    try {
      const uiPreferencesCache: UiPreferencesCache = {
        numberOfColumns: uiPreferences.numberOfColumns,
        layoutStyle: uiPreferences.layoutStyle,
        numberOfQuestionsPerPage: uiPreferences.numberOfQuestionsPerPage,
        imageTheme: uiPreferences.imageTheme,
        isStrictModeEnabled: uiPreferences.isStrictModeEnabled,
        isQuestionCacheEnabled: uiPreferences.isQuestionCacheEnabled,
        showFinishedQuestionTint: uiPreferences.showFinishedQuestionTint,
        showScrollToTopButton: uiPreferences.showScrollToTopButton,
        scrollUpWhenPageChange: uiPreferences.scrollUpWhenPageChange,
        isSessionCacheEnabled: uiPreferences.isSessionCacheEnabled,
        isPersistantCacheEnabled: uiPreferences.isPersistantCacheEnabled,
        recentlySearchSortedBy: uiPreferences.recentlySearchSortedBy,
      };

      localStorage.setItem(
        UI_PREFERENCES_CACHE_KEY,
        JSON.stringify(uiPreferencesCache)
      );
    } catch (error) {
      console.error("Failed to save UI preferences to localStorage:", error);
    }
  }, [uiPreferences]);

  // Generic setter for any UI preference
  const setUiPreference = useCallback(
    <K extends UiPreferencesKey>(
      key: K,
      value: SetStateAction<UiPreferences[K]>
    ) => {
      setUiPreferences((prev) => {
        const newValue = typeof value === "function" ? value(prev[key]) : value;
        return { ...prev, [key]: newValue };
      });
    },
    []
  );

  // User saved activities query - optimized to prevent unnecessary re-renders
  const userSavedActivitiesQuery = useQuery({
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
    enabled: isAuthenticated,
  });

  // Memoize individual query states to prevent context re-renders
  const bookmarksData = useMemo(
    () => userSavedActivitiesQuery.data?.bookmarks,
    [userSavedActivitiesQuery.data?.bookmarks]
  );

  const finishedQuestionsData = useMemo(
    () => userSavedActivitiesQuery.data?.finishedQuestions,
    [userSavedActivitiesQuery.data?.finishedQuestions]
  );

  const annotationsData = useMemo(
    () => userSavedActivitiesQuery.data?.annotations,
    [userSavedActivitiesQuery.data?.annotations]
  );

  const savedActivitiesError = useMemo(
    () => userSavedActivitiesQuery.error,
    [userSavedActivitiesQuery.error]
  );

  const savedActivitiesIsLoading = useMemo(
    () => userSavedActivitiesQuery.isLoading,
    [userSavedActivitiesQuery.isLoading]
  );

  const savedActivitiesIsFetching = useMemo(
    () => userSavedActivitiesQuery.isFetching,
    [userSavedActivitiesQuery.isFetching]
  );

  const savedActivitiesIsError = useMemo(
    () => userSavedActivitiesQuery.isError,
    [userSavedActivitiesQuery.isError]
  );

  return (
    <TopicalContext.Provider
      value={{
        isAppSidebarOpen,
        setIsAppSidebarOpen,
        isCalculatorOpen,
        setIsCalculatorOpen,
        uiPreferences,
        setUiPreference,
        bookmarksData,
        annotationsData,
        finishedQuestionsData,
        savedActivitiesError,
        savedActivitiesIsLoading,
        savedActivitiesIsFetching,
        savedActivitiesIsError,
      }}
    >
      <DesmosCalculator isOpen={isCalculatorOpen} />
      <div>
        <div className="absolute left-0 w-full">
          <SidebarProvider
            onOpenChange={setIsAppSidebarOpen}
            open={isAppSidebarOpen && pathname === TOPICAL_QUESTION_APP_ROUTE}
          >
            {!isMobileDevice && (
              <Sidebar className="!bg-background !border-none !z-[-1]" />
            )}
            <SidebarInset className="relative w-full">
              <div className="absolute left-0 z-[1000] flex w-full items-start justify-center">
                <div className="fixed bottom-1">
                  <DockWrapper />
                </div>
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>

        {children}
      </div>
    </TopicalContext.Provider>
  );
}
