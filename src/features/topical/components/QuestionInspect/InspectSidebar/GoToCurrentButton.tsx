import { Button } from "@/components/ui/button";
import { SelectedQuestion } from "@/features/topical/constants/types";
import { FastForward } from "lucide-react";
import { memo } from "react";

const GoToCurrentButton = memo(
  ({
    searchInput,
    currentTabThatContainsQuestion,
    setCurrentTab,
    currentQuestionId,
    scrollToQuestion,
    searchResults,
    searchVirtualizer,
  }: {
    searchInput: string;
    currentTabThatContainsQuestion: number;
    setCurrentTab: (tab: number) => void;
    currentQuestionId?: string;
    scrollToQuestion: ({
      questionId,
      tab,
    }: {
      questionId: string;
      tab: number;
    }) => void;
    searchResults: SelectedQuestion[];
    searchVirtualizer: {
      scrollToIndex: (index: number) => void;
    };
  }) => {
    return (
      <Button
        variant="default"
        className="cursor-pointer rounded-[3px] flex items-center justify-center gap-1"
        title="Go to current question"
        onClick={() => {
          if (searchInput === "") {
            setCurrentTab(currentTabThatContainsQuestion);
            if (currentQuestionId) {
              setTimeout(() => {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }, 0);
            }
          } else {
            const currentQuestionIndexInSearchResult = searchResults.findIndex(
              (question) => question.id === currentQuestionId
            );
            if (currentQuestionIndexInSearchResult === -1) {
              return;
            }
            setTimeout(() => {
              searchVirtualizer.scrollToIndex(
                currentQuestionIndexInSearchResult
              );
            }, 0);
          }
        }}
      >
        <FastForward />
        Current
      </Button>
    );
  }
);

GoToCurrentButton.displayName = "GoToCurrentButton";

export default GoToCurrentButton;
