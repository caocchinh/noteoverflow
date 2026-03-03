import { ValidCurriculum } from "@/constants/types";
import {
  syncFilterCacheToLocalStorage,
  validateCurriculum,
  validateFilterData,
  validateSubcurriculumnDivision,
  validateSubject,
} from "@/features/topical/lib/utils";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { FILTERS_CACHE_KEY, UI_PREFERENCES_CACHE_KEY } from "../constants/constants";
import { CurrentQuery } from "../types/models";
import { FiltersCache, UiPreferencesCache } from "../types/preferences";
import { FilterStateHandlers, FilterStateSetters, FilterStateValues } from "./useFilterState";

export interface UseFilterPersistenceProps {
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  setIsSearchEnabled: (enabled: boolean) => void;
  searchParams: { [key: string]: string | string[] | undefined };
  setIsValidSearchParams: (isValid: boolean) => void;
  mountedRef: React.MutableRefObject<boolean>;
  filterState: Omit<FilterStateValues, "invalidInputs" | "setInvalidInputs">;
  setters: FilterStateSetters;
  handlers: Omit<FilterStateHandlers, "resetEverything" | "revert">;
}

export const useFilterPersistence = ({
  setCurrentQuery,
  setIsSearchEnabled,
  searchParams,
  setIsValidSearchParams,
  mountedRef,
  filterState: {
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedYear,
    selectedPaperType,
    selectedSeason,
    currentTopicFilter,
    currentPaperTypeFilter,
  },
  setters: { setCurrentTopicFilter, setCurrentPaperTypeFilter },
  handlers: {
    handleCurriculumChange,
    handleSubjectChange,
    handleTopicChange,
    handleYearChange,
    handlePaperTypeChange,
    handleSeasonChange,
  },
}: UseFilterPersistenceProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (mountedRef.current) {
      return;
    }
    let parsedQueryFromSearchParams;
    if (searchParams.queryKey) {
      try {
        parsedQueryFromSearchParams = JSON.parse(searchParams.queryKey as string);
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
    const parsedState: FiltersCache = savedState ? JSON.parse(savedState) : false;
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
        handleCurriculumChange(parsedState.lastSessionCurriculum as ValidCurriculum);

        curriculumn = parsedState.lastSessionCurriculum;
        const isSubjectValid = validateSubject(
          parsedState.lastSessionCurriculum,
          parsedState.lastSessionSubject,
        );
        if (parsedState.lastSessionSubject && isSubjectValid) {
          handleSubjectChange(parsedState.lastSessionSubject);
          subject = parsedState.lastSessionSubject;
        }
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
          handleSubjectChange(parsedState.lastSessionSubject);
          handleTopicChange(
            parsedState.filters[parsedState.lastSessionCurriculum][parsedState.lastSessionSubject]
              .topic,
          );
          handlePaperTypeChange(
            parsedState.filters[parsedState.lastSessionCurriculum][parsedState.lastSessionSubject]
              .paperType,
          );
          handleYearChange(
            parsedState.filters[parsedState.lastSessionCurriculum][parsedState.lastSessionSubject]
              .year,
          );
          handleSeasonChange(
            parsedState.filters[parsedState.lastSessionCurriculum][parsedState.lastSessionSubject]
              .season,
          );
        }
      }
    } else if (parsedQueryFromSearchParams) {
      curriculumn = parsedQueryFromSearchParams.curriculumId;
      subject = parsedQueryFromSearchParams.subjectId;
      handleCurriculumChange(parsedQueryFromSearchParams.curriculumId);
      handleSubjectChange(parsedQueryFromSearchParams.subjectId);
      handlePaperTypeChange(parsedQueryFromSearchParams.paperType);
      handleTopicChange(parsedQueryFromSearchParams.topic);
      handleYearChange(parsedQueryFromSearchParams.year);
      handleSeasonChange(parsedQueryFromSearchParams.season);
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
          parsedState.filters[curriculumn][subject].paperTypeSubcurriculumnDivisionPreference;
        const savedTopicSubcurriculumnDivision =
          parsedState.filters[curriculumn][subject].topicSubcurriculumnDivisionPreference;
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
    handleCurriculumChange,
    handlePaperTypeChange,
    handleSeasonChange,
    handleSubjectChange,
    handleTopicChange,
    handleYearChange,
    mountedRef,
    searchParams,
    setCurrentPaperTypeFilter,
    setCurrentQuery,
    setCurrentTopicFilter,
    setIsSearchEnabled,
    setIsValidSearchParams,
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
  };
};
