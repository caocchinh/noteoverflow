import { useState, useEffect, RefObject } from "react";
import { usePathname } from "next/navigation";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { updateSearchParams } from "@/features/topical/lib/utils";
import { CurrentQuery, SelectedQuestion } from "../types/models";

interface UseQuestionInspectProps {
  mountedRef: RefObject<boolean>;
  currentQuery: CurrentQuery;
  topicalData: { data: SelectedQuestion[] } | undefined;
  searchParams: { [key: string]: string | string[] | undefined };
}

export const useQuestionInspect = ({
  mountedRef,
  currentQuery,
  topicalData,
  searchParams,
}: UseQuestionInspectProps) => {
  const pathname = usePathname();
  const { uiPreferences } = useTopicalApp();
  const [isInspectOpen, setIsInspectOpen] = useState<{
    isOpen: boolean;
    questionId: string;
  }>({
    isOpen: false,
    questionId: "",
  });

  const [openInspectOnMount, setOpenInspectOnMount] = useState(false);

  // Sync URL params to remove questionId when query changes
  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (currentQuery.curriculumId && currentQuery.subjectId) {
      if (!isInspectOpen.isOpen) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: "",
          isInspectOpen: false,
        });
      }
    }
  }, [
    currentQuery,
    mountedRef,
    uiPreferences.isStrictModeEnabled,
    isInspectOpen.isOpen,
  ]);

  // Close inspect when topical data changes (e.g. new search)
  useEffect(() => {
    if (topicalData) {
      setIsInspectOpen({
        isOpen: false,
        questionId: "",
      });
    }
  }, [topicalData, uiPreferences.isStrictModeEnabled]);

  // Handle URL param-based opening of inspect modal on mount
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
              (item) => item.id === existingQuestionid,
            ) !== -1
          ) {
            setIsInspectOpen({
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
    mountedRef,
  ]);

  // Sync inspect state to URL when leaving/changing routes
  useEffect(() => {
    if (typeof window === "undefined" || !mountedRef.current) {
      return;
    }
    if (pathname === "/topical") {
      if (currentQuery.curriculumId && currentQuery.subjectId) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: isInspectOpen.questionId ? isInspectOpen.questionId : "",
          isInspectOpen: isInspectOpen.isOpen,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isInspectOpen]); // Added isInspectOpen dependency to sync when state changes

  return {
    isInspectOpen,
    setIsInspectOpen,
    openInspectOnMount,
  };
};
