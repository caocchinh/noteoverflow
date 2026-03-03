import { RefObject, SetStateAction, useCallback, useEffect } from "react";
import { isValidInputs as isValidInputsUtil } from "../lib/utils";
import { InvalidInputs } from "../types/models";

export interface UseFilterValidationOptions {
  /** Refs for scrolling to invalid inputs */
  curriculumRef?: RefObject<HTMLDivElement | null>;
  subjectRef?: RefObject<HTMLDivElement | null>;
  topicRef: RefObject<HTMLDivElement | null>;
  yearRef: RefObject<HTMLDivElement | null>;
  paperTypeRef: RefObject<HTMLDivElement | null>;
  seasonRef: RefObject<HTMLDivElement | null>;
  /** Selected filter values */
  selectedCurriculum?: string;
  selectedSubject?: string;
  selectedTopic: string[];
  selectedYear: string[];
  selectedPaperType: string[];
  selectedSeason: string[];
  /** State setter for invalid inputs */
  setInvalidInputs: React.Dispatch<SetStateAction<InvalidInputs>>;
}

export interface UseFilterValidationReturn {
  /**
   * Validate all filter inputs and optionally scroll to first invalid field
   * @param options.scrollOnError - If true, scrolls to first invalid field (default: true)
   * @returns true if all inputs are valid, false otherwise
   */
  validateInputs: (options?: { scrollOnError?: boolean }) => boolean;
}

/**
 * A hook that provides filter validation functionality.
 * Wraps the existing isValidInputs utility function for use in React components.
 *
 * This hook consolidates the validation pattern used across
 * AppSidebar, OptionalFilters, and SecondaryAppSidebar.
 *
 * @example
 * ```tsx
 * const { validateInputs } = useFilterValidation({
 *   refs,
 *   selectedTopic,
 *   selectedYear,
 *   selectedPaperType,
 *   selectedSeason,
 *   setInvalidInputs,
 * });
 *
 * const handleSubmit = () => {
 *   if (validateInputs({ scrollOnError: true })) {
 *     // proceed with search
 *   }
 * };
 * ```
 */
export function useFilterValidation(
  options: UseFilterValidationOptions,
): UseFilterValidationReturn {
  const {
    curriculumRef,
    subjectRef,
    topicRef,
    yearRef,
    paperTypeRef,
    seasonRef,
    selectedCurriculum,
    selectedSubject,
    selectedTopic,
    selectedYear,
    selectedPaperType,
    selectedSeason,
    setInvalidInputs,
  } = options;

  const validateInputs = useCallback(
    ({ scrollOnError = true }: { scrollOnError?: boolean } = {}) => {
      return isValidInputsUtil({
        scrollOnError,
        curriculumRef,
        subjectRef,
        topicRef,
        yearRef,
        paperTypeRef,
        seasonRef,
        selectedCurriculum,
        selectedSubject,
        selectedTopic,
        selectedYear,
        selectedPaperType,
        selectedSeason,
        setInvalidInputs,
      });
    },
    [
      curriculumRef,
      subjectRef,
      topicRef,
      yearRef,
      paperTypeRef,
      seasonRef,
      selectedCurriculum,
      selectedSubject,
      selectedTopic,
      selectedYear,
      selectedPaperType,
      selectedSeason,
      setInvalidInputs,
    ],
  );

  useEffect(() => {
    if (selectedTopic && selectedTopic.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, topic: false }));
    }
  }, [selectedTopic, setInvalidInputs]);

  useEffect(() => {
    if (selectedPaperType && selectedPaperType.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, paperType: false }));
    }
  }, [selectedPaperType, setInvalidInputs]);

  useEffect(() => {
    if (selectedYear && selectedYear.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, year: false }));
    }
  }, [selectedYear, setInvalidInputs]);

  useEffect(() => {
    if (selectedSeason && selectedSeason.length > 0) {
      setInvalidInputs((prev) => ({ ...prev, season: false }));
    }
  }, [selectedSeason, setInvalidInputs]);

  return {
    validateInputs,
  };
}
