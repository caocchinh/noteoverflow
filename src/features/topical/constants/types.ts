import { Dispatch, SetStateAction, RefObject, ReactNode } from "react";
import type {
  CIE_A_LEVEL_SUBDIVISION,
  OUTDATED,
  ValidCurriculum,
} from "@/constants/types";
import { UseMutateFunction } from "@tanstack/react-query";
import { WebViewerInstance } from "@pdftron/webviewer";
import { Root } from "react-dom/client";

export interface EnhancedSelectContentRef {
  setInputValue: Dispatch<SetStateAction<string>>;
}

export interface MultiSelectorProps {
  selectedValues: string[];
  onValuesChange: (value: string[]) => void;
  allAvailableOptions: string[];
  maxLength?: number;
  label: VALID_LABEL;
}

export interface EnhancedSelectAvailableOptions {
  value: string;
  curriculumnSubdivision: (CIE_A_LEVEL_SUBDIVISION | OUTDATED)[];
  isUpToDate: boolean;
}

export interface EnhancedMultiSelectorProps {
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>
  >;
  isMounted: boolean;
  selectedValues: string[];
  onValuesChange: (value: string[]) => void;
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  maxLength?: number;
  label: VALID_LABEL;
}

export interface MultiSelectorSharedProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  allAvailableOptions: string[];
  label: string;
  maxLength: number | undefined;
  inputRef: RefObject<HTMLInputElement | null>;
}

export interface EnhancedMultiSelectorSharedProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>
  >;
  allValue: string[];
  label: string;
  maxLength: number | undefined;
  allFilterOptions: string[];
  inputRef: RefObject<HTMLInputElement | null>;
  onDeleteAll: () => void;
  onSelectAll: () => void;
}

export interface MultiSelectorContentProps {
  inputRef: RefObject<HTMLInputElement | null>;
  open: boolean;
  setOpen: (open: boolean) => void;
  multiSelectorListRef: RefObject<MultiSelectorListRef | null>;
  children: ReactNode;
}

export interface MultiSelectorListRef {
  setInputValue: Dispatch<SetStateAction<string>>;
  inputValue: string;
}

export interface MultiSelectorListProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  allAvailableOptions: string[];
  setOpen: (open: boolean) => void;
  maxLength: number | undefined;
}

export interface EnhancedMultiSelectorListProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  currentFilter: CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined;
  setCurrentFilter: Dispatch<
    SetStateAction<CIE_A_LEVEL_SUBDIVISION | OUTDATED | undefined>
  >;
  allFilterOptions: string[];
  allAvailableOptions: EnhancedSelectAvailableOptions[];
  setOpen: (open: boolean) => void;
  maxLength: number | undefined;
}

export interface MultiSelectorTriggerButtonUltilityProps {
  onValueChange: (val: string | string[]) => void;
  mousePreventDefault: (e: React.MouseEvent) => void;
  setIsClickingUltility: Dispatch<SetStateAction<boolean>>;
  allAvailableOptions: string[];
  maxLength: number | undefined;
  showSelectAll: boolean;
  showDeleteAll: boolean;
}

export interface MultiSelectorSearchInputProps {
  inputValue: string;
  isBlockingMobileKeyboard: boolean;
  setInputValue: (value: string) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  label: string;
  setOpen: (open: boolean) => void;
  commandListScrollArea: RefObject<HTMLDivElement | null>;
}

export interface MultiSelectorTriggerProps {
  selectedValues: string[];
  onValueChange: (val: string | string[]) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  allAvailableOptions: string[];
  label: string;
  setInputValue: Dispatch<SetStateAction<string>> | undefined;
  maxLength: number | undefined;
  showSelectAll?: boolean;
  showDeleteAll?: boolean;
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

export interface MultiSelectContextProps {
  value: string[];
  onValueChange: (value: string | string[]) => void;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  inputValue: string;
  setInputValue: Dispatch<SetStateAction<string>>;
  inputRef: RefObject<HTMLInputElement | null>;
  commandListScrollArea: RefObject<HTMLDivElement | null>;
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
  navigateToQuestion: (questionId: string, scroll?: boolean) => void;
  isThisTheCurrentQuestion: boolean;
  isInspectSidebarOpen: boolean;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  listId?: string;
  isMobileDevice: boolean;
  resetScrollPositions: () => void;
}

export interface BrowseMoreQuestionsProps {
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  onQuestionClick: (questionId: string) => void;
  isBrowseMoreOpen: boolean;
  setIsBrowseMoreOpen: Dispatch<SetStateAction<boolean>>;
}

export interface QuestionInspectProps {
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  currentQuery?: CurrentQuery;
  sortParameters?: SortParameters;
  setSortParameters?: Dispatch<SetStateAction<SortParameters>>;
  listId?: string;
  BETTER_AUTH_URL: string;
}

export interface AppUltilityBarProps {
  finishedQuestionsFilteredPartitionedData: SelectedQuestion[][] | undefined;
  ultilityRef: RefObject<HTMLDivElement | null>;
  isQuestionViewDisabled: boolean;
  setIsQuestionInspectOpen?: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  setFinishedQuestionsFilteredDisplayData: Dispatch<
    SetStateAction<SelectedQuestion[]>
  >;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  showFinishedQuestion: boolean;
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
  filterUrl: string;
  setShowFinishedQuestion: Dispatch<SetStateAction<boolean>>;
  isExportModeEnabled: boolean;
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
}

export interface AppUltilityBarRef {
  overflowScrollHandler: () => void;
}

export interface AppSidebarProps {
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  isTopicalDataFetching: boolean;
  filterUrl: string;
  isExportModeEnabled: boolean;
  mountedRef: RefObject<boolean>;
  searchParams: { [key: string]: string | string[] | undefined };
  setIsValidSearchParams: Dispatch<SetStateAction<boolean>>;
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  appUltilityBarRef: RefObject<AppUltilityBarRef | null>;
  recentQueryRef: RefObject<RecentQueryRef | null>;
}

export interface FinishedTrackerProps {
  allQuestions: SelectedQuestion[];
  navigateToQuestion: (questionId: string, scroll?: boolean) => void;
}

export type QuestionInspectOpenState = {
  isOpen: boolean;
  questionId: string;
};

export type QuestionInspectViewMode = "question" | "answer" | "both";

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
  isFilteredDisabled: boolean;
  currentChunkIndex?: number;
  setCurrentChunkIndex?: Dispatch<SetStateAction<number>>;
  setDisplayedData?: Dispatch<SetStateAction<SelectedQuestion[]>>;
  scrollAreaRef?: RefObject<HTMLDivElement | null>;
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  setIsQuestionInspectOpen?: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  isSidebarOpen: boolean;
}

export interface AppMainContentProps {
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  isExportModeEnabled: boolean;
  mountedRef: RefObject<boolean>;
  currentQuery: CurrentQuery;
  topicalData: { data: SelectedQuestion[]; isRateLimited: boolean } | undefined;
  isSearchEnabled: boolean;
  isTopicalDataError: boolean;
  isTopicalDataFetching: boolean;
  appUltilityBarRef: RefObject<AppUltilityBarRef | null>;
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

export interface BreadcrumbContentProps {
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  setDisplayedData: Dispatch<SetStateAction<SelectedQuestion[]>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
}

export interface SecondaryMainContentProps {
  topicalData: TopicalData;
  isQuestionViewDisabled: boolean;
  BETTER_AUTH_URL: string;
  listId?: string;
  questionInspectRef: RefObject<QuestionInspectRef | null>;
  preContent?: ReactNode;
  breadcrumbContent: (props: BreadcrumbContentProps) => ReactNode;
  mainContent: ReactNode;
}

export interface InspectSidebarProps {
  allQuestions: SelectedQuestion[];
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  isOpen: QuestionInspectOpenState;
  setIsOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  currentTabThatContainsQuestion: number;
  calculateTabThatQuestionResidesIn: (questionId: string) => number;
  isInspectSidebarOpen: boolean;
  currentQuestionId: string | undefined;
  setCurrentView: Dispatch<SetStateAction<QuestionInspectViewMode>>;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  isInputFocused: RefObject<boolean>;
  resetScrollPositions: () => void;
  listId: string | undefined;
  currentQuestionIndex: number;
  overflowScrollHandler?: () => void;
  navigationButtonsContainerRef: RefObject<HTMLDivElement | null>;
  questionInspectMainContentRef: RefObject<QuestionInspectMainContentRef | null>;
}

export interface InspectSidebarRef {
  handleNextQuestion(): void;
  handlePreviousQuestion(): void;
  navigateToQuestion(questionId: string, scroll?: boolean): void;
  isHandleNextQuestionDisabled: boolean;
  isHandlePreviousQuestionDisabled: boolean;
}

export interface InspectUltilityBarProps {
  currentView: QuestionInspectViewMode;
  setCurrentView: Dispatch<SetStateAction<QuestionInspectViewMode>>;
  currentQuestionData: SelectedQuestion | undefined;
  listId: string | undefined;
  navigationButtonsContainerRef: RefObject<HTMLDivElement | null>;
  sortParameters: SortParameters | undefined;
  setSortParameters: Dispatch<SetStateAction<SortParameters>> | undefined;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  BETTER_AUTH_URL: string;
  sideBarInsetRef: RefObject<HTMLDivElement | null>;
}

export interface InspectUltilityBarRef {
  overflowScrollHandler: () => void;
}

export interface QuestionInspectRef {
  setIsInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  isInspectOpen: QuestionInspectOpenState;
}

export interface QuestionInspectMainContentProps {
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  currentTabThatContainsQuestion: number;
  currentQuestionIndex: number;
  currentQuestionId: string | undefined;
  listId: string | undefined;
  navigationButtonsContainerRef: RefObject<HTMLDivElement | null>;
  inspectUltilityBarRef: RefObject<InspectUltilityBarRef | null>;
  sideBarInspectRef: RefObject<InspectSidebarRef | null>;
  sortParameters: SortParameters | undefined;
  setSortParameters: Dispatch<SetStateAction<SortParameters>> | undefined;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  BETTER_AUTH_URL: string;
  setIsOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  isCoolDown: RefObject<boolean>;
  isInputFocused: RefObject<boolean>;
}

export interface QuestionInspectMainContentRef {
  resetScrollPositions: () => void;
  setCurrentView: Dispatch<SetStateAction<QuestionInspectViewMode>>;
  handleKeyboardNavigation: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface RecentQueryProps {
  setIsSearchEnabled: Dispatch<SetStateAction<boolean>>;
  currentQuery: CurrentQuery;
  setCurrentQuery: Dispatch<SetStateAction<CurrentQuery>>;
  setSelectedCurriculum: Dispatch<SetStateAction<ValidCurriculum>>;
  setSelectedSubject: Dispatch<SetStateAction<string>>;
  setSelectedTopic: Dispatch<SetStateAction<string[]>>;
  setSelectedYear: Dispatch<SetStateAction<string[]>>;
  setSelectedPaperType: Dispatch<SetStateAction<string[]>>;
  setSelectedSeason: Dispatch<SetStateAction<string[]>>;
  isOverwriting: RefObject<boolean>;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
}

export interface RecentQueryRef {
  mutateRecentQuery: UseMutateFunction<
    {
      deletedKey: string | undefined;
      lastSearch: Date | undefined;
      currentQueryKey: {
        curriculumId: string;
        subjectId: string;
      } & FilterData;
    },
    Error,
    {
      curriculumId: string;
      subjectId: string;
    } & FilterData,
    unknown
  >;
  isAddRecentQueryPending: boolean;
}

export interface PdfViewerWrapperHandle {
  instance: WebViewerInstance | null;
  exportAnnotations: () => Promise<string | null>;
  exportPdfWithAnnotations: () => Promise<Blob | null>;
  deleteAllAnnotations: () => void;
}

export interface InnitPdfProps {
  pdfBlob: Blob;
  pdfViewerRef: RefObject<PdfViewerWrapperHandle | null>;
  pdfViewerElementRef: RefObject<HTMLDivElement | null>;
  pdfViewerRootRef: RefObject<Root | null>;
  onDocumentLoaded: () => void;
  onUnmount: () => void;
  author: string | undefined;
  fileName: string;
  onAnnotationsChanged?: (xfdf: string) => void;
}

export interface InnitAnnotatableInspectImagesProps {
  imageSource: string[];
  elementRef: RefObject<HTMLDivElement | null>;
  elementRootRef: RefObject<Root | null>;
  questionId: string;
  isSessionFetching: boolean;
  userName: string | undefined;
  setIsCalculatorOpen: (isOpen: boolean) => void;
  isCalculatorOpen: boolean;
  imageTheme: "light" | "dark";
  typeOfView: "question" | "answer";
}

export interface AnnotatableInspectImageProps {
  typeOfView: "question" | "answer";
  imageSource: string[] | undefined;
  currentQuestionId: string | undefined;
  isSessionFetching: boolean;
  userName: string | undefined;
  setIsCalculatorOpen: (isOpen: boolean) => void;
  isCalculatorOpen: boolean;
  imageTheme: "light" | "dark";
}
