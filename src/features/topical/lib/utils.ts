import {
  PASTPAPERCO_CURRICULUM_CODE_PREFIX,
  PASTPAPERCO_DOMAIN,
  PASTPAPERCO_SEASON_NEW_PREFIX,
  PASTPAPERCO_SEASON_OLD_PREFIX,
  PASTPAPERCO_SUBJECT_CODE,
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

export const extractPaperCode = ({
  questionId,
}: {
  questionId: string;
}): string => {
  const codePart = questionId.split(";")[2];
  return codePart.replaceAll("_", "/");
};

export const extractQuestionNumber = ({
  questionId,
}: {
  questionId: string;
}): number => {
  const questionNumberPart = questionId.split(";")[4];
  return parseInt(questionNumberPart.slice(1));
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
  const splitedQuestionId = questionId.split(";");
  const subjectCode = splitedQuestionId[2].split("_")[0];
  const paper = splitedQuestionId[2].split("_")[1];
  const curriculum = splitedQuestionId[0] as ValidCurriculum;
  const shortSeason = getShortSeason(season);
  const newPaperCode = `${subjectCode}_${shortSeason}${year.slice(
    2
  )}_${type}_${paper}`;
  if (parseInt(year) < 2018) {
    return `${PASTPAPERCO_DOMAIN}/${PASTPAPERCO_CURRICULUM_CODE_PREFIX[curriculum]}/${PASTPAPERCO_SUBJECT_CODE[subjectCode]}/${year}/${year} ${PASTPAPERCO_SEASON_OLD_PREFIX[season]}/${newPaperCode}.pdf`;
  } else {
    return `${PASTPAPERCO_DOMAIN}/${PASTPAPERCO_CURRICULUM_CODE_PREFIX[curriculum]}/${PASTPAPERCO_SUBJECT_CODE[subjectCode]}/${year}-${PASTPAPERCO_SEASON_NEW_PREFIX[season]}/${newPaperCode}.pdf`;
  }
};
