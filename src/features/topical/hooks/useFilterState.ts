import { useState, useCallback, useRef, SetStateAction } from "react";
import { ValidCurriculum } from "@/constants/types";
import { InvalidInputs } from "../types/models";
import { INVALID_INPUTS_DEFAULT } from "../constants/constants";

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
}

export interface FilterStateSetters {
  setSelectedCurriculum: React.Dispatch<SetStateAction<ValidCurriculum>>;
  setSelectedSubject: React.Dispatch<SetStateAction<string>>;
  setSelectedTopic: React.Dispatch<SetStateAction<string[]>>;
  setSelectedYear: React.Dispatch<SetStateAction<string[]>>;
  setSelectedPaperType: React.Dispatch<SetStateAction<string[]>>;
  setSelectedSeason: React.Dispatch<SetStateAction<string[]>>;
}

export interface FilterStateHandlers {
  /** Handle curriculum change with cascading reset of dependent fields */
  handleCurriculumChange: (value: string | ((prev: string) => string)) => void;
  /** Handle subject change with cascading reset of dependent fields */
  handleSubjectChange: (value: string | ((prev: string) => string)) => void;
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
    onCurriculumChange,
    onSubjectChange,
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

  // Refs for scrolling to invalid inputs
  const curriculumRef = useRef<HTMLDivElement | null>(null);
  const subjectRef = useRef<HTMLDivElement | null>(null);
  const topicRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const paperTypeRef = useRef<HTMLDivElement | null>(null);
  const seasonRef = useRef<HTMLDivElement | null>(null);

  // Handlers
  const handleCurriculumChange = useCallback(
    (value: string | ((prev: string) => string)) => {
      const newValue =
        typeof value === "function" ? value(selectedCurriculum) : value;
      setSelectedCurriculum(newValue as ValidCurriculum);
      // Reset dependent fields
      setSelectedSubject("");
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
      onCurriculumChange?.(newValue as ValidCurriculum);
    },
    [selectedCurriculum, onCurriculumChange],
  );

  const handleSubjectChange = useCallback(
    (value: string | ((prev: string) => string)) => {
      const newValue =
        typeof value === "function" ? value(selectedSubject) : value;
      setSelectedSubject(newValue);
      // Reset dependent fields
      setSelectedTopic([]);
      setSelectedYear([]);
      setSelectedPaperType([]);
      setSelectedSeason([]);
      onSubjectChange?.(newValue);
    },
    [selectedSubject, onSubjectChange],
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
    },
    setters: {
      setSelectedCurriculum: setSelectedCurriculumWithClear,
      setSelectedSubject: setSelectedSubjectWithClear,
      setSelectedTopic: setSelectedTopicWithClear,
      setSelectedYear: setSelectedYearWithClear,
      setSelectedPaperType: setSelectedPaperTypeWithClear,
      setSelectedSeason: setSelectedSeasonWithClear,
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
