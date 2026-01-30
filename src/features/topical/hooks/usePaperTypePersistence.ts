import { useState, useEffect, useRef } from "react";
import { PAPER_TYPE_FILTER_SEARCH_PAGE_KEY } from "@/constants/constants";
import { validateSubcurriculumnDivision } from "../../topical/lib/utils";
import { PaperTypeFilterSearchPageCache } from "@/features/search/constants/type";
import { CIE_A_LEVEL_SUBDIVISION } from "@/constants/types";

export interface UsePaperTypePersistenceProps {
  selectedCurriculum: string;
  selectedSubject: string;
}

export const usePaperTypePersistence = ({
  selectedCurriculum,
  selectedSubject,
}: UsePaperTypePersistenceProps) => {
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(() => {
    if (!selectedCurriculum || !selectedSubject) {
      return undefined;
    }
    try {
      const savedCache = localStorage.getItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY,
      );
      if (savedCache) {
        const parsedCache: PaperTypeFilterSearchPageCache =
          JSON.parse(savedCache);
        const savedFilter = parsedCache[selectedCurriculum]?.[selectedSubject];

        if (
          savedFilter &&
          validateSubcurriculumnDivision({
            value: savedFilter,
            type: "paperType",
            curriculum: selectedCurriculum,
            subject: selectedSubject,
          })
        ) {
          return savedFilter;
        }
      }
    } catch {
      return undefined;
    }
    return undefined;
  });

  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save paper type filter preference to localStorage when it changes
  useEffect(() => {
    if (!isMountedRef.current || !selectedCurriculum || !selectedSubject) {
      return;
    }

    try {
      const existingCache = localStorage.getItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY,
      );
      const parsedCache: PaperTypeFilterSearchPageCache = existingCache
        ? JSON.parse(existingCache)
        : {};

      if (!parsedCache[selectedCurriculum]) {
        parsedCache[selectedCurriculum] = {};
      }

      parsedCache[selectedCurriculum][selectedSubject] = currentPaperTypeFilter;

      localStorage.setItem(
        PAPER_TYPE_FILTER_SEARCH_PAGE_KEY,
        JSON.stringify(parsedCache),
      );
    } catch (error) {
      console.error("Failed to save paper type filter to localStorage:", error);
    }
  }, [selectedCurriculum, selectedSubject, currentPaperTypeFilter]);

  return { currentPaperTypeFilter, setCurrentPaperTypeFilter };
};
