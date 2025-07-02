import { TOPICAL_DATA } from '../constants/constants';
import type { FiltersCache } from '../constants/types';

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

export const valdidateCachedData = ({
  cachedData,
  cachedCurriculum,
  cachedSubject,
}: {
  cachedData: FiltersCache;
  cachedCurriculum: string;
  cachedSubject: string;
}): boolean => {
  try {
    const currentCurriculumData = TOPICAL_DATA.find(
      (item) => item.curriculum === cachedCurriculum
    );
    if (!currentCurriculumData) {
      return false;
    }
    const isCachedSubjectExists = currentCurriculumData.subject.some(
      (subject) => subject.code === cachedSubject
    );
    if (!isCachedSubjectExists) {
      return false;
    }
    const currentSubjectData = currentCurriculumData.subject.find(
      (subject) => subject.code === cachedSubject
    );
    if (!currentSubjectData) {
      return false;
    }
    if (!cachedData.filters[cachedCurriculum][cachedSubject]) {
      return false;
    }
    if (
      !isSubset(
        cachedData.filters[cachedCurriculum][cachedSubject].topic,
        currentSubjectData.topic
      )
    ) {
      return false;
    }
    if (!cachedData.filters[cachedCurriculum][cachedSubject].topic) {
      return false;
    }
    if (
      !isSubset(
        cachedData.filters[cachedCurriculum][cachedSubject].paperType,
        currentSubjectData.paperType.map((paperType) => paperType.toString())
      )
    ) {
      return false;
    }
    if (!cachedData.filters[cachedCurriculum][cachedSubject].paperType) {
      return false;
    }
    if (
      !isSubset(
        cachedData.filters[cachedCurriculum][cachedSubject].year,
        currentSubjectData.year.map((year) => year.toString())
      )
    ) {
      return false;
    }
    if (!cachedData.filters[cachedCurriculum][cachedSubject].year) {
      return false;
    }
    if (
      !isSubset(
        cachedData.filters[cachedCurriculum][cachedSubject].season,
        currentSubjectData.season
      )
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};
