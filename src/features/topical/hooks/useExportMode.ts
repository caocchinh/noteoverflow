import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

interface UseExportModeProps {
  isExportModeEnabled: boolean;
  setIsExportModeEnabled: Dispatch<SetStateAction<boolean>>;
  allQuestions: { id: string }[];
}

export const useExportMode = ({ isExportModeEnabled, allQuestions }: UseExportModeProps) => {
  const { isAppSidebarOpen, setIsAppSidebarOpen } = useTopicalApp();

  const [questionsForExport, setQuestionsForExport] = useState<Set<string>>(new Set());
  const [questionsForExportArray, setQuestionsForExportArray] = useState<string[]>([]);
  const questionsForExportRef = useRef(questionsForExport);
  questionsForExportRef.current = questionsForExport;

  const previousSidebarOpenRef = useRef(isAppSidebarOpen);

  useEffect(() => {
    if (isExportModeEnabled) {
      previousSidebarOpenRef.current = isAppSidebarOpen;
      setIsAppSidebarOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExportModeEnabled, setIsAppSidebarOpen]);

  useEffect(() => {
    if (!isExportModeEnabled) {
      setIsAppSidebarOpen(previousSidebarOpenRef.current);
    }
  }, [isExportModeEnabled, setIsAppSidebarOpen]);

  const toggleQuestionSelection = useCallback((questionId: string) => {
    setQuestionsForExport((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
    setQuestionsForExportArray((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  }, []);

  const useAllQuestions = useCallback(() => {
    const ids = allQuestions.map((question) => question.id);
    setQuestionsForExport(new Set(ids));
    setQuestionsForExportArray(ids);
  }, [allQuestions]);

  const useNoQuestions = useCallback(() => {
    setQuestionsForExport(new Set());
    setQuestionsForExportArray([]);
  }, []);

  return {
    questionsForExport,
    setQuestionsForExport,
    questionsForExportArray,
    setQuestionsForExportArray,
    questionsForExportRef,
    toggleQuestionSelection,
    useAllQuestions,
    useNoQuestions,
  };
};
