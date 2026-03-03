import {
  validateCurriculum,
  validatePartialFilterData,
  validateSubject,
} from "@/features/topical/lib/utils";
import { OptionalSearchFilter } from "../constants/type";

/**
 * Validate search filters using the same logic as server-side
 * Returns null if valid, or an error message string if invalid
 */
export const validateSearchFilter = (
  filter: OptionalSearchFilter | null | undefined,
): string | null => {
  if (!filter) return null;

  // Require curriculum and subject when year, season, or paperType filters are used
  const hasDetailFilters =
    (filter.year && filter.year.length > 0) ||
    (filter.season && filter.season.length > 0) ||
    (filter.paperType && filter.paperType.length > 0);

  if (hasDetailFilters && (!filter.curriculum || !filter.subject)) {
    return "Curriculum and subject are required when using year, season, or paper type filters";
  }

  // Validate curriculum if provided
  if (filter.curriculum && !validateCurriculum(filter.curriculum)) {
    return "Invalid curriculum";
  }

  // Validate subject if curriculum and subject are provided
  if (filter.curriculum && filter.subject && !validateSubject(filter.curriculum, filter.subject)) {
    return "Invalid subject for the selected curriculum";
  }

  // Validate filter data if curriculum and subject are provided
  if (filter.curriculum && filter.subject) {
    if (
      !validatePartialFilterData({
        data: {
          paperType: filter.paperType,
          year: filter.year,
          season: filter.season,
        },
        curriculum: filter.curriculum,
        subject: filter.subject,
      })
    ) {
      return "Invalid filter data for the selected curriculum and subject";
    }
  }

  return null;
};

export const updateSearchQueryParam = (
  query: string,
  filter: OptionalSearchFilter | null = null,
) => {
  try {
    if (typeof window === "undefined") {
      return;
    }
    const params = new URLSearchParams();
    params.set("q", query);

    if (filter) {
      params.set("filter", JSON.stringify(filter));
    }

    window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
  } catch {
    return;
  }
};
