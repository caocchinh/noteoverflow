import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMutationState } from "@tanstack/react-query";
import { CheckCircle2, Eye, X } from "lucide-react";
import { Dispatch, memo, ReactNode, SetStateAction, useMemo } from "react";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { extractPaperCode, extractQuestionNumber } from "../../lib/utils";
import { SelectedQuestion } from "../../types/models";

export interface QuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
  dragHandle?: ReactNode;
  setIsMobilePreviewOpen: Dispatch<SetStateAction<boolean>>;
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
    setIsMobilePreviewOpen,
    onToggle,
    dragHandle,
    className,
  }: QuestionItemProps) => {
    const { finishedQuestionsData: userFinishedQuestions } = useTopicalApp();

    const isThisFinishedQuestionSettled = useMutationState({
      filters: {
        mutationKey: ["user_saved_activities", "finished_questions", question.id],
        predicate: (mutation) =>
          mutation.state.status === "success" || mutation.state.status === "error",
      },
    });

    const isThisQuestionFinished = useMemo(
      () => userFinishedQuestions?.some((item) => item.question.id === question?.id) ?? false,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [userFinishedQuestions, question?.id, isThisFinishedQuestionSettled],
    );

    return (
      <div
        className={cn(
          "border-border/50 relative flex cursor-pointer items-center justify-between rounded-sm border-b p-2",
          className,
          currentlyPreviewQuestion === question.id && "bg-logo-main! text-white!",
          isThisQuestionFinished
            ? "bg-green-600 text-white hover:bg-green-600 dark:hover:bg-green-600"
            : "dark:bg-accent bg-white hover:bg-[#e6e6e6] hover:dark:bg-[#3b3b3b]",
        )}
        onClick={() => setCurrentlyPreviewQuestion(question.id)}
      >
        {dragHandle}
        <div className="flex flex-1 items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium">
              {extractPaperCode({ questionId: question.id })} Q
              {extractQuestionNumber({ questionId: question.id })}
            </p>
            <p className="text-xs">
              {question.season} {question.year} • Paper {question.paperType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentlyPreviewQuestion(question.id);
              setIsMobilePreviewOpen(true);
            }}
            className="group flex h-7 w-max shrink-0 cursor-pointer items-center justify-center gap-2 rounded border-2 border-black bg-white! p-1 transition-all duration-200 lg:hidden"
          >
            <Eye />
            <span className="hidden sm:block">Preview</span>
          </Button>
          <Button
            className="group flex h-7 w-max shrink-0 cursor-pointer items-center justify-center gap-2 rounded border-2 border-black bg-white! p-1 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="text-logo-main h-3.5 w-3.5 group-hover:hidden" />
                <X className="hidden h-3.5 w-3.5 text-red-500 group-hover:block" />
                <span className="hidden text-xs text-black group-hover:hidden sm:block">
                  Selected
                </span>
                <span className="hidden text-xs text-black group-hover:hidden sm:group-hover:block">
                  Deselect
                </span>
              </>
            ) : (
              <>
                <span className="px-2 text-xs text-black">Select</span>
              </>
            )}
          </Button>
        </div>
      </div>
    );
  },
);

QuestionItem.displayName = "QuestionItem";

export default QuestionItem;
