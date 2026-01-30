import {
  useState,
  useCallback,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import {
  FILTERS_CACHE_KEY,
  DEFAULT_CACHE,
  UI_PREFERENCES_CACHE_KEY,
} from "../constants/constants";
import {
  validateCurriculum,
  validateSubject,
  validateFilterData,
  syncFilterCacheToLocalStorage,
  validateSubcurriculumnDivision,
} from "@/features/topical/lib/utils";
import { ValidCurriculum } from "@/constants/types";
import { FiltersCache, UiPreferencesCache } from "../types/preferences";
import { CurrentQuery } from "../types/models";
import { FilterStateValues, FilterStateSetters } from "./useFilterState";

export interface UseFilterPersistenceProps {
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  setIsSearchEnabled: (enabled: boolean) => void;
  searchParams: { [key: string]: string | string[] | undefined };
  setIsValidSearchParams: (isValid: boolean) => void;
  mountedRef: React.MutableRefObject<boolean>;
  isMobileDevice: boolean;
  values: FilterStateValues;
  setters: FilterStateSetters;
  resetAllFilters: () => void;
}

export const useFilterPersistence = ({
  currentQuery,
  setCurrentQuery,
  setIsSearchEnabled,
  searchParams,
  setIsValidSearchParams,
  mountedRef,
  isMobileDevice,
  values: {
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedYear,
    selectedPaperType,
    selectedSeason,
    currentTopicFilter,
    currentPaperTypeFilter,
  },
  setters: {
    setSelectedCurriculum,
    setSelectedSubject,
    setSelectedTopic,
    setSelectedYear,
    setSelectedPaperType,
    setSelectedSeason,
    setCurrentTopicFilter,
    setCurrentPaperTypeFilter,
  },
  resetAllFilters,
}: UseFilterPersistenceProps) => {
  const [isMounted, setIsMounted] = useState(false);

  const [sidebarKey, setSidebarKey] = useState(0);

  const revert = useCallback(() => {
    if (!currentQuery.curriculumId || !currentQuery.subjectId) {
      return;
    }
    setSelectedCurriculum(currentQuery.curriculumId as ValidCurriculum);
    setSelectedSubject(currentQuery.subjectId);
    setSelectedTopic(currentQuery.topic);
    setSelectedYear(currentQuery.year);
    setSelectedPaperType(currentQuery.paperType);
    setSelectedSeason(currentQuery.season);
  }, [
    currentQuery.curriculumId,
    currentQuery.paperType,
    currentQuery.season,
    currentQuery.subjectId,
    currentQuery.topic,
    currentQuery.year,
    setSelectedCurriculum,
    setSelectedPaperType,
    setSelectedSeason,
    setSelectedSubject,
    setSelectedTopic,
    setSelectedYear,
  ]);

  const resetEverything = useCallback(() => {
    try {
      const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
      const stateToSave: FiltersCache = existingStateJSON
        ? JSON.parse(existingStateJSON)
        : { ...DEFAULT_CACHE };

      stateToSave.lastSessionCurriculum = "";
      stateToSave.lastSessionSubject = "";
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
              paperTypeSubcurriculumnDivisionPreference: undefined,
              topicSubcurriculumnDivisionPreference: undefined,
            },
          },
        };
      }

      localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to access localStorage:", error);
    }

    resetAllFilters();
    if (!isMobileDevice) {
      setSidebarKey((prev) => prev + 1);
    }
  }, [resetAllFilters, isMobileDevice, selectedCurriculum, selectedSubject]);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    let parsedQueryFromSearchParams;
    if (searchParams.queryKey) {
      try {
        parsedQueryFromSearchParams = JSON.parse(
          searchParams.queryKey as string,
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
          parsedQueryFromSearchParams.subjectId,
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
      }
    }

    const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
    const savedUiPreferences = localStorage.getItem(UI_PREFERENCES_CACHE_KEY);
    const parsedState: FiltersCache = savedState
      ? JSON.parse(savedState)
      : false;
    const parsedUiPreferences: UiPreferencesCache = savedUiPreferences
      ? JSON.parse(savedUiPreferences)
      : false;

    let subject: string | undefined;
    let curriculumn: string | undefined;

    if (savedState && savedUiPreferences && !parsedQueryFromSearchParams) {
      if (
        parsedUiPreferences.isSessionCacheEnabled &&
        parsedState.lastSessionCurriculum &&
        validateCurriculum(parsedState.lastSessionCurriculum)
      ) {
        setSelectedCurriculum(
          parsedState.lastSessionCurriculum as ValidCurriculum,
        );

        curriculumn = parsedState.lastSessionCurriculum;
        const isSubjectValid = validateSubject(
          parsedState.lastSessionCurriculum,
          parsedState.lastSessionSubject,
        );
        if (parsedState.lastSessionSubject && isSubjectValid) {
          setSelectedSubject(parsedState.lastSessionSubject);
          subject = parsedState.lastSessionSubject;
        }
        console.log(
          "isSubjectValid",
          isSubjectValid,
          validateFilterData({
            curriculumn: parsedState.lastSessionCurriculum,
            data: parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ],
            subject: parsedState.lastSessionSubject,
          }),
          parsedState.filters[parsedState.lastSessionCurriculum][
            parsedState.lastSessionSubject
          ],
        );
        if (
          isSubjectValid &&
          validateFilterData({
            curriculumn: parsedState.lastSessionCurriculum,
            data: parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ],
            subject: parsedState.lastSessionSubject,
            enforceZeroLength: false,
          })
        ) {
          setSelectedSubject(parsedState.lastSessionSubject);
          setSelectedTopic(
            parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ].topic,
          );
          console.log(
            parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ].topic,
          );
          setSelectedPaperType(
            parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ].paperType,
          );
          setSelectedYear(
            parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ].year,
          );
          setSelectedSeason(
            parsedState.filters[parsedState.lastSessionCurriculum][
              parsedState.lastSessionSubject
            ].season,
          );
        }
      }
    } else if (parsedQueryFromSearchParams) {
      curriculumn = parsedQueryFromSearchParams.curriculumId;
      subject = parsedQueryFromSearchParams.subjectId;
      setSelectedCurriculum(
        parsedQueryFromSearchParams.curriculumId as ValidCurriculum,
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
    if (curriculumn && subject) {
      try {
        const savedPaperTypeSubcurriculumnDivision =
          parsedState.filters[curriculumn][subject]
            .paperTypeSubcurriculumnDivisionPreference;
        const savedTopicSubcurriculumnDivision =
          parsedState.filters[curriculumn][subject]
            .topicSubcurriculumnDivisionPreference;
        if (
          savedPaperTypeSubcurriculumnDivision &&
          validateSubcurriculumnDivision({
            value: savedPaperTypeSubcurriculumnDivision,
            type: "paperType",
            subject,
            curriculum: curriculumn,
          })
        ) {
          setCurrentPaperTypeFilter(savedPaperTypeSubcurriculumnDivision);
        } else {
          setCurrentPaperTypeFilter(undefined);
        }
        if (
          savedTopicSubcurriculumnDivision &&
          validateSubcurriculumnDivision({
            value: savedTopicSubcurriculumnDivision,
            type: "topic",
            subject,
            curriculum: curriculumn,
          })
        ) {
          setCurrentTopicFilter(savedTopicSubcurriculumnDivision);
        } else {
          setCurrentTopicFilter(undefined);
        }
      } catch {
        setCurrentTopicFilter(undefined);
        setCurrentPaperTypeFilter(undefined);
      }
    }

    setTimeout(() => {
      mountedRef.current = true;
      setIsMounted(true);
    }, 0);
  }, [
    mountedRef,
    searchParams,
    setCurrentPaperTypeFilter,
    setCurrentQuery,
    setCurrentTopicFilter,
    setIsSearchEnabled,
    setIsValidSearchParams,
    setSelectedCurriculum,
    setSelectedPaperType,
    setSelectedSeason,
    setSelectedSubject,
    setSelectedTopic,
    setSelectedYear,
  ]);

  useEffect(() => {
    if (!mountedRef.current) {
      return;
    }
    syncFilterCacheToLocalStorage({
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedPaperType,
      selectedYear,
      selectedSeason,
      paperTypeSubcurriculumnDivisionPreference: currentPaperTypeFilter,
      topicSubcurriculumnDivisionPreference: currentTopicFilter,
    });
  }, [
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedPaperType,
    selectedYear,
    selectedSeason,
    currentPaperTypeFilter,
    currentTopicFilter,
    mountedRef,
  ]);

  return {
    isMounted,
    sidebarKey,
    revert,
    resetEverything,
  };
};
