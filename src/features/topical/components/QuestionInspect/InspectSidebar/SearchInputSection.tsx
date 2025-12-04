import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { memo, RefObject } from "react";

const SearchInputSection = memo(
  ({
    searchInput,
    setSearchInput,
    isInputFocusedRef,
    currentQuestionId,
    currentTabThatContainsQuestion,
    setCurrentTab,
    scrollToQuestion,
    listScrollAreaRef,
  }: {
    searchInput: string;
    setSearchInput: (value: string) => void;
    isInputFocusedRef: RefObject<boolean>;
    currentQuestionId?: string;
    currentTabThatContainsQuestion: number;
    setCurrentTab: (tab: number) => void;
    scrollToQuestion: ({
      questionId,
      tab,
    }: {
      questionId: string;
      tab: number;
    }) => void;
    listScrollAreaRef: RefObject<HTMLDivElement | null>;
  }) => {
    return (
      <div className="flex items-center gap-2 border-b border-border">
        <Search />
        <Input
          onFocus={() => {
            isInputFocusedRef.current = true;
          }}
          onBlur={() => {
            isInputFocusedRef.current = false;
          }}
          className="border-none focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-accent placeholder:text-sm"
          placeholder="Search questions"
          value={searchInput}
          tabIndex={-1}
          onChange={(e) => {
            if (searchInput == "") {
              listScrollAreaRef.current?.scrollTo({
                top: 0,
              });
            }
            setSearchInput(e.target.value);
            if (e.target.value.length === 0 && currentQuestionId) {
              setCurrentTab(currentTabThatContainsQuestion);
              setTimeout(() => {
                scrollToQuestion({
                  questionId: currentQuestionId,
                  tab: currentTabThatContainsQuestion,
                });
              }, 0);
            }
          }}
        />
        {searchInput.length > 0 && (
          <X
            className="text-red-600 hover:text-red-600/80 cursor-pointer"
            onClick={() => {
              setSearchInput("");
              setCurrentTab(currentTabThatContainsQuestion);
              if (currentQuestionId) {
                setTimeout(() => {
                  scrollToQuestion({
                    questionId: currentQuestionId,
                    tab: currentTabThatContainsQuestion,
                  });
                }, 0);
              }
            }}
          />
        )}
      </div>
    );
  }
);

SearchInputSection.displayName = "SearchInputSection";

export default SearchInputSection;
