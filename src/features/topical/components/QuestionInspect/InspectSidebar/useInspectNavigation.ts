import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  Dispatch,
  SetStateAction,
} from "react";
import { SelectedQuestion } from "../../../types/models";
import { IsHavingUnsafeChangesRef } from "../../../types/components";
import { Virtualizer } from "@tanstack/react-virtual";

interface UseInspectNavigationProps {
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

export const useInspectNavigation = ({
  partitionedTopicalData,
  currentTabThatContainsQuestion,
  currentQuestionIndex,
  currentQuestionId,
  setCurrentQuestionId,
  searchInput,
  searchResults,
  isHavingUnsafeChangesRef,
  setIsAnnotationGuardDialogOpen,
  isAnnotationGuardDialogOpen,
  scrollToQuestion,
  searchVirtualizer,
  listScrollAreaRef,
  isVirtualizationReady,
  calculateTabThatQuestionResidesIn,
  setCurrentTab,
}: UseInspectNavigationProps) => {
  const [pendingQuestionId, setPendingQuestionId] = useState<
    string | undefined
  >(undefined);
  const [pendingTab, setPendingTab] = useState<number | undefined>(undefined);
  const [willScrollToQuestionAfterGuard, setWillScrollToQuestionAfterGuard] =
    useState(false);

  const handleNextQuestion = useCallback(() => {
    if (
      partitionedTopicalData &&
      currentTabThatContainsQuestion > -1 &&
      partitionedTopicalData[currentTabThatContainsQuestion]
    ) {
      if (searchInput === "") {
        if (
          currentQuestionIndex <
          partitionedTopicalData[currentTabThatContainsQuestion].length - 1
        ) {
          const newQuestionId =
            partitionedTopicalData[currentTabThatContainsQuestion][
              currentQuestionIndex + 1
            ].id;
          if (
            isHavingUnsafeChangesRef.current?.["answer"] ||
            isHavingUnsafeChangesRef.current?.["question"]
          ) {
            setIsAnnotationGuardDialogOpen(true);
            setPendingQuestionId(newQuestionId);
            setPendingTab(currentTabThatContainsQuestion);
            setWillScrollToQuestionAfterGuard(true);
          } else {
            setCurrentQuestionId(newQuestionId);
            setCurrentTab(currentTabThatContainsQuestion);
            scrollToQuestion({
              questionId: newQuestionId,
              tab: currentTabThatContainsQuestion,
            });
          }
        } else {
          if (
            currentTabThatContainsQuestion <
            partitionedTopicalData.length - 1
          ) {
            const newQuestionId =
              partitionedTopicalData[currentTabThatContainsQuestion + 1][0].id;
            if (
              isHavingUnsafeChangesRef.current?.["answer"] ||
              isHavingUnsafeChangesRef.current?.["question"]
            ) {
              setIsAnnotationGuardDialogOpen(true);
              setPendingQuestionId(newQuestionId);
              setPendingTab(currentTabThatContainsQuestion + 1);
              setWillScrollToQuestionAfterGuard(true);
            } else {
              setCurrentTab(currentTabThatContainsQuestion + 1);
              setCurrentQuestionId(newQuestionId);
              listScrollAreaRef.current?.scrollTo({
                top: 0,
                behavior: "instant",
              });
            }
          }
        }
      } else {
        const currentQuestionIndexInSearchResult = searchResults.findIndex(
          (question) => question.id === currentQuestionId,
        );
        if (currentQuestionIndexInSearchResult === -1) {
          return;
        }
        if (currentQuestionIndexInSearchResult < searchResults.length - 1) {
          const newQuestionId =
            searchResults[currentQuestionIndexInSearchResult + 1].id;

          if (
            isHavingUnsafeChangesRef.current?.["answer"] ||
            isHavingUnsafeChangesRef.current?.["question"]
          ) {
            setIsAnnotationGuardDialogOpen(true);
            setPendingQuestionId(newQuestionId);
            setWillScrollToQuestionAfterGuard(true);
          } else {
            setCurrentQuestionId(newQuestionId);
            searchVirtualizer.scrollToIndex(
              currentQuestionIndexInSearchResult + 1,
            );
          }
        }
      }
    }
  }, [
    currentQuestionId,
    currentQuestionIndex,
    currentTabThatContainsQuestion,
    isHavingUnsafeChangesRef,
    partitionedTopicalData,
    scrollToQuestion,
    searchInput,
    searchResults,
    searchVirtualizer,
    setCurrentQuestionId,
    setIsAnnotationGuardDialogOpen,
    listScrollAreaRef,
    setCurrentTab,
  ]);

  const handlePreviousQuestion = useCallback(() => {
    if (partitionedTopicalData) {
      if (searchInput === "") {
        if (currentQuestionIndex > 0) {
          const newQuestionId =
            partitionedTopicalData[currentTabThatContainsQuestion][
              currentQuestionIndex - 1
            ].id;
          if (
            isHavingUnsafeChangesRef.current?.["answer"] ||
            isHavingUnsafeChangesRef.current?.["question"]
          ) {
            setIsAnnotationGuardDialogOpen(true);
            setPendingQuestionId(newQuestionId);
            setPendingTab(currentTabThatContainsQuestion);
            setWillScrollToQuestionAfterGuard(true);
          } else {
            setCurrentQuestionId(newQuestionId);
            setCurrentTab(currentTabThatContainsQuestion);
            scrollToQuestion({
              questionId: newQuestionId,
              tab: currentTabThatContainsQuestion,
            });
          }
        } else {
          if (currentTabThatContainsQuestion > 0) {
            const newQuestionId =
              partitionedTopicalData[currentTabThatContainsQuestion - 1][
                partitionedTopicalData[currentTabThatContainsQuestion - 1]
                  .length - 1
              ].id;
            if (
              isHavingUnsafeChangesRef.current?.["answer"] ||
              isHavingUnsafeChangesRef.current?.["question"]
            ) {
              setIsAnnotationGuardDialogOpen(true);
              setPendingQuestionId(newQuestionId);
              setPendingTab(currentTabThatContainsQuestion - 1);
              setWillScrollToQuestionAfterGuard(true);
            } else {
              setCurrentTab(currentTabThatContainsQuestion - 1);
              setCurrentQuestionId(newQuestionId);
              setTimeout(() => {
                scrollToQuestion({
                  questionId: newQuestionId,
                  tab: currentTabThatContainsQuestion - 1,
                });
              }, 0);
            }
          }
        }
      } else {
        const currentQuestionIndexInSearchResult = searchResults.findIndex(
          (question) => question.id === currentQuestionId,
        );
        if (currentQuestionIndexInSearchResult === -1) {
          return;
        }
        if (currentQuestionIndexInSearchResult > 0) {
          const newQuestionId =
            searchResults[currentQuestionIndexInSearchResult - 1].id;

          if (
            isHavingUnsafeChangesRef.current?.["answer"] ||
            isHavingUnsafeChangesRef.current?.["question"]
          ) {
            setIsAnnotationGuardDialogOpen(true);
            setPendingQuestionId(newQuestionId);
            setWillScrollToQuestionAfterGuard(true);
          } else {
            setCurrentQuestionId(newQuestionId);
            searchVirtualizer.scrollToIndex(
              currentQuestionIndexInSearchResult - 1,
            );
          }
        }
      }
    }
  }, [
    currentQuestionId,
    currentQuestionIndex,
    currentTabThatContainsQuestion,
    isHavingUnsafeChangesRef,
    partitionedTopicalData,
    scrollToQuestion,
    searchInput,
    searchResults,
    searchVirtualizer,
    setCurrentQuestionId,
    setIsAnnotationGuardDialogOpen,
    setCurrentTab,
  ]);

  const navigateToQuestion = useCallback(
    ({
      questionId,
      scroll = true,
      showAnnotationGuard = true,
    }: {
      questionId: string;
      scroll?: boolean;
      showAnnotationGuard?: boolean;
    }) => {
      const tab = calculateTabThatQuestionResidesIn(questionId);

      if (
        showAnnotationGuard &&
        (isHavingUnsafeChangesRef.current?.["answer"] ||
          isHavingUnsafeChangesRef.current?.["question"])
      ) {
        setIsAnnotationGuardDialogOpen(true);
        setPendingQuestionId(questionId);
        setPendingTab(tab);
        setWillScrollToQuestionAfterGuard(true);
        return;
      }
      setCurrentTab(tab);
      setCurrentQuestionId(questionId);

      if (isVirtualizationReady && scroll) {
        scrollToQuestion({ questionId, tab });
      }
    },
    [
      calculateTabThatQuestionResidesIn,
      isHavingUnsafeChangesRef,
      setCurrentQuestionId,
      isVirtualizationReady,
      setIsAnnotationGuardDialogOpen,
      scrollToQuestion,
      setCurrentTab,
    ],
  );

  const isHandleNextQuestionDisabled = useMemo(() => {
    if (
      !partitionedTopicalData ||
      currentTabThatContainsQuestion < 0 ||
      !partitionedTopicalData[currentTabThatContainsQuestion]
    ) {
      return true;
    }
    if (searchInput === "") {
      return (
        currentQuestionIndex ===
          partitionedTopicalData[currentTabThatContainsQuestion].length - 1 &&
        currentTabThatContainsQuestion === partitionedTopicalData.length - 1
      );
    } else {
      const currentQuestionIndexInSearchResult = searchResults.findIndex(
        (question) => question.id === currentQuestionId,
      );
      if (currentQuestionIndexInSearchResult === -1) {
        return true;
      }
      if (currentQuestionIndexInSearchResult === searchResults.length - 1) {
        return true;
      }
    }
    return false;
  }, [
    partitionedTopicalData,
    searchInput,
    currentQuestionIndex,
    currentTabThatContainsQuestion,
    searchResults,
    currentQuestionId,
  ]);
  const isHandlePreviousQuestionDisabled = useMemo(() => {
    if (
      !partitionedTopicalData ||
      currentTabThatContainsQuestion < 0 ||
      !partitionedTopicalData[currentTabThatContainsQuestion]
    ) {
      return true;
    }
    if (searchInput === "") {
      return currentQuestionIndex === 0 && currentTabThatContainsQuestion === 0;
    } else {
      const currentQuestionIndexInSearchResult = searchResults.findIndex(
        (question) => question.id === currentQuestionId,
      );
      if (currentQuestionIndexInSearchResult === -1) {
        return true;
      }
      if (currentQuestionIndexInSearchResult === 0) {
        return true;
      }
    }
    return false;
  }, [
    partitionedTopicalData,
    searchInput,
    currentQuestionIndex,
    currentTabThatContainsQuestion,
    searchResults,
    currentQuestionId,
  ]);

  useEffect(() => {
    if (
      !isAnnotationGuardDialogOpen &&
      currentQuestionId &&
      pendingQuestionId &&
      pendingTab !== undefined
    ) {
      setCurrentQuestionId(pendingQuestionId);
      setCurrentTab(pendingTab);
      if (willScrollToQuestionAfterGuard) {
        scrollToQuestion({
          questionId: pendingQuestionId,
          tab: pendingTab,
        });
      }
      setWillScrollToQuestionAfterGuard(false);
      setPendingQuestionId(undefined);
      setPendingTab(undefined);
    }
  }, [
    currentQuestionId,
    isAnnotationGuardDialogOpen,
    pendingQuestionId,
    pendingTab,
    scrollToQuestion,
    setCurrentQuestionId,
    willScrollToQuestionAfterGuard,
    setCurrentTab,
  ]);

  return {
    handleNextQuestion,
    handlePreviousQuestion,
    navigateToQuestion,
    isHandleNextQuestionDisabled,
    isHandlePreviousQuestionDisabled,
  };
};
