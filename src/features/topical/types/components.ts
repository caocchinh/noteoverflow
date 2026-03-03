import { ValidCurriculum } from "@/constants/types";
import { WebViewerInstance } from "@pdftron/webviewer";
import { UseMutateFunction } from "@tanstack/react-query";
import { Dispatch, ReactNode, RefObject, SetStateAction } from "react";
import { Root } from "react-dom/client";
import {
  CurrentQuery,
  FilterData,
  SelectedQuestion,
  SortParameters,
  SubjectMetadata,
  TopicalData,
} from "./models";

export interface InfiniteScrollProps {
  next: () => unknown;
  hasMore: boolean;
  root?: Element | Document | null;
  isLoading?: boolean;
}

export interface ExtendedIntersectionObserverInit extends IntersectionObserverInit {
  scrollMargin?: string;
}

export interface QuestionHoverCardProps {
  question: SelectedQuestion;
  navigateToQuestion: (params: { questionId: string; scroll?: boolean }) => void;
  isThisTheCurrentQuestion: boolean;
  isInspectSidebarOpen: boolean;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  listId?: string;
  isMobileDevice: boolean;
  resetScrollPositions: () => void;
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
  setIsAnnotationGuardDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAnnotationGuardDialogOpen: boolean;
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
  isInspectOpen: QuestionInspectOpenState;
  setIsInspectOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
}

export type QuestionInspectOpenState = {
  isOpen: boolean;
  questionId: string;
};

export type QuestionInspectViewMode = "question" | "answer" | "both";

export interface AppUltilityBarProps {
  finishedQuestionsFilteredPartitionedData: SelectedQuestion[][] | undefined;
  ultilityRef: RefObject<HTMLDivElement | null>;
  isQuestionViewDisabled: boolean;
  setIsQuestionInspectOpen?: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
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
  navigateToQuestion: (params: { questionId: string; scroll?: boolean }) => void;
}

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
  fullPartitionedData?: SelectedQuestion[][] | undefined;
  isExportModeEnabled: boolean;
  isFilteredDisabled: boolean;
  currentChunkIndex?: number;
  setCurrentChunkIndex?: Dispatch<SetStateAction<number>>;
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

export interface BreadcrumbContentProps {
  sortParameters: SortParameters;
  setSortParameters: Dispatch<SetStateAction<SortParameters>>;
  fullPartitionedData: SelectedQuestion[][] | undefined;
  currentChunkIndex: number;
  setCurrentChunkIndex: Dispatch<SetStateAction<number>>;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  isExportModeEnabled: boolean;
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

export interface InspectSidebarRef {
  handleNextQuestion(): void;
  handlePreviousQuestion(): void;
  navigateToQuestion(params: { questionId: string; scroll?: boolean }): void;
  isHandleNextQuestionDisabled: boolean;
  isHandlePreviousQuestionDisabled: boolean;
}

export interface InspectUltilityBarProps {
  isAnnotationGuardDialogOpen: boolean;
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
  setIsAnnotationGuardDialogOpen: Dispatch<SetStateAction<boolean>>;
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
  initialXfdf: string | null;
  fileName: string;
  onAnnotationsChanged?: (xfdf: string) => void;
}

export interface AnnotatableImagesUpdaterProps {
  isMounted: boolean;
  elementRef: RefObject<HTMLDivElement | null>;
  elementRootRef: RefObject<Root | null>;
  question: SelectedQuestion | undefined;
  typeOfView: "question" | "answer";
  componentRef: RefObject<AnnotatableInspectImagesHandle | null>;
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
  setIsAnnotationGuardDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAnnotationGuardDialogOpen: boolean;
}

export interface UnsafeChangesState {
  answer: boolean;
  question: boolean;
  questionId: string;
}

export type IsHavingUnsafeChangesRef = RefObject<UnsafeChangesState>;

export interface AnnotatableInspectImageProps {
  typeOfView: "question" | "answer";
  isSessionFetching: boolean;
  isAuthenticated: boolean;
  userName: string | undefined;
  setIsCalculatorOpen: (isOpen: boolean) => void;
  isCalculatorOpen: boolean;
  imageTheme: "light" | "dark";
  initialXfdf: string | null;
  question: SelectedQuestion | undefined;
  isSavedActivitiesLoading: boolean;
  isSavedActivitiesError: boolean;
  isAnnotationGuardDialogOpen: boolean;
  isSavingAnnotations: boolean;
  onSaveAnnotations: (
    data: {
      questionId: string;
      questionXfdf?: string;
      answerXfdf?: string;
    },
    callbacks?: {
      onSuccess?: () => void;
    },
  ) => void;
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
}

export interface AnnotatableInspectImagesHandle {
  isEditMode: boolean;
}

export interface BookmarkTriggerProps {
  question: SelectedQuestion;
  isBookmarkDisabled: boolean;
  badgeClassName?: string;
  triggerButtonClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export interface BookmarkSearchInputProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  setOpen: (value: boolean) => void;
}

export interface BookmarkListProps {
  setOpen: (value: boolean) => void;
  question: SelectedQuestion;
  listId?: string;
  isAnnotationGuardDialogOpen?: boolean;
  setIsAnnotationGuardDialogOpen?: Dispatch<SetStateAction<boolean>>;
  isHavingUnsafeChangesRef?: IsHavingUnsafeChangesRef;
}

export interface BookmarkListRef {
  searchInput: string;
  setSearchInput: Dispatch<SetStateAction<string>>;
}

export interface BookmarkItemProps {
  listName: string;
  visibility: "public" | "private";
  listId: string;
  question: SelectedQuestion;
  chosenBookmarkList: Set<string>;
}

export interface BookmarkActionDialogsProps {
  question: SelectedQuestion;
  listId?: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  chosenBookmarkList: Set<string>;
  isAnnotationGuardDialogOpen?: boolean;
  setIsAnnotationGuardDialogOpen?: Dispatch<SetStateAction<boolean>>;
  isHavingUnsafeChangesRef?: IsHavingUnsafeChangesRef;
}

export interface BookmarkButtonProps {
  isAnnotationGuardDialogOpen?: boolean;
  setIsAnnotationGuardDialogOpen?: Dispatch<SetStateAction<boolean>>;
  question: SelectedQuestion;
  isBookmarkDisabled: boolean;
  isPopoverOpen?: boolean;
  setIsPopoverOpen?: (open: boolean) => void;
  setIsHovering?: (value: boolean) => void;
  popOverAlign?: "start" | "end";
  setShouldOpen?: (value: boolean) => void;
  listId?: string;
  badgeClassName?: string;
  popOverTriggerClassName?: string;
  triggerButtonClassName?: string;
  isInView: boolean;
  isHavingUnsafeChangesRef?: IsHavingUnsafeChangesRef;
}

export interface BookmarkButtonSharedProps {
  question: BookmarkButtonProps["question"];
  isBookmarkDisabled: boolean;
  badgeClassName?: string;
  triggerButtonClassName?: string;
  popOverTriggerClassName?: string;
  popOverAlign?: "start" | "center" | "end";
  listId: string | undefined;
  open: boolean;
  handleOpenChange: (value: boolean | ((prev: boolean) => boolean)) => void;
  setIsHovering?: (value: boolean) => void;
  setShouldOpen?: (value: boolean) => void;
  openUI: (e: React.MouseEvent) => void;
  isAnnotationGuardDialogOpen?: boolean;
  setIsAnnotationGuardDialogOpen?: Dispatch<SetStateAction<boolean>>;
  isHavingUnsafeChangesRef?: IsHavingUnsafeChangesRef;
}

export interface ExportReviewDialogProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  questionsForExport: Set<string>;
  questionsForExportArray: string[];
  setQuestionsForExport: Dispatch<SetStateAction<Set<string>>>;
  setQuestionsForExportArray: Dispatch<SetStateAction<string[]>>;
  allQuestions: SelectedQuestion[];
}

export interface ExportSelectListProps {
  canReorder: boolean;
  questionsForExportArray: string[];
  setQuestionsForExportArray: Dispatch<SetStateAction<string[]>>;
  filteredQuestions: SelectedQuestion[];
  toggleQuestion: (questionId: string) => void;
  allQuestions: SelectedQuestion[];
  questionsForExport: Set<string>;
  currentlyPreviewQuestion: string | null;
  isOpen: boolean;
  setCurrentlyPreviewQuestion: Dispatch<SetStateAction<string | null>>;
  setIsMobilePreviewOpen: Dispatch<SetStateAction<boolean>>;
}
