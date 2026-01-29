import { useState, useMemo } from "react";
import {
  extractPaperCode,
  extractQuestionNumber,
  fuzzySearch,
} from "../../../lib/utils";
import { SelectedQuestion } from "../../../types/models";

export const useInspectSearch = (allQuestions: SelectedQuestion[]) => {
  const [searchInput, setSearchInput] = useState("");

  const searchResults = useMemo(() => {
    return searchInput.length > 0
      ? allQuestions.filter((question) => {
          const searchableText = `${extractPaperCode({
            questionId: question.id,
          })} Q${extractQuestionNumber({ questionId: question.id })}`;
          return fuzzySearch(searchInput, searchableText);
        })
      : [];
  }, [searchInput, allQuestions]);

  return { searchInput, setSearchInput, searchResults };
};
