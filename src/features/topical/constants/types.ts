import { Dispatch, SetStateAction, RefObject } from "react";

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

export type FiltersCache = {
  numberOfColumns: number;
  isSessionCacheEnabled: boolean;
  lastSessionCurriculum: string;
  layoutStyle: LayoutStyle;
  isQuestionCacheEnabled: boolean;
  isStrictModeEnabled: boolean;
  imageTheme: "dark" | "light";
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

export interface SortParameters {
  sortBy: "year-asc" | "year-desc";
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
  userFinishedQuestions?: SelectedFinishedQuestion[];
  bookmarks: SelectedBookmark[];
  isUserSessionPending: boolean;
  isValidSession: boolean;
  listId?: string;
  isBookmarksFetching: boolean;
  isMobileDevice: boolean;
  isBookmarkError: boolean;
}

export interface BrowseMoreQuestionsProps {
  displayedData: SelectedQuestion[];
  bookmarks: SelectedBookmark[];
  imageTheme: "dark" | "light";
  isUserSessionPending: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[];
  showFinishedQuestionTint: boolean;
  isUserSessionError: boolean;
  isBookmarkError: boolean;
  isValidSession: boolean;
  isBookmarksFetching: boolean;
  navigateToQuestion: (questionId: string) => void;
}

export interface QuestionInspectProps {
  isOpen: {
    isOpen: boolean;
    questionId: string;
  };

  setIsOpen: Dispatch<SetStateAction<{ isOpen: boolean; questionId: string }>>;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  bookmarks: SelectedBookmark[];
  imageTheme: "dark" | "light";
  currentQuery?: CurrentQuery;
  isUserSessionPending: boolean;
  sortBy?: "ascending" | "descending";
  setSortBy?: Dispatch<SetStateAction<"ascending" | "descending">>;
  sortParameters?: SortParameters | null;
  setSortParameters?: Dispatch<SetStateAction<SortParameters | null>>;
  isValidSession: boolean;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isBookmarksFetching: boolean;
  isBookmarkError: boolean;
  isFinishedQuestionsFetching: boolean;
  isFinishedQuestionsError: boolean;
  userFinishedQuestions: SelectedFinishedQuestion[];
  listId?: string;
  BETTER_AUTH_URL: string;
  showFinishedQuestionTint: boolean;
  isUserSessionError: boolean;
}
