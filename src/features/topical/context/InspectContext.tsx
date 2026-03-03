import { createContext, Dispatch, RefObject, SetStateAction, useContext } from "react";
import {
  InspectSidebarRef,
  InspectUltilityBarRef,
  IsHavingUnsafeChangesRef,
  QuestionInspectMainContentRef,
  QuestionInspectOpenState,
  QuestionInspectViewMode,
} from "../types/components";
import { SelectedQuestion, SortParameters } from "../types/models";

interface InspectContextType {
  // Data
  allQuestions: SelectedQuestion[];
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  listId: string | undefined;
  BETTER_AUTH_URL: string;

  // State
  isOpen: QuestionInspectOpenState;
  setIsOpen: Dispatch<SetStateAction<QuestionInspectOpenState>>;
  currentQuestionId: string | undefined;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  currentQuestionIndex: number;
  currentTabThatContainsQuestion: number;
  currentView: QuestionInspectViewMode;
  setCurrentView: Dispatch<SetStateAction<QuestionInspectViewMode>>;
  isInspectSidebarOpen: boolean;
  setIsInspectSidebarOpen: Dispatch<SetStateAction<boolean>>;
  sortParameters: SortParameters | undefined;
  setSortParameters: Dispatch<SetStateAction<SortParameters>> | undefined;
  isAnnotationGuardDialogOpen: boolean;
  setIsAnnotationGuardDialogOpen: Dispatch<SetStateAction<boolean>>;

  // Refs
  isInputFocusedRef: RefObject<boolean>;
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
  inspectUltilityBarRef: RefObject<InspectUltilityBarRef | null>;
  navigationButtonsContainerRef: RefObject<HTMLDivElement | null>;
  questionInspectMainContentRef: RefObject<QuestionInspectMainContentRef | null>;
  sideBarInspectRef: RefObject<InspectSidebarRef | null>;
  isCoolDownRef: RefObject<boolean>;

  // Actions
  calculateTabThatQuestionResidesIn: (questionId: string) => number;
  resetScrollPositions: () => void;
}

const InspectContext = createContext<InspectContextType | null>(null);

export const useInspectContext = () => {
  const context = useContext(InspectContext);
  if (!context) {
    throw new Error("useInspectContext must be used within an InspectProvider");
  }
  return context;
};

export const InspectProvider = InspectContext.Provider;
