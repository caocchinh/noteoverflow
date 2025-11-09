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

export type FiltersCache = {
  numberOfColumns: number;
  isSessionCacheEnabled: boolean;
  lastSessionCurriculum: string;
  layoutStyle: LayoutStyle;
  isQuestionCacheEnabled: boolean;
  isStrictModeEnabled: boolean;
  imageTheme: ImageTheme;
  recentlySearchSortedBy: "ascending" | "descending";
  finishedQuestionsSearchSortedBy: "ascending" | "descending";
  numberOfQuestionsPerPage: number;
  scrollUpWhenPageChange: boolean;
  showFinishedQuestionTint: boolean;
  showScrollToTopButton: boolean;
  lastSessionSubject: string;
  isPersistantCacheEnabled: boolean;
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
  isClickingScrollArea: boolean;
  setIsClickingScrollArea: Dispatch<SetStateAction<boolean>>;
  commandListRef: RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  isBlockingInput: boolean;
  setIsBlockingInput: Dispatch<SetStateAction<boolean>>;
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
  bookmarks: SelectedBookmark[];
  isUserSessionPending: boolean;
  isValidSession: boolean;
  listId?: string;
  isSavedActivitiesFetching: boolean;
  isMobileDevice: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[] | undefined;
  isSavedActivitiesError: boolean;
  resetScrollPositions: () => void;
}

export interface BrowseMoreQuestionsProps {
  displayedData: SelectedQuestion[];
  bookmarks: SelectedBookmark[];
  imageTheme: ImageTheme;
  isUserSessionPending: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[];
  showFinishedQuestionTint: boolean;
  isUserSessionError: boolean;
  isSavedActivitiesError: boolean;
  isValidSession: boolean;
  isSavedActivitiesFetching: boolean;
  navigateToQuestion: (questionId: string) => void;
  isBrowseMoreOpen: boolean;
  setIsBrowseMoreOpen: Dispatch<SetStateAction<boolean>>;
}

export interface QuestionInspectProps {
  isOpen: QuestionInspectOpenState;
  setIsOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  bookmarks: SelectedBookmark[];
  imageTheme: ImageTheme;
  currentQuery?: CurrentQuery;
  isUserSessionPending: boolean;
  sortParameters?: SortParameters;
  setSortParameters?: Dispatch<SetStateAction<SortParameters>>;
  isValidSession: boolean;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isSavedActivitiesFetching: boolean;
  isSavedActivitiesError: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[];
  listId?: string;
  BETTER_AUTH_URL: string;
  showFinishedQuestionTint: boolean;
  isUserSessionError: boolean;
}

export interface AppUltilityBarProps {
  fullPartitionedData: SelectedQuestion[][] | undefined;
  layoutStyle: LayoutStyle;
  ultilityRef: RefObject<HTMLDivElement | null>;
  isQuestionViewDisabled: boolean;
  setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  setDisplayedData: Dispatch<SetStateAction<SelectedQuestion[]>>;
  scrollUpWhenPageChange: boolean;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  showFinishedQuestion: boolean;
  filterUrl: string;
  setShowFinishedQuestion: Dispatch<SetStateAction<boolean>>;
}

export interface AppSidebarProps {
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  isTopicalDataFetching: boolean;
  isQuestionViewDisabled: boolean;
  filterUrl: string;
  mountedRef: RefObject<boolean>;
  searchParams: { [key: string]: string | string[] | undefined };
  setIsValidSearchParams: Dispatch<SetStateAction<boolean>>;
  setIsQuestionCacheEnabled: Dispatch<SetStateAction<boolean>>;
  setNumberOfColumns: Dispatch<SetStateAction<number>>;
  setIsStrictModeEnabled: Dispatch<SetStateAction<boolean>>;
  setScrollUpWhenPageChange: Dispatch<SetStateAction<boolean>>;
  setLayoutStyle: Dispatch<SetStateAction<LayoutStyle>>;
  setNumberOfQuestionsPerPage: Dispatch<SetStateAction<number>>;
  setShowScrollToTopButton: Dispatch<SetStateAction<boolean>>;
  setShowFinishedQuestionTint: Dispatch<SetStateAction<boolean>>;
  setImageTheme: Dispatch<SetStateAction<ImageTheme>>;
  imageTheme: ImageTheme;
  showFinishedQuestionTint: boolean;
  showScrollToTopButton: boolean;
  scrollUpWhenPageChange: boolean;
  isQuestionCacheEnabled: boolean;
  numberOfColumns: number;
  layoutStyle: LayoutStyle;
  numberOfQuestionsPerPage: number;
  isStrictModeEnabled: boolean;
  isUserSessionPending: boolean;
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  isValidSession: boolean;
  isAddRecentQueryPending: boolean;
}

export interface FinishedTrackerProps {
  allQuestions: SelectedQuestion[];
  isValidSession: boolean;
  isSavedActivitiesFetching: boolean;
  isUserSessionPending: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[] | undefined;
  bookmarks: SelectedBookmark[];
  imageTheme: ImageTheme;
  navigateToQuestion: (questionId: string) => void;
  showFinishedQuestionTint: boolean;
  isSavedActivitiesError: boolean;
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
  isMounted: boolean;
  layoutStyle: LayoutStyle;
  setLayoutStyle: Dispatch<SetStateAction<LayoutStyle>>;
  numberOfColumns: number;
  setNumberOfColumns: Dispatch<SetStateAction<number>>;
  numberOfQuestionsPerPage: number;
  setNumberOfQuestionsPerPage: Dispatch<SetStateAction<number>>;
  showFinishedQuestionTint: boolean;
  setShowFinishedQuestionTint: Dispatch<SetStateAction<boolean>>;
  showScrollToTopButton: boolean;
  setShowScrollToTopButton: Dispatch<SetStateAction<boolean>>;
  scrollUpWhenPageChange: boolean;
  setScrollUpWhenPageChange: Dispatch<SetStateAction<boolean>>;
  imageTheme: ImageTheme;
  setImageTheme: Dispatch<SetStateAction<ImageTheme>>;
  selectedCurriculumn: ValidCurriculum | null;
  selectedSubject: string | null;
}

export interface SecondaryAppUltilityBarProps {
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isQuestionViewDisabled: boolean;
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  layoutStyle: LayoutStyle;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  setDisplayedData: Dispatch<SetStateAction<SelectedQuestion[]>>;
  scrollUpWhenPageChange: boolean;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  setIsQuestionInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  isSidebarOpen: boolean;
}
