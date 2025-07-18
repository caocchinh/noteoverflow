import {
  BESTEXAMHELP_CURRICULUM_CODE_PREFIX,
  BESTEXAMHELP_DOMAIN,
  BESTEXAMHELP_SUBJECT_CODE,
  TOPICAL_DATA,
} from "../constants/constants";
import type { FilterData } from "../constants/types";
import type { ValidCurriculum, ValidSeason } from "@/constants/types";

export const validateCurriculum = (curriculum: string): boolean => {
  return TOPICAL_DATA.some((item) => item.curriculum === curriculum);
};

function isSubset(array1: string[], array2: string[]): boolean {
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

const getShortSeason = (season: ValidSeason): string | undefined => {
  if (season === "Summer") {
    return "s";
  } else if (season === "Winter") {
    return "w";
  } else if (season === "Spring") {
    return "m";
  }
  return undefined;
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
    const shortSeason = getShortSeason(season);
    const newPaperCode = `${subjectCode}-${shortSeason}${year.slice(
      2
    )}-${type}-${paper}`;
    return `${BESTEXAMHELP_DOMAIN}/${BESTEXAMHELP_CURRICULUM_CODE_PREFIX[curriculum]}/${BESTEXAMHELP_SUBJECT_CODE[subjectCode]}/${year}/${newPaperCode}.php`;
  } catch {
    return "";
  }
};

export const isOverScrolling = ({
  child,
  parent,
}: {
  child: HTMLDivElement | null;
  parent: HTMLDivElement | null;
}): {
  isOverScrollingLeft: boolean;
  isOverScrollingRight: boolean;
} => {
  if (child && parent) {
    if (child.clientWidth >= parent.clientWidth) {
      const ultilityLeft = Math.abs(
        Math.round(child.getBoundingClientRect().left)
      );
      const ultilityRight = Math.abs(
        Math.round(child.getBoundingClientRect().right)
      );
      const sideBarInsetLeft = Math.abs(
        Math.round(parent.getBoundingClientRect().left)
      );
      const sideBarInsetRight = Math.abs(
        Math.round(parent.getBoundingClientRect().right)
      );

      const leftThreshold =
        ((Math.max(ultilityLeft, sideBarInsetLeft) -
          Math.min(ultilityLeft, sideBarInsetLeft)) /
          ((ultilityLeft + sideBarInsetLeft) / 2)) *
        100;
      const rightThreshold =
        ((Math.max(ultilityRight, sideBarInsetRight) -
          Math.min(ultilityRight, sideBarInsetRight)) /
          ((ultilityRight + sideBarInsetRight) / 2)) *
        100;

      if (
        ultilityLeft !== sideBarInsetLeft &&
        ultilityRight !== sideBarInsetRight &&
        leftThreshold > 1 &&
        rightThreshold > 1
      ) {
        return {
          isOverScrollingLeft: true,
          isOverScrollingRight: true,
        };
      } else if (leftThreshold > 1 && ultilityLeft > sideBarInsetLeft) {
        return {
          isOverScrollingLeft: true,
          isOverScrollingRight: false,
        };
      } else if (rightThreshold > 1 && ultilityRight > sideBarInsetRight) {
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
};
