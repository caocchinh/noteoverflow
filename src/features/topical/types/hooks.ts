import { Virtualizer } from "@tanstack/react-virtual";
import { Dispatch, SetStateAction } from "react";
import { IsHavingUnsafeChangesRef } from "./components";
import { SelectedQuestion } from "./models";

export interface UseInspectNavigationProps {
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  currentTabThatContainsQuestion: number;
  currentQuestionIndex: number;
  currentQuestionId: string | undefined;
  setCurrentQuestionId: Dispatch<SetStateAction<string | undefined>>;
  searchInput: string;
  searchResults: SelectedQuestion[];
  isHavingUnsafeChangesRef: IsHavingUnsafeChangesRef;
  setIsAnnotationGuardDialogOpen: Dispatch<SetStateAction<boolean>>;
  isAnnotationGuardDialogOpen: boolean;
  scrollToQuestion: (params: { questionId: string; tab: number }) => void;
  searchVirtualizer: Virtualizer<HTMLDivElement, Element>;
  listScrollAreaRef: React.RefObject<HTMLDivElement | null>;
  isVirtualizationReady: boolean;
  calculateTabThatQuestionResidesIn: (questionId: string) => number;
  setCurrentTab: Dispatch<SetStateAction<number>>;
}
