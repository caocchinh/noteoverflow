import {
  BESTEXAMHELP_DOMAIN,
  BESTEXAMHELP_CURRICULUM_CODE_PREFIX,
  BESTEXAMHELP_SUBJECT_CODE,
  TOPICAL_DATA,
} from "@/constants/constants";
import {
  DEFAULT_CACHE,
  FILTERS_CACHE_KEY,
  INVALID_INPUTS_DEFAULT,
  PAPER_TYPE_SORT_DEFAULT_WEIGHT,
  SEASON_SORT_DEFAULT_WEIGHT,
  TOPIC_SORT_DEFAULT_WEIGHT,
  YEAR_SORT_DEFAULT_WEIGHT,
} from "../constants/constants";
import type {
  FilterData,
  FiltersCache,
  InvalidInputs,
  LayoutStyle,
} from "../constants/types";
import type { ValidCurriculum, ValidSeason } from "@/constants/types";
import { Dispatch, RefObject, SetStateAction } from "react";
import { getShortSeason } from "@/lib/utils";

export const validateCurriculum = (curriculum: string): boolean => {
  return TOPICAL_DATA.some((item) => item.curriculum === curriculum);
};

export function isSubset(array1: string[], array2: string[]): boolean {
  // 1. Check if array1 is potentially larger.
  if (array1.length > array2.length) {
    return false;
  }

  // 2. Create a frequency map from the second array.
  const frequencyMap = new Map();
  for (const item of array2) {
    frequencyMap.set(item, (frequencyMap.get(item) || 0) + 1);
  }

  // 3. Iterate through the first array to check for items.
  for (const item of array1) {
    const count = frequencyMap.get(item);

    // If item doesn't exist in map or its count is 0, it's not a subset.
    if (!count) {
      // This will be false for undefined or 0
      return false;
    }

    // Decrement the count, as we've "matched" one item.
    frequencyMap.set(item, count - 1);
  }

  // 4. If the loop completes, all items were found.
  return true;
}

export function hasOverlap(arr1: string[], arr2: string[]): boolean {
  const set1 = new Set(arr1);
  return arr2.some((item) => set1.has(item));
}

export const areArraysIdentical = <T>(array1: T[], array2: T[]): boolean => {
  if (array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) {
      return false;
    }
  }

  return true;
};

export const validateSubject = (
  curriculum: string,
  subject: string
): boolean => {
  const currentCurriculumData = TOPICAL_DATA.find(
    (item) => item.curriculum === curriculum
  );
  if (!currentCurriculumData) {
    return false;
  }
  return currentCurriculumData.subject.some((sub) => sub.code === subject);
};

export const validateFilterData = ({
  data,
  curriculumn,
  subject,
}: {
  data: FilterData;
  curriculumn: string;
  subject: string;
}): boolean => {
  try {
    const currentCurriculumData = TOPICAL_DATA.find(
      (item) => item.curriculum === curriculumn
    );
    if (!currentCurriculumData) {
      return false;
    }

    const currentSubjectData = currentCurriculumData.subject.find(
      (_subject) => _subject.code === subject
    );
    if (!currentSubjectData) {
      return false;
    }

    if (!data.topic) {
      return false;
    }

    if (!isSubset(data.topic, currentSubjectData.topic)) {
      return false;
    }
    if (!data.paperType) {
      return false;
    }
    if (
      !isSubset(
        data.paperType,
        currentSubjectData.paperType.map((paperType) => paperType.toString())
      )
    ) {
      return false;
    }
    if (!data.year) {
      return false;
    }
    if (
      !isSubset(
        data.year,
        currentSubjectData.year.map((year) => year.toString())
      )
    ) {
      return false;
    }
    if (!data.season) {
      return false;
    }
    if (!isSubset(data.season, currentSubjectData.season)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const fuzzySearch = (query: string, text: string): boolean => {
  try {
    if (!query) {
      return true;
    }
    if (!text) {
      return false;
    }
    const lowerQuery = query.toLowerCase();
    const lowerText = text.toLowerCase();
    let queryIndex = 0;
    let textIndex = 0;
    while (queryIndex < lowerQuery.length && textIndex < lowerText.length) {
      if (lowerQuery[queryIndex] === lowerText[textIndex]) {
        queryIndex++;
      }
      textIndex++;
    }
    return queryIndex === lowerQuery.length;
  } catch {
    return false;
  }
};

export const extractPaperCode = ({
  questionId,
}: {
  questionId: string;
}): string => {
  try {
    const codePart = questionId.split(";")[2];
    return codePart.replaceAll("_", "/");
  } catch {
    return "";
  }
};

export const extractQuestionNumber = ({
  questionId,
}: {
  questionId: string;
}): number => {
  try {
    const questionNumberPart = questionId.split(";")[4];
    return parseInt(questionNumberPart.slice(1));
  } catch {
    return 0;
  }
};

export const extractCurriculumCode = ({
  questionId,
}: {
  questionId: string;
}): ValidCurriculum | undefined => {
  try {
    return questionId.split(";")[0] as ValidCurriculum;
  } catch {
    return undefined;
  }
};

export const extractSubjectCode = ({
  questionId,
}: {
  questionId: string;
}): string => {
  try {
    return questionId.split(";")[1] as ValidCurriculum;
  } catch {
    return "";
  }
};

export const parsePastPaperUrl = ({
  questionId,
  year,
  season,
  type,
}: {
  questionId: string;
  year: string;
  season: ValidSeason;
  type: "qp" | "ms";
}): string => {
  try {
    const splitedQuestionId = questionId.split(";");
    const subjectCode = splitedQuestionId[2].split("_")[0];
    const paper = splitedQuestionId[2].split("_")[1];
    const curriculum = splitedQuestionId[0] as ValidCurriculum;
    const shortSeason = getShortSeason({ season, verbose: false });
    const newPaperCode = `${subjectCode}-${shortSeason}${year.slice(
      2
    )}-${type}-${paper}`;
    if (newPaperCode === "9608-w15-qp-12") {
      return "https://pastpapers.co/cie/A-Level/Computer-Science-9608/2015/2015%20Nov/9608_w15_qp_12.pdf";
    }
    return `${BESTEXAMHELP_DOMAIN}/${BESTEXAMHELP_CURRICULUM_CODE_PREFIX[curriculum]}/${BESTEXAMHELP_SUBJECT_CODE[subjectCode]}/${year}/${newPaperCode}.php`;
  } catch {
    return "";
  }
};

export const isOverScrolling = ({
  child,
  parent,
  specialLeftCase,
}: {
  child: HTMLDivElement | null;
  parent: HTMLDivElement | null;
  specialLeftCase?: boolean;
}): {
  isOverScrollingLeft: boolean;
  isOverScrollingRight: boolean;
} => {
  try {
    if (child && parent) {
      if (child.clientWidth >= parent.clientWidth) {
        const childLeft = Math.abs(
          Math.round(child.getBoundingClientRect().left)
        );
        const childRight = Math.abs(
          Math.round(child.getBoundingClientRect().right)
        );
        const parentLeft = Math.abs(
          Math.round(parent.getBoundingClientRect().left)
        );
        const parentRight = Math.abs(
          Math.round(parent.getBoundingClientRect().right)
        );

        const leftThreshold =
          ((Math.max(childLeft, parentLeft) - Math.min(childLeft, parentLeft)) /
            ((childLeft + parentLeft) / 2)) *
          100;
        const rightThreshold =
          ((Math.max(childRight, parentRight) -
            Math.min(childRight, parentRight)) /
            ((childRight + parentRight) / 2)) *
          100;

        if (
          childLeft !== parentLeft &&
          childRight !== parentRight &&
          leftThreshold > 1 &&
          rightThreshold > 1
        ) {
          return {
            isOverScrollingLeft: true,
            isOverScrollingRight: true,
          };
        } else if (
          leftThreshold > 1 &&
          ((childLeft > parentLeft && !specialLeftCase) ||
            (childLeft < parentLeft && specialLeftCase))
        ) {
          return {
            isOverScrollingLeft: true,
            isOverScrollingRight: false,
          };
        } else if (rightThreshold > 1 && childRight > parentRight) {
          return {
            isOverScrollingLeft: false,
            isOverScrollingRight: true,
          };
        }
      } else {
        return {
          isOverScrollingLeft: false,
          isOverScrollingRight: false,
        };
      }
    } else {
      return {
        isOverScrollingLeft: false,
        isOverScrollingRight: false,
      };
    }
    return {
      isOverScrollingLeft: false,
      isOverScrollingRight: false,
    };
  } catch {
    return {
      isOverScrollingLeft: false,
      isOverScrollingRight: false,
    };
  }
};

// Lowest index has the highest weight
export const computeWeightedScoreByArrayIndex = ({
  data,
}: {
  data: string[];
}): Record<string, number> => {
  try {
    const scoreObject: Record<string, number> = {};
    let weight = data.length;
    for (const item of data) {
      const score = weight;
      scoreObject[item] = score;
      weight--;
    }
    return scoreObject;
  } catch {
    return {};
  }
};

export const updateSearchParams = ({
  query,
  questionId = "",
  isInspectOpen = false,
}: {
  query: string;
  questionId: string;
  isInspectOpen: boolean;
}) => {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams();
    params.set("queryKey", query);
    params.set("questionId", questionId);
    params.set("isInspectOpen", isInspectOpen.toString());

    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  } catch {
    return;
  }
};

export const syncFilterCacheToLocalStorage = ({
  isSessionCacheEnabled,
  isPersistantCacheEnabled,
  showFinishedQuestionTint,
  isStrictModeEnabled,
  scrollUpWhenPageChange,
  showScrollToTopButton,
  numberOfColumns,
  layoutStyle,
  numberOfQuestionsPerPage,
  selectedCurriculum,
  selectedSubject,
  selectedTopic,
  imageTheme,
  selectedPaperType,
  selectedYear,
  selectedSeason,
}: {
  isSessionCacheEnabled?: boolean;
  isStrictModeEnabled?: boolean;
  isPersistantCacheEnabled?: boolean;
  layoutStyle?: LayoutStyle;
  showFinishedQuestionTint?: boolean;
  imageTheme?: "dark" | "light";
  scrollUpWhenPageChange?: boolean;
  showScrollToTopButton?: boolean;
  numberOfColumns?: number;
  numberOfQuestionsPerPage?: number;
  selectedCurriculum: string;
  selectedSubject: string;
  selectedTopic: string[];
  selectedPaperType: string[];
  selectedYear: string[];
  selectedSeason: string[];
}) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    let stateToSave: FiltersCache;

    try {
      const existingStateJSON = localStorage.getItem(FILTERS_CACHE_KEY);
      stateToSave = existingStateJSON
        ? JSON.parse(existingStateJSON)
        : { ...DEFAULT_CACHE };
    } catch {
      // If reading fails, start with empty state
      stateToSave = { ...DEFAULT_CACHE };
    }

    stateToSave = {
      ...stateToSave,
      isSessionCacheEnabled:
        isSessionCacheEnabled ?? stateToSave.isSessionCacheEnabled,
      isPersistantCacheEnabled:
        isPersistantCacheEnabled ?? stateToSave.isPersistantCacheEnabled,
      showFinishedQuestionTint:
        showFinishedQuestionTint ?? stateToSave.showFinishedQuestionTint,
      scrollUpWhenPageChange:
        scrollUpWhenPageChange ?? stateToSave.scrollUpWhenPageChange,
      showScrollToTopButton:
        showScrollToTopButton ?? stateToSave.showScrollToTopButton,
      numberOfColumns: numberOfColumns ?? stateToSave.numberOfColumns,
      layoutStyle: layoutStyle ?? stateToSave.layoutStyle,
      numberOfQuestionsPerPage:
        numberOfQuestionsPerPage ?? stateToSave.numberOfQuestionsPerPage,
      imageTheme: imageTheme ?? stateToSave.imageTheme,
      isStrictModeEnabled:
        isStrictModeEnabled ?? stateToSave.isStrictModeEnabled,
    };

    if (selectedCurriculum && selectedSubject) {
      stateToSave.filters = {
        ...stateToSave.filters,
        [selectedCurriculum]: {
          ...stateToSave.filters?.[selectedCurriculum],
          [selectedSubject]: {
            topic: selectedTopic,
            paperType: selectedPaperType,
            year: selectedYear,
            season: selectedSeason,
          },
        },
      };
    }
    if (selectedCurriculum) {
      stateToSave.lastSessionCurriculum = selectedCurriculum;
    }
    if (selectedSubject) {
      stateToSave.lastSessionSubject = selectedSubject;
    }
    localStorage.setItem(FILTERS_CACHE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error);
  }
};

export const computeDefaultSortParams = ({
  paperType,
  topic,
  year,
  season,
}: {
  paperType: string[];
  topic: string[];
  year: string[];
  season: string[];
}) => {
  return {
    paperType: {
      data: computeWeightedScoreByArrayIndex({
        data: paperType,
      }),
      weight: PAPER_TYPE_SORT_DEFAULT_WEIGHT,
    },
    topic: {
      data: computeWeightedScoreByArrayIndex({
        data: topic,
      }),
      weight: TOPIC_SORT_DEFAULT_WEIGHT,
    },
    year: {
      data: computeWeightedScoreByArrayIndex({
        data: year,
      }),
      weight: YEAR_SORT_DEFAULT_WEIGHT,
    },
    season: {
      data: computeWeightedScoreByArrayIndex({
        data: season,
      }),
      weight: SEASON_SORT_DEFAULT_WEIGHT,
    },
  };
};

export const isValidInputs = ({
  setInvalidInputs,
  scrollOnError = true,
  selectedCurriculum,
  curriculumRef,
  selectedSubject,
  subjectRef,
  selectedTopic,
  topicRef,
  selectedYear,
  yearRef,
  selectedPaperType,
  paperTypeRef,
  selectedSeason,
  seasonRef,
}: {
  setInvalidInputs: Dispatch<SetStateAction<InvalidInputs>>;
  scrollOnError?: boolean;
  curriculumRef?: RefObject<HTMLDivElement | null>;
  subjectRef?: RefObject<HTMLDivElement | null>;
  topicRef: RefObject<HTMLDivElement | null>;
  yearRef: RefObject<HTMLDivElement | null>;
  paperTypeRef: RefObject<HTMLDivElement | null>;
  seasonRef: RefObject<HTMLDivElement | null>;
  selectedCurriculum?: string;
  selectedSubject?: string;

  selectedTopic: string[];
  selectedYear: string[];
  selectedPaperType: string[];
  selectedSeason: string[];
}) => {
  const fieldsToValidate: {
    name: keyof InvalidInputs;
    value: string | string[];
    ref: React.RefObject<HTMLDivElement | null>;
    isInvalid: boolean;
  }[] = [
    {
      name: "topic",
      value: selectedTopic,
      ref: topicRef,
      isInvalid: selectedTopic.length === 0,
    },
    {
      name: "year",
      value: selectedYear,
      ref: yearRef,
      isInvalid: selectedYear.length === 0,
    },
    {
      name: "paperType",
      value: selectedPaperType,
      ref: paperTypeRef,
      isInvalid: selectedPaperType.length === 0,
    },
    {
      name: "season",
      value: selectedSeason,
      ref: seasonRef,
      isInvalid: selectedSeason.length === 0,
    },
  ];

  if (selectedCurriculum && curriculumRef) {
    fieldsToValidate.push({
      name: "curriculum",
      value: selectedCurriculum,
      ref: curriculumRef,
      isInvalid: !selectedCurriculum,
    });
  }
  if (selectedSubject && subjectRef) {
    fieldsToValidate.push({
      name: "subject",
      value: selectedSubject,
      ref: subjectRef,
      isInvalid: !selectedSubject,
    });
  }

  const newInvalidInputsState: InvalidInputs = {
    ...INVALID_INPUTS_DEFAULT,
  };

  let isFormValid = true;
  let firstInvalidRef: React.RefObject<HTMLDivElement | null> | null = null;

  for (const field of fieldsToValidate) {
    if (field.isInvalid) {
      newInvalidInputsState[field.name] = true;
      if (isFormValid) {
        firstInvalidRef = field.ref;
      }
      isFormValid = false;
    }
  }
  if (scrollOnError) {
    setInvalidInputs(newInvalidInputsState);

    firstInvalidRef?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  return isFormValid;
};

export const truncateListName = ({ listName }: { listName: string }) => {
  if (listName.length > 12) {
    return listName.slice(0, 12) + "...";
  }
  return listName;
};
