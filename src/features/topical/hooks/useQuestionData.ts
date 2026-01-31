import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useMutationState } from "@tanstack/react-query";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import {
  INFINITE_SCROLL_CHUNK_SIZE,
  DEFAULT_SORT_OPTIONS,
} from "@/features/topical/constants/constants";
import { isSubset, chunkQuestionsData } from "@/features/topical/lib/utils";
import {
  SelectedQuestion,
  SortParameters,
  CurrentQuery,
} from "../types/models";

interface UseQuestionDataProps {
  topicalData: { data: SelectedQuestion[] } | undefined;
  currentQuery: CurrentQuery;
}

export const useQuestionData = ({
  topicalData,
  currentQuery,
}: UseQuestionDataProps) => {
  const { uiPreferences, finishedQuestionsData } = useTopicalApp();

  const [showFinishedQuestion, setShowFinishedQuestion] = useState(true);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [infiniteScrollLoadedChunks, setInfiniteScrollLoadedChunks] =
    useState(1);
  const [sortParameters, setSortParameters] = useState<SortParameters>({
    sortBy: DEFAULT_SORT_OPTIONS,
  });

  const mainContentScrollAreaRef = useRef<HTMLDivElement | null>(null);

  const doesSearchYieldAnyQuestions = (topicalData?.data?.length ?? 0) > 0;

  const onSettledFinishedQuestion = useMutationState({
    filters: {
      mutationKey: ["user_saved_activities", "finished_questions"],
      predicate: (mutation) =>
        (mutation.state.status === "success" ||
          mutation.state.status === "error") &&
        !showFinishedQuestion,
    },
  });

  const sortedData = useMemo(() => {
    if (!topicalData?.data) return [];
    return topicalData.data.toSorted(
      (a: SelectedQuestion, b: SelectedQuestion) => {
        if (sortParameters.sortBy === "ascending") {
          return a.year - b.year;
        } else {
          // Default to year-desc
          return b.year - a.year;
        }
      },
    );
  }, [sortParameters.sortBy, topicalData]);

  const chunkedData = useMemo(() => {
    if (!sortedData) return undefined;

    const chunkSize =
      uiPreferences.layoutStyle === "pagination"
        ? uiPreferences.numberOfQuestionsPerPage
        : INFINITE_SCROLL_CHUNK_SIZE;

    return chunkQuestionsData(sortedData, chunkSize) ?? undefined;
  }, [
    sortedData,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
  ]);

  const filteredProcessedData = useMemo(() => {
    const chunkSize =
      uiPreferences.layoutStyle === "pagination"
        ? uiPreferences.numberOfQuestionsPerPage
        : INFINITE_SCROLL_CHUNK_SIZE;

    const filteredStrictModeData = uiPreferences.isStrictModeEnabled
      ? sortedData.filter((item) => {
          return isSubset(item.topics, currentQuery.topic);
        })
      : sortedData;

    const filteredFinishedData = filteredStrictModeData.filter((question) => {
      if (!finishedQuestionsData) return true;
      if (
        !showFinishedQuestion &&
        finishedQuestionsData.some((item) => item.question.id === question.id)
      ) {
        return false;
      }
      return true;
    });

    const chunkData =
      chunkQuestionsData(filteredFinishedData, chunkSize) ?? undefined;

    return {
      chunkData,
      filteredFinishedData,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    onSettledFinishedQuestion,
    uiPreferences.layoutStyle,
    uiPreferences.numberOfQuestionsPerPage,
    uiPreferences.isStrictModeEnabled,
    sortedData,
    currentQuery.topic,
    finishedQuestionsData,
    showFinishedQuestion,
  ]);

  // Derived state (no useEffect needed)
  const fullPartitionedData = chunkedData;
  const finishedQuestionsFilteredPartitionedData =
    filteredProcessedData.chunkData;

  // Derive displayed data based on layout style
  const finishedQuestionsFilteredDisplayData = useMemo(() => {
    if (!finishedQuestionsFilteredPartitionedData) return [];

    if (uiPreferences.layoutStyle === "pagination") {
      // For pagination, show only current chunk
      return finishedQuestionsFilteredPartitionedData[currentChunkIndex] ?? [];
    } else {
      // For infinite scroll, show all chunks up to the loaded count
      return finishedQuestionsFilteredPartitionedData
        .slice(0, infiniteScrollLoadedChunks)
        .flat();
    }
  }, [
    finishedQuestionsFilteredPartitionedData,
    currentChunkIndex,
    infiniteScrollLoadedChunks,
    uiPreferences.layoutStyle,
  ]);

  const handleInfiniteScrollNext = useCallback(() => {
    if (finishedQuestionsFilteredPartitionedData) {
      setCurrentChunkIndex(currentChunkIndex + 1);
      setInfiniteScrollLoadedChunks((prev) => prev + 1);
    }
  }, [finishedQuestionsFilteredPartitionedData, currentChunkIndex]);

  useEffect(() => {
    setCurrentChunkIndex(0);
    setInfiniteScrollLoadedChunks(1);
    mainContentScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, [topicalData, currentQuery]);

  return {
    sortParameters,
    setSortParameters,
    showFinishedQuestion,
    setShowFinishedQuestion,
    currentChunkIndex,
    setCurrentChunkIndex,
    infiniteScrollLoadedChunks,
    setInfiniteScrollLoadedChunks,
    fullPartitionedData,
    finishedQuestionsFilteredPartitionedData,
    filteredProcessedData,
    doesSearchYieldAnyQuestions,
    finishedQuestionsFilteredDisplayData,
    handleInfiniteScrollNext,
    mainContentScrollAreaRef,
  };
};
