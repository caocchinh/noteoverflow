import { useState, useCallback, useRef, SetStateAction } from "react";
import { CIE_A_LEVEL_SUBDIVISION, ValidCurriculum } from "@/constants/types";
import { CurrentQuery, InvalidInputs } from "../types/models";
import {
  DEFAULT_CACHE,
  FILTERS_CACHE_KEY,
  INVALID_INPUTS_DEFAULT,
  UI_PREFERENCES_CACHE_KEY,
} from "../constants/constants";
import {
  validateSubject,
  validateSubcurriculumnDivision,
  validateFilterData,
} from "../lib/utils";
import { FiltersCache, UiPreferencesCache } from "../types/preferences";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FilterStateRefs {
  curriculumRef: React.RefObject<HTMLDivElement | null>;
  subjectRef: React.RefObject<HTMLDivElement | null>;
  topicRef: React.RefObject<HTMLDivElement | null>;
  yearRef: React.RefObject<HTMLDivElement | null>;
  paperTypeRef: React.RefObject<HTMLDivElement | null>;
  seasonRef: React.RefObject<HTMLDivElement | null>;
}

export interface FilterStateValues {
  selectedCurriculum: ValidCurriculum;
  selectedSubject: string;
  selectedTopic: string[];
  selectedYear: string[];
  selectedPaperType: string[];
  selectedSeason: string[];
  currentTopicFilter: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  currentPaperTypeFilter: CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined;
  invalidInputs: InvalidInputs;
  setInvalidInputs: React.Dispatch<SetStateAction<InvalidInputs>>;
}

export interface FilterStateSetters {
  setCurrentTopicFilter: React.Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined>
  >;
  setCurrentPaperTypeFilter: React.Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined>
  >;
}

export interface FilterStateHandlers {
  /** Handle curriculum change with cascading reset of dependent fields */
  handleCurriculumChange: (
    value: ValidCurriculum | ((prev: ValidCurriculum) => ValidCurriculum),
  ) => void;
  /** Handle subject change with cascading reset of dependent fields */
  handleSubjectChange: (value: string | ((prev: string) => string)) => void;
  /** Handle topic change */
  handleTopicChange: (
    values: string[] | ((prev: string[]) => string[]),
  ) => void;
  /** Handle year change */
  handleYearChange: (values: string[] | ((prev: string[]) => string[])) => void;
  /** Handle paper type change */
  handlePaperTypeChange: (
    values: string[] | ((prev: string[]) => string[]),
  ) => void;
  /** Handle season change */
  handleSeasonChange: (
    values: string[] | ((prev: string[]) => string[]),
  ) => void;
  /** Reset all filter selections */
  resetEverything: () => void;
  revert: () => void;
}

export interface UseFilterStateReturn {
  filterState: FilterStateValues;
  setters: FilterStateSetters;
  handlers: FilterStateHandlers;
  refs: FilterStateRefs;
  other: {
    sidebarKey: number;
  };
}

/**
 * A hook that manages filter state for topical question filtering.
 * This hook consolidates the common filter state management pattern
 * used across AppSidebar, OptionalFilters, and SecondaryAppSidebar.
 */
export function useFilterState({
  currentQuery,
}: {
  currentQuery: CurrentQuery;
}): UseFilterStateReturn {
  // State
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<ValidCurriculum>("CIE A-LEVEL");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string[]>([]);
  const [selectedPaperType, setSelectedPaperType] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string[]>([]);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const [currentTopicFilter, setCurrentTopicFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);
  const [sidebarKey, setSidebarKey] = useState(0);

  const isMobile = useIsMobile();

  // Refs for scrolling to invalid inputs
  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);

  // Handlers
  const handleCurriculumChange = useCallback(
    (value: ValidCurriculum | ((prev: ValidCurriculum) => ValidCurriculum)) => {
      const newValue =
        typeof value === "function" ? value(selectedCurriculum) : value;
      setSelectedCurriculum(newValue as ValidCurriculum);
      // Reset dependent fields
      setSelectedSubject("");
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
      setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
      setCurrentPaperTypeFilter(undefined);
      setCurrentTopicFilter(undefined);
    },
    [selectedCurriculum],
  );

  const handleSubjectChange = useCallback(
    (value: string | ((prev: string) => string)) => {
      const newValue =
        typeof value === "function" ? value(selectedSubject) : value;
      setSelectedSubject(newValue);
      const savedState = localStorage.getItem(FILTERS_CACHE_KEY);
      const savedUiPreferences = localStorage.getItem(UI_PREFERENCES_CACHE_KEY);
      if (savedState && savedUiPreferences) {
        try {
          const parsedState: FiltersCache = JSON.parse(savedState);
          const parsedUiPreferences: UiPreferencesCache =
            JSON.parse(savedUiPreferences);
          if (parsedUiPreferences.isPersistantCacheEnabled) {
            const isSubjectValid = validateSubject(
              selectedCurriculum,
              newValue,
            );
            if (newValue && isSubjectValid) {
              setSelectedSubject(newValue);
            }
            try {
              const savedPaperTypeSubcurriculumnDivision =
                parsedState.filters[selectedCurriculum][newValue]
                  .paperTypeSubcurriculumnDivisionPreference;
              const savedTopicSubcurriculumnDivision =
                parsedState.filters[selectedCurriculum][newValue]
                  .topicSubcurriculumnDivisionPreference;
              if (
                savedPaperTypeSubcurriculumnDivision &&
                validateSubcurriculumnDivision({
                  value: savedPaperTypeSubcurriculumnDivision,
                  type: "paperType",
                  curriculum: selectedCurriculum,
                  subject: newValue,
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
                  curriculum: selectedCurriculum,
                  subject: newValue,
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
            if (
              isSubjectValid &&
              validateFilterData({
                data: parsedState.filters[selectedCurriculum][newValue],
                curriculumn: selectedCurriculum,
                subject: newValue,
                enforceZeroLength: false,
              })
            ) {
              setSelectedTopic(
                parsedState.filters[selectedCurriculum][newValue].topic,
              );
              setSelectedPaperType(
                parsedState.filters[selectedCurriculum][newValue].paperType,
              );
              setSelectedYear(
                parsedState.filters[selectedCurriculum][newValue].year,
              );
              setSelectedSeason(
                parsedState.filters[selectedCurriculum][newValue].season,
              );
            } else {
              setSelectedTopic([]);
              setSelectedYear([]);
              setSelectedPaperType([]);
              setSelectedSeason([]);
            }
          } else {
            setSelectedTopic([]);
            setSelectedYear([]);
            setSelectedPaperType([]);
            setSelectedSeason([]);
            setCurrentTopicFilter(undefined);
            setCurrentPaperTypeFilter(undefined);
          }
        } catch {
          setSelectedTopic([]);
          setSelectedYear([]);
          setSelectedPaperType([]);
          setSelectedSeason([]);
          setCurrentTopicFilter(undefined);
          setCurrentPaperTypeFilter(undefined);
        }
      } else {
        setSelectedTopic([]);
        setSelectedYear([]);
        setSelectedPaperType([]);
        setSelectedSeason([]);
        setCurrentTopicFilter(undefined);
        setCurrentPaperTypeFilter(undefined);
      }

      setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    },
    [selectedSubject, selectedCurriculum],
  );

  const handleTopicChange = useCallback(
    (values: string[] | ((prev: string[]) => string[])) => {
      setSelectedTopic(values);
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    },
    [],
  );

  const handleYearChange = useCallback(
    (values: string[] | ((prev: string[]) => string[])) => {
      setSelectedYear(values);
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    },
    [],
  );

  const handlePaperTypeChange = useCallback(
    (values: string[] | ((prev: string[]) => string[])) => {
      setSelectedPaperType(values);
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    },
    [],
  );

  const handleSeasonChange = useCallback(
    (values: string[] | ((prev: string[]) => string[])) => {
      setSelectedSeason(values);
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    },
    [],
  );

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

    setSelectedCurriculum("CIE A-LEVEL");
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    if (!isMobile) {
      setSidebarKey((prev) => prev + 1);
    }
  }, [isMobile, selectedCurriculum, selectedSubject]);

  return {
    filterState: {
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      currentPaperTypeFilter,
      currentTopicFilter,
      invalidInputs,
      setInvalidInputs,
    },
    setters: {
      setCurrentPaperTypeFilter,
      setCurrentTopicFilter,
    },
    handlers: {
      handleCurriculumChange,
      handleSubjectChange,
      handleTopicChange,
      handleYearChange,
      handlePaperTypeChange,
      handleSeasonChange,
      resetEverything,
      revert,
    },
    refs: {
      curriculumRef,
      subjectRef,
      topicRef,
      yearRef,
      paperTypeRef,
      seasonRef,
    },
    other: {
      sidebarKey,
    },
  };
}
