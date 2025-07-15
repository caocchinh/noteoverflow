import type { ValidCurriculum, ValidSeason } from "@/constants/types";
import { question } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";
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

export type FiltersCache = {
  numberOfColumns: number;
  isSessionCacheEnabled: boolean;
  lastSessionCurriculum: string;
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

export type SelectedQuestion = Pick<
  InferSelectModel<typeof question>,
  "id" | "year" | "paperType" | "season"
> & {
  questionImages: string[];
  answers: string[];
  questionTopics: Array<{
    topic: string | null;
  }>;
};

export type SelectedBookmark = {
  createdAt: Date;
  updatedAt: Date;
  visibility: "private" | "public";
  userId: string;
  listName: string;
  userBookmarks: {
    questionId: string;
    updatedAt: Date;
    userId: string;
    listName: string;
  }[];
}[];

export type SelectedFinishedQuestion = {
  updatedAt: Date;
  questionId: string;
}[];

export interface MultiSelectContextProps {
  value: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onValueChange: (value: any, option?: "selectAll" | "removeAll") => void;
  open: boolean;
  setOpen: (value: boolean) => void;
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

export interface BookmarkContextProps {
  isBlockingInput: boolean;
  setIsBlockingInput: Dispatch<SetStateAction<boolean>>;
  searchInput: string;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  bookmarks: SelectedBookmark;
  setSearchInput: Dispatch<SetStateAction<string>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  searchInputRef: RefObject<HTMLInputElement | null>;
  createNewList: () => void;
  isMutatingThisQuestion: boolean;
  openUI: (e: React.MouseEvent) => void;
  questionId: string;
  badgeClassName?: string;
  triggerButtonClassName?: string;
  chosenBookmarkListName: Set<string>;
  isBookmarksFetching: boolean;
  isBookmarkDisabled: boolean;
  onListSelect: (params: {
    bookmark: SelectedBookmark[number];
    isItemBookmarked: boolean;
  }) => void;
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
