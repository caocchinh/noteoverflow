import { Dispatch, memo, ReactNode, SetStateAction, useMemo } from "react";
import { SelectedQuestion } from "../../constants/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, X } from "lucide-react";
import { extractPaperCode, extractQuestionNumber } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { useMutationState } from "@tanstack/react-query";

export interface QuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
  dragHandle?: ReactNode;
  currentlyPreviewQuestion: string | null;
  setCurrentlyPreviewQuestion: Dispatch<SetStateAction<string | null>>;
  className?: string;
}

const QuestionItem = memo(
  ({
    question,
    isSelected,
    currentlyPreviewQuestion,
    setCurrentlyPreviewQuestion,
    onToggle,
    dragHandle,
    className,
  }: QuestionItemProps) => {
    const { finishedQuestionsData: userFinishedQuestions } = useTopicalApp();

    const isThisFinishedQuestionSettled = useMutationState({
      filters: {
        mutationKey: [
          "user_saved_activities",
          "finished_questions",
          question.id,
        ],
        predicate: (mutation) =>
          mutation.state.status === "success" ||
          mutation.state.status === "error",
      },
    });

    const isThisQuestionFinished = useMemo(
      () =>
        userFinishedQuestions?.some(
          (item) => item.question.id === question?.id
        ) ?? false,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [userFinishedQuestions, question?.id, isThisFinishedQuestionSettled]
    );

    return (
      <div
        className={cn(
          "cursor-pointer relative p-2 rounded-sm flex items-center justify-between  border-b border-border/50",
          className,
          currentlyPreviewQuestion === question.id &&
            "bg-logo-main! text-white!",
          isThisQuestionFinished
            ? "bg-green-600 dark:hover:bg-green-600 hover:bg-green-600 text-white"
            : "hover:dark:bg-[#3b3b3b] bg-white dark:bg-accent hover:bg-[#e6e6e6]"
        )}
        onClick={() => setCurrentlyPreviewQuestion(question.id)}
      >
        {dragHandle}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {extractPaperCode({ questionId: question.id })} Q
              {extractQuestionNumber({ questionId: question.id })}
            </p>
            <p className="text-xs">
              {question.season} {question.year} • Paper {question.paperType}
            </p>
          </div>
        </div>

        <Button
          className="group flex h-7 p-1 w-max items-center justify-center rounded gap-2 border-2 transition-all duration-200 shrink-0 cursor-pointer border-black bg-white!"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isSelected ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-logo-main group-hover:hidden" />
              <X className="h-3.5 w-3.5 text-red-500 hidden group-hover:block" />
              <span className="text-xs text-black group-hover:hidden">
                Selected
              </span>
              <span className="text-xs text-black hidden group-hover:block">
                Deselect
              </span>
            </>
          ) : (
            <>
              <span className="text-xs text-black px-2">Select</span>
            </>
          )}
        </Button>
      </div>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

export default QuestionItem;
