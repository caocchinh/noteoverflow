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
} from "../constants/constants";
import type {
  FilterData,
  FiltersCache,
  InvalidInputs,
  FinishedQuestionsMetadata,
  BookmarksMetadata,
  SelectedFinishedQuestion,
  SelectedBookmark,
  SelectedQuestion,
  SubjectMetadata,
} from "../constants/types";
import type {
  OUTDATED,
  CIE_A_LEVEL_SUBDIVISION,
  ValidCurriculum,
  ValidSeason,
  TopicalData,
  TopicalSubject,
} from "@/constants/types";
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

    if (
      !isSubset(
        data.topic,
        currentSubjectData.topic.map((topic) => topic.topicName)
      )
    ) {
      return false;
    }
    if (!data.paperType) {
      return false;
    }
    if (
      !isSubset(
        data.paperType,
        currentSubjectData.paperType.map((paperType) =>
          paperType.paperType.toString()
        )
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

export const validateSubcurriculumnDivision = ({
  value,
  curriculum,
  subject,
  type,
}: {
  value: string;
  curriculum: string;
  subject: string;
  type: "topic" | "paperType";
}): boolean => {
  try {
    if (typeof value !== "string" || !curriculum || !subject) {
      return false;
    }

    // Import TOPICAL_DATA to validate against actual data
    // Find the curriculum data
    const curriculumData = TOPICAL_DATA.find(
      (data: TopicalData) => data.curriculum === curriculum
    );
    if (!curriculumData) return false;

    // Find the subject data
    const subjectData = curriculumData.subject.find(
      (subj: TopicalSubject) => subj.code === subject
    );
    if (!subjectData) return false;

    // Get the relevant data based on type
    let items: (
      | {
          topicName: string;
          topicCurriculumnSubdivision: (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[];
          isTopicUpToDate: boolean;
        }
      | {
          paperType: number;
          paperTypeCurriculumnSubdivision: (
            | CIE_A_LEVEL_SUBDIVISION
            | OUTDATED
          )[];
        }
    )[] = [];
    if (type === "topic") {
      items = subjectData.topic;
    } else if (type === "paperType") {
      items = subjectData.paperType;
    }

    // Extract unique subdivisions using the utility function
    const options = items.map((item) => {
      if (type === "topic") {
        const topicItem = item as {
          topicName: string;
          topicCurriculumnSubdivision: (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[];
          isTopicUpToDate: boolean;
        };
        return {
          value: topicItem.topicName,
          curriculumnSubdivision: topicItem.topicCurriculumnSubdivision,
          isUpToDate: topicItem.isTopicUpToDate,
        };
      } else {
        const paperTypeItem = item as {
          paperType: number;
          paperTypeCurriculumnSubdivision: (
            | CIE_A_LEVEL_SUBDIVISION
            | OUTDATED
          )[];
        };
        return {
          value: paperTypeItem.paperType.toString(),
          curriculumnSubdivision: paperTypeItem.paperTypeCurriculumnSubdivision,
          isUpToDate: true,
        };
      }
    });
    const validSubdivisions =
      extractUniqueTopicCurriculumnSubdivisions(options);

    // Check if the value is in the valid subdivisions
    return validSubdivisions.includes(
      value as CIE_A_LEVEL_SUBDIVISION | OUTDATED
    );
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
  type: "qp" | "ms" | "er" | "gt";
}): string => {
  try {
    const splitedQuestionId = questionId.split(";");
    const subjectCode = splitedQuestionId[2].split("_")[0];
    const paper = splitedQuestionId[2].split("_")[1];
    const curriculum = splitedQuestionId[0] as ValidCurriculum;
    const shortSeason = getShortSeason({ season, verbose: false });
    let newPaperCode = `${subjectCode}-${shortSeason}${year
      .toString()
      .slice(2)}-${type}`;
    if (type === "ms" || type === "qp") {
      newPaperCode = `${newPaperCode}-${paper}`;
    }
    if (newPaperCode === "9608-w15-qp-12") {
      return "https://pastpapers.co/cie/A-Level/Computer-Science-9608/2015/2015%20Nov/9608_w15_qp_12.pdf";
    }
    return `${BESTEXAMHELP_DOMAIN}/${
      BESTEXAMHELP_CURRICULUM_CODE_PREFIX[curriculum as ValidCurriculum]
    }/${BESTEXAMHELP_SUBJECT_CODE[subjectCode]}/${year}/${newPaperCode}.php`;
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
  selectedCurriculum,
  selectedSubject,
  selectedTopic,
  selectedPaperType,
  selectedYear,
  selectedSeason,
  topicSubcurriculumnDivisionPreference,
  paperTypeSubcurriculumnDivisionPreference,
}: {
  selectedCurriculum: string;
  selectedSubject: string;
  selectedTopic?: string[];
  selectedPaperType?: string[];
  selectedYear?: string[];
  selectedSeason?: string[];
  topicSubcurriculumnDivisionPreference?: CIE_A_LEVEL_SUBDIVISION | OUTDATED;
  paperTypeSubcurriculumnDivisionPreference?:
    | CIE_A_LEVEL_SUBDIVISION
    | OUTDATED;
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
    };

    if (selectedCurriculum && selectedSubject) {
      // Get existing filter data or create empty object
      const existingFilterData =
        stateToSave.filters?.[selectedCurriculum]?.[selectedSubject] || {};

      const newFilterData: FilterData & {
        topicSubcurriculumnDivisionPreference?:
          | CIE_A_LEVEL_SUBDIVISION
          | OUTDATED;
        paperTypeSubcurriculumnDivisionPreference?:
          | CIE_A_LEVEL_SUBDIVISION
          | OUTDATED;
      } = { ...existingFilterData };

      if (selectedTopic) {
        newFilterData.topic = selectedTopic;
      }
      if (selectedPaperType) {
        newFilterData.paperType = selectedPaperType;
      }
      if (selectedYear) {
        newFilterData.year = selectedYear;
      }
      if (selectedSeason) {
        newFilterData.season = selectedSeason;
      }

      if (topicSubcurriculumnDivisionPreference) {
        newFilterData.topicSubcurriculumnDivisionPreference =
          topicSubcurriculumnDivisionPreference;
      }

      if (paperTypeSubcurriculumnDivisionPreference) {
        newFilterData.paperTypeSubcurriculumnDivisionPreference =
          paperTypeSubcurriculumnDivisionPreference;
      }

      stateToSave.filters = {
        ...stateToSave.filters,
        [selectedCurriculum]: {
          ...stateToSave.filters?.[selectedCurriculum],
          [selectedSubject]: newFilterData,
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

export function computeCurriculumSubjectMapping<
  T extends { question: SelectedQuestion }
>(questions: T[]): Partial<Record<ValidCurriculum, string[]>> {
  const metadata: Partial<Record<ValidCurriculum, string[]>> = {};
  questions.forEach((question) => {
    const extractedCurriculum = extractCurriculumCode({
      questionId: question.question.id,
    });

    if (extractedCurriculum) {
      const extractedSubjectCodeValue = extractSubjectCode({
        questionId: question.question.id,
      });

      if (!metadata[extractedCurriculum]) {
        metadata[extractedCurriculum] = [];
      }

      if (!metadata[extractedCurriculum].includes(extractedSubjectCodeValue)) {
        metadata[extractedCurriculum].push(extractedSubjectCodeValue);
      }
    }
  });

  return metadata;
}

export function computeFinishedQuestionsMetadata(
  finishedQuestions: SelectedFinishedQuestion[]
): FinishedQuestionsMetadata {
  const curriculumSubjectMapping =
    computeCurriculumSubjectMapping(finishedQuestions);

  // Transform the flat mapping into the required nested structure
  const metadata: FinishedQuestionsMetadata = {};
  Object.entries(curriculumSubjectMapping).forEach(([curriculum, subjects]) => {
    metadata[curriculum as ValidCurriculum] = { subjects };
  });

  return metadata;
}

export function computeSubjectMetadata<
  T extends { question: SelectedQuestion }
>(
  questions: T[],
  selectedCurriculumn: string | null,
  selectedSubject: string | null
): SubjectMetadata | null {
  if (!selectedCurriculumn || !selectedSubject) return null;

  const temp: SubjectMetadata = {
    topic: [],
    year: [],
    paperType: [],
    season: [],
  };

  questions.forEach((questionItem) => {
    const extractedCurriculumn = extractCurriculumCode({
      questionId: questionItem.question.id,
    });
    const extractedSubjectCode = extractSubjectCode({
      questionId: questionItem.question.id,
    });

    if (
      extractedCurriculumn === selectedCurriculumn &&
      extractedSubjectCode === selectedSubject
    ) {
      questionItem.question.topics.forEach((topic) => {
        if (topic && !temp.topic.includes(topic)) {
          temp.topic.push(topic);
        }
      });

      if (!temp.year.includes(questionItem.question.year.toString())) {
        temp.year.push(questionItem.question.year.toString());
      }

      if (
        !temp.paperType.includes(questionItem.question.paperType.toString())
      ) {
        temp.paperType.push(questionItem.question.paperType.toString());
      }

      if (!temp.season.includes(questionItem.question.season)) {
        temp.season.push(questionItem.question.season);
      }
    }
  });

  return temp;
}

export function computeBookmarksMetadata(
  bookmarks: SelectedBookmark[]
): BookmarksMetadata {
  const metadata: BookmarksMetadata = {
    public: {},
    private: {},
  };

  bookmarks.forEach((bookmark) => {
    const visibility = bookmark.visibility as "public" | "private";

    if (!metadata[visibility]) {
      metadata[visibility] = {};
    }

    if (!metadata[visibility][bookmark.id]) {
      metadata[visibility][bookmark.id] = {
        listName: bookmark.listName,
        curricula: {},
      };
    }

    const curriculumSubjectMapping = computeCurriculumSubjectMapping(
      bookmark.userBookmarks
    );

    // Transform the flat mapping into the required nested structure
    Object.entries(curriculumSubjectMapping).forEach(
      ([curriculum, subjects]) => {
        metadata[visibility][bookmark.id].curricula[
          curriculum as ValidCurriculum
        ] = { subjects };
      }
    );
  });

  return metadata;
}

export function filterQuestionsByCriteria<
  T extends { question: SelectedQuestion }
>(
  items: T[] | null | undefined,
  currentFilter:
    | {
        topic: string[];
        year: string[];
        paperType: string[];
        season: string[];
      }
    | null
    | undefined,
  selectedCurriculum: ValidCurriculum | null | undefined,
  selectedSubject: string | null | undefined
): T[] {
  if (!items || !currentFilter || !selectedCurriculum || !selectedSubject) {
    return [];
  }

  return items.filter((item) => {
    const extractedCurriculum = extractCurriculumCode({
      questionId: item.question.id,
    });
    if (extractedCurriculum !== selectedCurriculum) {
      return false;
    }
    const extractedSubjectCode = extractSubjectCode({
      questionId: item.question.id,
    });
    if (extractedSubjectCode !== selectedSubject) {
      return false;
    }
    if (!currentFilter.paperType.includes(item.question.paperType.toString())) {
      return false;
    }
    if (!currentFilter.year.includes(item.question.year.toString())) {
      return false;
    }
    if (
      !hasOverlap(
        item.question.topics
          .map((topic) => topic)
          .filter((topic) => topic !== null),
        currentFilter.topic
      )
    ) {
      return false;
    }
    if (!currentFilter.season.includes(item.question.season)) {
      return false;
    }
    return true;
  });
}

export function chunkQuestionsData<T>(
  items: T[],
  chunkSize: number,
  selector?: (item: T) => SelectedQuestion
): SelectedQuestion[][] {
  const chunkedData: SelectedQuestion[][] = [];
  let currentChunks: SelectedQuestion[] = [];

  items.forEach((item) => {
    if (currentChunks.length === chunkSize) {
      chunkedData.push(currentChunks);
      currentChunks = [];
    }
    const question = selector ? selector(item) : (item as SelectedQuestion);
    currentChunks.push(question);
  });

  if (currentChunks.length > 0) {
    chunkedData.push(currentChunks);
  }

  return chunkedData;
}

/**
 * Extracts unique topicCurriculumnSubdivision values from an array of options
 * @param options - Array of options containing topicCurriculumnSubdivision
 * @returns Array of unique subdivision values
 */
export function extractUniqueTopicCurriculumnSubdivisions(
  options: {
    value: string;
    curriculumnSubdivision: (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[];
    isUpToDate: boolean;
  }[]
): (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[] {
  const allSubdivisions = options
    .filter((option) => option.curriculumnSubdivision)
    .flatMap((option) => option.curriculumnSubdivision!);

  return [...new Set(allSubdivisions)];
}

/**
 * Converts an image from a URL to a PNG Base64 string.
 * This is useful for rendering WebP images in libraries that don't support them (like @react-pdf/renderer).
 * @param url The URL of the image to convert.
 * @returns A Promise that resolves to the Base64 string of the PNG image.
 */
export const convertImageToPngBase64 = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Enable CORS to prevent tainted canvas
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => {
      reject(error);
    };
    img.src = url;
  });
};
