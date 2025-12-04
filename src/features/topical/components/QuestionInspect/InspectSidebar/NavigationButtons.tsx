import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { memo } from "react";

const NavigationButtons = memo(
  ({
    handleNextQuestion,
    handlePreviousQuestion,
    isHandleNextQuestionDisabled,
    isHandlePreviousQuestionDisabled,
  }: {
    handleNextQuestion: () => void;
    handlePreviousQuestion: () => void;
    isHandleNextQuestionDisabled: boolean;
    isHandlePreviousQuestionDisabled: boolean;
  }) => {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          className="w-9 rounded-sm cursor-pointer"
          onClick={handleNextQuestion}
          disabled={isHandleNextQuestionDisabled}
          title="Next question"
        >
          <ChevronDown />
        </Button>
        <Button
          variant="outline"
          className="w-9 rounded-sm cursor-pointer"
          onClick={handlePreviousQuestion}
          disabled={isHandlePreviousQuestionDisabled}
          title="Previous question"
        >
          <ChevronUp />
        </Button>
      </div>
    );
  }
);

NavigationButtons.displayName = "NavigationButtons";

export default NavigationButtons;
