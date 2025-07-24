import type { ValidCurriculum, ValidSeason } from "@/constants/types";
import { Dispatch, SetStateAction, RefObject } from "react";

export interface TopicalData {
  curriculum: ValidCurriculum;
  coverImage: string;
  subject: {
    coverImage: string;
    code: string;
    topic: string[];
    year: number[];
    paperType: number[];
    season: ValidSeason[];
  }[];
}

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
  questionTopics: {
    topic: string | null;
  }[];
}

export interface SelectedBookmark {
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
  topic: {
    data: Record<string, number>;
    weight: number;
  };
  paperType: {
    data: Record<string, number>;
    weight: number;
  };
  year: {
    data: Record<string, number>;
    weight: number;
  };
  season: {
    data: Record<string, number>;
    weight: number;
  };
}

export type CurrentQuery = {
  curriculumId: string;
  subjectId: string;
} & FilterData;
