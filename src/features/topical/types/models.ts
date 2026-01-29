import { ValidCurriculum } from "@/constants/types";

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

export type DisplayMode = "questions" | "answers";

export interface SelectedQuestion {
  year: number;
  season: string;
  id: string;
  paperType: number;
  questionImages: string[];
  questionImagesDimensions: { width: number; height: number }[] | null;
  answersImagesDimensions: { width: number; height: number }[] | null;
  answers: string[];
  topics: string[];
}

export interface VectorizeSelectedQuestion extends SelectedQuestion {
  score: number;
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

export interface SelectedAnnotation {
  questionId: string;
  questionXfdf: string;
  answerXfdf: string;
  updatedAt: Date;
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
  annotations: SelectedAnnotation[];
}

export type SortByOptions = "ascending" | "descending";

export interface SortParameters {
  sortBy: SortByOptions;
}

export type CurrentQuery = {
  curriculumId: string;
  subjectId: string;
} & FilterData;

export type TopicalData =
  | SelectedPublickBookmark[]
  | SelectedFinishedQuestion[]
  | null;

// Common type for sorting elements that have updatedAt
export type SortableTopicalItem =
  | SelectedPublickBookmark
  | SelectedFinishedQuestion;

export interface CreateListMutationVariables {
  question: SelectedQuestion;
  bookmarkListName: string;
  visibility: "public" | "private";
}

export interface ToggleBookmarkMutationVariables {
  question: SelectedQuestion;
  listId: string;
  isBookmarked: boolean;
  bookmarkListName: string;
}
