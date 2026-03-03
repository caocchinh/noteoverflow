import { PAPER_TYPE_FILTER_SEARCH_PAGE_KEY } from "@/constants/constants";
import { CIE_A_LEVEL_SUBDIVISION } from "@/constants/types";
import { PaperTypeFilterSearchPageCache } from "@/features/search/constants/type";
import { useEffect, useState } from "react";
import { validateSubcurriculumnDivision } from "../../topical/lib/utils";

export interface UsePaperTypePersistenceProps {
  selectedCurriculum: string;
  selectedSubject: string;
}

const getSavedPaperTypeFilter = (
  curriculum: string,
  subject: string,
): CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined => {
  if (!curriculum || !subject) return undefined;

  try {
    const savedCache = localStorage.getItem(PAPER_TYPE_FILTER_SEARCH_PAGE_KEY);
    if (!savedCache) return undefined;

    const parsedCache: PaperTypeFilterSearchPageCache = JSON.parse(savedCache);
    const savedFilter = parsedCache[curriculum]?.[subject];

    if (
      savedFilter &&
      validateSubcurriculumnDivision({
        value: savedFilter,
        type: "paperType",
        curriculum,
        subject,
      })
    ) {
      return savedFilter;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export const usePaperTypePersistence = ({
  selectedCurriculum,
  selectedSubject,
}: UsePaperTypePersistenceProps) => {
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(() => getSavedPaperTypeFilter(selectedCurriculum, selectedSubject));

  // Sync state when curriculum or subject changes
  useEffect(() => {
    setCurrentPaperTypeFilter(getSavedPaperTypeFilter(selectedCurriculum, selectedSubject));
  }, [selectedCurriculum, selectedSubject]);

  // Save paper type filter preference to localStorage when it changes
  useEffect(() => {
    if (!selectedCurriculum || !selectedSubject || !currentPaperTypeFilter) {
      return;
    }

    try {
      const existingCache = localStorage.getItem(PAPER_TYPE_FILTER_SEARCH_PAGE_KEY);
      const parsedCache: PaperTypeFilterSearchPageCache = existingCache
        ? JSON.parse(existingCache)
        : {};

      if (!parsedCache[selectedCurriculum]) {
        parsedCache[selectedCurriculum] = {};
      }

      parsedCache[selectedCurriculum][selectedSubject] = currentPaperTypeFilter;

      localStorage.setItem(PAPER_TYPE_FILTER_SEARCH_PAGE_KEY, JSON.stringify(parsedCache));
    } catch (error) {
      console.error("Failed to save paper type filter to localStorage:", error);
    }
  }, [selectedCurriculum, selectedSubject, currentPaperTypeFilter]);

  return { currentPaperTypeFilter, setCurrentPaperTypeFilter };
};
