import type { ValidCurriculum, ValidSeason } from "@/constants/types";
import { question } from "@/drizzle/schema";
import { InferSelectModel } from "drizzle-orm";

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
  dir?: string;
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
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  handleSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
  isClickingScrollArea: boolean;
  setIsClickingScrollArea: React.Dispatch<React.SetStateAction<boolean>>;
  commandListRef: React.RefObject<HTMLDivElement | null>;
  allAvailableOptions?: string[];
  isBlockingInput: boolean;
  setIsBlockingInput: React.Dispatch<React.SetStateAction<boolean>>;
  label: VALID_LABEL;
  prerequisite: string;
  isMobileDevice: boolean;
  maxLength?: number;
}
