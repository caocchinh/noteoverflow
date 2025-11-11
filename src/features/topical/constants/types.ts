import { Dispatch, SetStateAction, RefObject } from "react";
import type { ValidCurriculum } from "@/constants/types";

export interface MultiSelectorProps {
  values: string[];
  onValuesChange: (value: string[]) => void;
  loop?: boolean;
  data?: string[];
  maxLength?: number;
  label: VALID_LABEL;
  prerequisite: string;
}

export type VALID_LABEL =
  | "Curriculum"
  | "Subject"
  | "Topic"
  | "Year"
  | "Paper"
  | "Season";

export interface InvalidInputs {
  curriculum: boolean;
  subject: boolean;
  topic: boolean;
  year: boolean;
  paperType: boolean;
  season: boolean;
}

export interface FilterData {
  topic: string[];
  paperType: string[];
  year: string[];
  season: string[];
}

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
      [subject: string]: FilterData;
    };
  };
};

export interface SelectedQuestion {
  year: number;
  season: string;
  id: string;
  paperType: number;
  questionImages: string[];
  answers: string[];
  topics: string[];
}

export interface SelectedBookmark {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  listName: string;
  visibility: string;
  userBookmarks: {
    updatedAt: Date;
    question: SelectedQuestion;
  }[];
}

export interface SelectedFinishedQuestion {
  updatedAt: Date;
  question: SelectedQuestion;
}

export interface SelectedPublickBookmark {
  updatedAt: Date;
  question: SelectedQuestion;
}

// Generic metadata structure for consistent API responses
export interface CurriculumMetadata {
  subjects: string[];
}

// Unified bookmark metadata structure
export interface BookmarkMetadataItem {
  listName: string;
  curricula: Partial<Record<ValidCurriculum, CurriculumMetadata>>;
}

export interface SubjectMetadata {
  topic: string[];
  year: string[];
  paperType: string[];
  season: string[];
}

type BookmarkId = string;

// Organized by visibility for bookmarks
export type BookmarksMetadata = Record<
  "public" | "private",
  Record<BookmarkId, BookmarkMetadataItem>
>;

// Simple curriculum mapping for finished questions
export type FinishedQuestionsMetadata = Partial<
  Record<ValidCurriculum, CurriculumMetadata>
>;

export interface SavedActivitiesResponse {
  finishedQuestions: SelectedFinishedQuestion[];
  bookmarks: SelectedBookmark[];
}

export interface MultiSelectContextProps {
  value: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange: (value: any, option?: "selectAll" | "removeAll") => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
  commandListRef: RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  label: VALID_LABEL;
  prerequisite: string;
  isMobileDevice: boolean;
  maxLength?: number;
}

export interface InfiniteScrollProps {
  next: () => unknown;
  hasMore: boolean;
  root?: Element | Document | null;
  isLoading?: boolean;
}

// Extend the IntersectionObserverInit interface to include scrollMargin
export interface ExtendedIntersectionObserverInit
  extends IntersectionObserverInit {
  scrollMargin?: string;
}

export type SortByOptions = "ascending" | "descending";

export interface SortParameters {
  sortBy: SortByOptions;
}

export type CurrentQuery = {
  curriculumId: string;
  subjectId: string;
} & FilterData;

export interface QuestionHoverCardProps {
  question: SelectedQuestion;
  currentTab: number;
  currentQuestionId?: string;
  isInspectSidebarOpen: boolean;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  setCurrentTabThatContainsQuestion: Dispatch<SetStateAction<number>>;
  listId?: string;
  isMobileDevice: boolean;
  resetScrollPositions: () => void;
}

export interface BrowseMoreQuestionsProps {
  browseMoreData: SelectedQuestion[];
  navigateToQuestion: (questionId: string) => void;
  isBrowseMoreOpen: boolean;
  setIsBrowseMoreOpen: Dispatch<SetStateAction<boolean>>;
}

export interface QuestionInspectProps {
  isOpen: QuestionInspectOpenState;
  setIsOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  currentQuery?: CurrentQuery;
  sortParameters?: SortParameters;
  setSortParameters?: Dispatch<SetStateAction<SortParameters>>;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  listId?: string;
  BETTER_AUTH_URL: string;
}

export interface AppUltilityBarProps {
  fullPartitionedData: SelectedQuestion[][] | undefined;
  ultilityRef: RefObject<HTMLDivElement | null>;
  isQuestionViewDisabled: boolean;
  setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  setDisplayedData: Dispatch<SetStateAction<SelectedQuestion[]>>;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  showFinishedQuestion: boolean;
  filterUrl: string;
  setShowFinishedQuestion: Dispatch<SetStateAction<boolean>>;
}

export interface AppSidebarProps {
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  isTopicalDataFetching: boolean;
  filterUrl: string;
  mountedRef: RefObject<boolean>;
  searchParams: { [key: string]: string | string[] | undefined };
  setIsValidSearchParams: Dispatch<SetStateAction<boolean>>;
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  isAddRecentQueryPending: boolean;
}

export interface FinishedTrackerProps {
  allQuestions: SelectedQuestion[];
  navigateToQuestion: (questionId: string) => void;
}

export type QuestionInspectOpenState = {
  isOpen: boolean;
  questionId: string;
};

export interface SecondaryAppSidebarProps {
  subjectMetadata: SubjectMetadata | null;
  currentFilter: SubjectMetadata | null;
  setCurrentFilter: Dispatch<SetStateAction<SubjectMetadata | null>>;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  selectedCurriculumn: ValidCurriculum | null;
  selectedSubject: string | null;
}

export interface SecondaryAppUltilityBarProps {
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isQuestionViewDisabled: boolean;
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
  // Optional props for inspect and pagination functionality
  fullPartitionedData?: SelectedQuestion[][] | undefined;
  currentChunkIndex?: number;
  setCurrentChunkIndex?: Dispatch<SetStateAction<number>>;
  setDisplayedData?: Dispatch<SetStateAction<SelectedQuestion[]>>;
  scrollAreaRef?: RefObject<HTMLDivElement | null>;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  isSidebarOpen: boolean;
}

export interface AppMainContentProps {
  mountedRef: RefObject<boolean>;
  currentQuery: CurrentQuery;
  topicalData: { data: SelectedQuestion[]; isRateLimited: boolean } | undefined;
  isSearchEnabled: boolean;
  isTopicalDataError: boolean;
  isTopicalDataFetching: boolean;
  isTopicalDataFetched: boolean;
  isValidSearchParams: boolean;
  BETTER_AUTH_URL: string;
  refetchTopicalData: () => void;
  searchParams: { [key: string]: string | string[] | undefined };
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
  ultilityRef: RefObject<HTMLDivElement | null>;
  filterUrl: string;
}

export type TopicalData =
  | SelectedPublickBookmark[]
  | SelectedFinishedQuestion[]
  | null;

// Common type for sorting elements that have updatedAt
export type SortableTopicalItem =
  | SelectedPublickBookmark
  | SelectedFinishedQuestion;

export interface SecondaryMainContentProps {
  // Data and state
  topicalData: TopicalData;
  isQuestionViewDisabled: boolean;
  BETTER_AUTH_URL: string;
  listId?: string;

  // Custom content sections
  preContent?: React.ReactNode;
  breadcrumbContent: React.ReactNode;
  mainContent: React.ReactNode;
  isQuestionInspectOpen: QuestionInspectOpenState;
  setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
}
