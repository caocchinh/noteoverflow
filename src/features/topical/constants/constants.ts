import type {
  FiltersCache,
  UiPreferencesCache,
  InvalidInputs,
  LayoutStyle,
  SortByOptions,
} from "./types";

export const FILTERS_CACHE_KEY = "noteoverflow-filters-cache";
export const UI_PREFERENCES_CACHE_KEY = "noteoverflow-ui-preferences-cache";

export const INVALID_INPUTS_DEFAULT: InvalidInputs = {
  curriculum: false,
  subject: false,
  topic: false,
  year: false,
  paperType: false,
  season: false,
};

export const DEFAULT_NUMBER_OF_COLUMNS = 3;

export const COLUMN_BREAKPOINTS = {
  1: { 0: 1 },
  2: { 0: 1, 1: 2 },
  3: { 0: 1, 1: 2, 500: 3 },
  4: { 0: 1, 1: 2, 500: 3, 790: 4 },
  5: { 0: 1, 1: 2, 500: 3, 790: 4, 900: 5 },
};

export const INFINITE_SCROLL_CHUNK_SIZE = 35;
export const CACHE_EXPIRE_TIME = 1000 * 60 * 60 * 24 * 3;

export const DEFAULT_LAYOUT_STYLE: LayoutStyle = "pagination";
export const DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE = 50;
export const MAX_NUMBER_OF_COLUMNS = 5;
export const MAXIMUM_NUMBER_OF_QUESTIONS_PER_PAGE = 100;

export const MAX_NUMBER_OF_RECENT_QUERIES = 30;
export const DEFAULT_SORT_OPTIONS: SortByOptions = "descending";
export const DEFAULT_IMAGE_THEME = "light";

export const DEFAULT_UI_PREFERENCES_CACHE: UiPreferencesCache = {
  numberOfColumns: DEFAULT_NUMBER_OF_COLUMNS,
  layoutStyle: DEFAULT_LAYOUT_STYLE,
  numberOfQuestionsPerPage: DEFAULT_NUMBER_OF_QUESTIONS_PER_PAGE,
  imageTheme: DEFAULT_IMAGE_THEME,
  isStrictModeEnabled: false,
  isQuestionCacheEnabled: true,
  showFinishedQuestionTint: true,
  showScrollToTopButton: true,
  scrollUpWhenPageChange: true,
  recentlySearchSortedBy: DEFAULT_SORT_OPTIONS,
  isSessionCacheEnabled: true,
  isPersistantCacheEnabled: true,
};

export const DEFAULT_CACHE: FiltersCache = {
  lastSessionCurriculum: "",
  lastSessionSubject: "",
  filters: {},
};

export const LIST_NAME_MAX_LENGTH = 100;
export const MANSONRY_GUTTER_BREAKPOINTS = { 0: "10px" };
