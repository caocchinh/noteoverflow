import { memo, RefObject, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { SelectedQuestion } from "../../constants/types";
import { JumpToTabButton } from "../JumpToTabButton";

interface TabNavigationButtonsProps {
  currentTab: number;
  setCurrentTab: (tab: number) => void;
  partitionedTopicalData: SelectedQuestion[][] | undefined;
  currentTabThatContainsQuestion: number;
  currentQuestionId: string | undefined;
  scrollToQuestion: ({
    questionId,
    tab,
  }: {
    questionId: string;
    tab: number;
  }) => void;
  listScrollAreaRef: RefObject<HTMLDivElement | null>;
}

const TabNavigationButtons = memo<TabNavigationButtonsProps>(
  ({
    currentTab,
    setCurrentTab,
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionId,
    scrollToQuestion,
    listScrollAreaRef,
  }) => {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            title="Jump to first tab"
            disabled={currentTab === 0}
            onClick={() => {
              setCurrentTab(0);
              if (currentTabThatContainsQuestion == 0 && currentQuestionId) {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: 0,
                });
              } else {
                listScrollAreaRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }
            }}
            variant="outline"
            className="w-9 h-9 cursor-pointer rounded-[2px]"
          >
            <ChevronsLeft />
          </Button>
          <Button
            title="Jump to previous tab"
            disabled={currentTab === 0}
            onClick={() => {
              if (
                currentTab > 0 &&
                currentTab < (partitionedTopicalData?.length ?? 0)
              ) {
                setCurrentTab(currentTab - 1);
              }
              if (
                currentTabThatContainsQuestion == currentTab - 1 &&
                currentQuestionId
              ) {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTab - 1,
                });
              } else {
                listScrollAreaRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }
            }}
            variant="outline"
            className="w-9 h-9 cursor-pointer rounded-[2px]"
          >
            <ChevronLeft />
          </Button>
        </div>
        <JumpToTabButton
          tab={currentTab}
          onTabChangeCallback={useCallback(
            ({ tab }) => {
              setCurrentTab(tab);
              listScrollAreaRef.current?.scrollTo({
                top: 0,
                behavior: "instant",
              });
            },
            [listScrollAreaRef, setCurrentTab]
          )}
          totalTabs={partitionedTopicalData?.length ?? 0}
        />
        <div className="flex items-center gap-2">
          <Button
            title="Jump to next tab"
            disabled={currentTab === (partitionedTopicalData?.length ?? 1) - 1}
            onClick={() => {
              if (currentTab < (partitionedTopicalData?.length ?? 0) - 1) {
                setCurrentTab(currentTab + 1);
              }
              if (
                currentTabThatContainsQuestion == currentTab + 1 &&
                currentQuestionId
              ) {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTab + 1,
                });
              } else {
                listScrollAreaRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }
            }}
            variant="outline"
            className="w-9 h-9 cursor-pointer rounded-[2px]"
          >
            <ChevronRight />
          </Button>
          <Button
            title="Jump to last tab"
            disabled={currentTab === (partitionedTopicalData?.length ?? 1) - 1}
            onClick={() => {
              setCurrentTab((partitionedTopicalData?.length ?? 1) - 1);
              if (
                currentTabThatContainsQuestion ==
                  (partitionedTopicalData?.length ?? 1) - 1 &&
                currentQuestionId
              ) {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: (partitionedTopicalData?.length ?? 1) - 1,
                });
              } else {
                listScrollAreaRef.current?.scrollTo({
                  top: 0,
                  behavior: "instant",
                });
              }
            }}
            variant="outline"
            className="w-9 h-9 cursor-pointer rounded-[2px]"
          >
            <ChevronsRight />
          </Button>
        </div>
      </>
    );
  }
);

TabNavigationButtons.displayName = "TabNavigationButtons";

export default TabNavigationButtons;
