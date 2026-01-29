import type { CIE_A_LEVEL_SUBDIVISION, OUTDATED } from "@/constants/types";
import { SortByOptions } from "./models";
import { FilterData } from "./models";

export type LayoutStyle = "pagination" | "infinite";
export type ImageTheme = "dark" | "light";

export interface UiPreferences {
  numberOfColumns: number;
  layoutStyle: LayoutStyle;
  numberOfQuestionsPerPage: number;
  imageTheme: ImageTheme;
  isStrictModeEnabled: boolean;
  isQuestionCacheEnabled: boolean;
  showFinishedQuestionTint: boolean;
  showScrollToTopButton: boolean;
  scrollUpWhenPageChange: boolean;
  recentlySearchSortedBy: SortByOptions;
  isSessionCacheEnabled: boolean;
  isPersistantCacheEnabled: boolean;
}

export type UiPreferencesCache = Pick<
  UiPreferences,
  | "numberOfColumns"
  | "layoutStyle"
  | "numberOfQuestionsPerPage"
  | "imageTheme"
  | "isStrictModeEnabled"
  | "isQuestionCacheEnabled"
  | "showFinishedQuestionTint"
  | "showScrollToTopButton"
  | "scrollUpWhenPageChange"
  | "recentlySearchSortedBy"
  | "isSessionCacheEnabled"
  | "isPersistantCacheEnabled"
>;

export type FiltersCache = {
  lastSessionCurriculum: string;
  lastSessionSubject: string;
  filters: {
    [curriculum: string]: {
      [subject: string]: FilterData & {
        topicSubcurriculumnDivisionPreference?:
          | CIE_A_LEVEL_SUBDIVISION
          | OUTDATED;
        paperTypeSubcurriculumnDivisionPreference?:
          | CIE_A_LEVEL_SUBDIVISION
          | OUTDATED;
      };
    };
  };
};
