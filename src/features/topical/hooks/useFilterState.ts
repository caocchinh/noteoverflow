import { useState, useCallback, useRef, SetStateAction } from "react";
import { CIE_A_LEVEL_SUBDIVISION, ValidCurriculum } from "@/constants/types";
import { InvalidInputs } from "../types/models";
import {
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

export interface UseFilterStateOptions {
  /** Initial curriculum value */
  initialCurriculum?: ValidCurriculum;
  /** Initial subject value */
  initialSubject?: string;
  /** Initial topic value */
  initialTopic?: string[];
  /** Initial year value */
  initialYear?: string[];
  /** Initial paper type value */
  initialPaperType?: string[];
  /** Initial season value */
  initialSeason?: string[];
  /** Callback when curriculum changes (for cascading updates) */
  onCurriculumChange?: (curriculum: ValidCurriculum) => void;
  /** Callback when subject changes (for cascading updates) */
  onSubjectChange?: (subject: string) => void;
}

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
}

export interface FilterStateSetters {
  setSelectedCurriculum: React.Dispatch<SetStateAction<ValidCurriculum>>;
  setSelectedSubject: React.Dispatch<SetStateAction<string>>;
  setSelectedTopic: React.Dispatch<SetStateAction<string[]>>;
  setSelectedYear: React.Dispatch<SetStateAction<string[]>>;
  setSelectedPaperType: React.Dispatch<SetStateAction<string[]>>;
  setSelectedSeason: React.Dispatch<SetStateAction<string[]>>;
  setCurrentTopicFilter: React.Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined>
  >;
  setCurrentPaperTypeFilter: React.Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined>
  >;
}

export interface FilterStateHandlers {
  /** Handle curriculum change with cascading reset of dependent fields */
  handleCurriculumChange: (value: string) => void;
  /** Handle subject change with cascading reset of dependent fields */
  handleSubjectChange: (value: string) => void;
  /** Handle topic change */
  handleTopicChange: (values: string[]) => void;
  /** Handle year change */
  handleYearChange: (values: string[]) => void;
  /** Handle paper type change */
  handlePaperTypeChange: (values: string[]) => void;
  /** Handle season change */
  handleSeasonChange: (values: string[]) => void;
  /** Reset all filter selections */
  resetAllFilters: () => void;
  /** Reset only dependent filters (topic, year, paperType, season) */
  resetDependentFilters: () => void;
}

export interface UseFilterStateReturn {
  values: FilterStateValues;
  setters: FilterStateSetters;
  handlers: FilterStateHandlers;
  refs: FilterStateRefs;
  invalidInputs: InvalidInputs;
  setInvalidInputs: React.Dispatch<SetStateAction<InvalidInputs>>;
}

/**
 * A hook that manages filter state for topical question filtering.
 * This hook consolidates the common filter state management pattern
 * used across AppSidebar, OptionalFilters, and SecondaryAppSidebar.
 */
export function useFilterState(
  options: UseFilterStateOptions = {},
): UseFilterStateReturn {
  const {
    initialCurriculum = "CIE A-LEVEL",
    initialSubject = "",
    initialTopic = [],
    initialYear = [],
    initialPaperType = [],
    initialSeason = [],
  } = options;

  // State
  const [selectedCurriculum, setSelectedCurriculum] =
    useState<ValidCurriculum>(initialCurriculum);
  const [selectedSubject, setSelectedSubject] =
    useState<string>(initialSubject);
  const [selectedTopic, setSelectedTopic] = useState<string[]>(initialTopic);
  const [selectedYear, setSelectedYear] = useState<string[]>(initialYear);
  const [selectedPaperType, setSelectedPaperType] =
    useState<string[]>(initialPaperType);
  const [selectedSeason, setSelectedSeason] = useState<string[]>(initialSeason);
  const [invalidInputs, setInvalidInputs] = useState<InvalidInputs>({
    ...INVALID_INPUTS_DEFAULT,
  });
  const [currentTopicFilter, setCurrentTopicFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);
  const [currentPaperTypeFilter, setCurrentPaperTypeFilter] = useState<
    CIE_A_LEVEL_SUBDIVISION | "Outdated" | undefined
  >(undefined);

  // Refs for scrolling to invalid inputs
  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);

  // Handlers
  const handleCurriculumChange = useCallback((value: string) => {
    setSelectedCurriculum(value as ValidCurriculum);
    // Reset dependent fields
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
    setCurrentPaperTypeFilter(undefined);
    setCurrentTopicFilter(undefined);
  }, []);

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

  const handleTopicChange = useCallback((values: string[]) => {
    setSelectedTopic(values);
  }, []);

  const handleYearChange = useCallback((values: string[]) => {
    setSelectedYear(values);
  }, []);

  const handlePaperTypeChange = useCallback((values: string[]) => {
    setSelectedPaperType(values);
  }, []);

  const handleSeasonChange = useCallback((values: string[]) => {
    setSelectedSeason(values);
  }, []);

  const resetAllFilters = useCallback(() => {
    setSelectedCurriculum(initialCurriculum);
    setSelectedSubject("");
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
    setInvalidInputs({ ...INVALID_INPUTS_DEFAULT });
  }, [initialCurriculum]);

  const resetDependentFilters = useCallback(() => {
    setSelectedTopic([]);
    setSelectedYear([]);
    setSelectedPaperType([]);
    setSelectedSeason([]);
  }, []);

  // Wrapped setters that also clear invalid inputs
  const setSelectedCurriculumWithClear = useCallback(
    (value: SetStateAction<ValidCurriculum>) => {
      setSelectedCurriculum(value);
      setInvalidInputs((prev) => ({ ...prev, curriculum: false }));
    },
    [],
  );

  const setSelectedSubjectWithClear = useCallback(
    (value: SetStateAction<string>) => {
      setSelectedSubject(value);
      setInvalidInputs((prev) => ({ ...prev, subject: false }));
    },
    [],
  );

  const setSelectedTopicWithClear = useCallback(
    (value: SetStateAction<string[]>) => {
      setSelectedTopic(value);
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    },
    [],
  );

  const setSelectedYearWithClear = useCallback(
    (value: SetStateAction<string[]>) => {
      setSelectedYear(value);
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    },
    [],
  );

  const setSelectedPaperTypeWithClear = useCallback(
    (value: SetStateAction<string[]>) => {
      setSelectedPaperType(value);
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    },
    [],
  );

  const setSelectedSeasonWithClear = useCallback(
    (value: SetStateAction<string[]>) => {
      setSelectedSeason(value);
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    },
    [],
  );

  return {
    values: {
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      currentPaperTypeFilter,
      currentTopicFilter,
    },
    setters: {
      setSelectedCurriculum: setSelectedCurriculumWithClear,
      setSelectedSubject: setSelectedSubjectWithClear,
      setSelectedTopic: setSelectedTopicWithClear,
      setSelectedYear: setSelectedYearWithClear,
      setSelectedPaperType: setSelectedPaperTypeWithClear,
      setSelectedSeason: setSelectedSeasonWithClear,
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
      resetAllFilters,
      resetDependentFilters,
    },
    refs: {
      curriculumRef,
      subjectRef,
      topicRef,
      yearRef,
      paperTypeRef,
      seasonRef,
    },
    invalidInputs,
    setInvalidInputs,
  };
}
