import { memo } from "react";
import { SelectedQuestion } from "../../constants/types";
import {
  AnimatePresence,
  motion,
  Reorder,
  useDragControls,
} from "motion/react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GripVertical,
} from "lucide-react";
import { extractPaperCode, extractQuestionNumber } from "../../lib/utils";
import { Button } from "@/components/ui/button";

const QuestionItem = memo(
  ({
    question,
    isSelected,
    onToggle,
    isExpanded,
    onExpandToggle,
  }: {
    question: SelectedQuestion;
    isSelected: boolean;
    onToggle: () => void;
    isExpanded: boolean;
    onExpandToggle: () => void;
  }) => {
    const dragControls = useDragControls();

    return (
      <Reorder.Item
        value={question}
        dragListener={false}
        dragControls={dragControls}
        className={cn(
          "cursor-pointer relative p-2 rounded-sm flex items-center justify-between hover:bg-foreground/10 border-b border-border/50 list-none",
          isSelected && "bg-logo-main! text-white"
        )}
        onClick={onToggle}
      >
        {/* Drag handle */}
        <div
          className={cn(
            "cursor-grab active:cursor-grabbing p-1 -ml-1 mr-1 rounded hover:bg-foreground/10",
            isSelected && "hover:bg-white/20"
          )}
          onPointerDown={(e) => {
            e.stopPropagation();
            dragControls.start(e);
          }}
        >
          <GripVertical className="h-4 w-4 opacity-50" />
        </div>
        <div className="flex items-center gap-3 flex-1">
          {/* Checkbox indicator */}
          <div
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded border-2 transition-all duration-200 shrink-0",
              isSelected
                ? "border-white bg-white"
                : "border-muted-foreground/50 bg-background"
            )}
          >
            {isSelected && (
              <CheckCircle2 className="h-3.5 w-3.5 text-logo-main" />
            )}
          </div>

          {/* Question info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium">
              {extractPaperCode({ questionId: question.id })} Q
              {extractQuestionNumber({ questionId: question.id })}
            </p>
            <p
              className={cn(
                "text-xs",
                isSelected ? "text-white/80" : "text-muted-foreground"
              )}
            >
              {question.season} {question.year} • Paper {question.paperType}
            </p>
          </div>
        </div>

        {/* Expand button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7 shrink-0", isSelected && "hover:bg-white/20")}
          onClick={(e) => {
            e.stopPropagation();
            onExpandToggle();
          }}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>

        {/* Expandable preview */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full z-10 overflow-hidden bg-background border border-border rounded-b-sm shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Topics:</p>
                <div className="flex flex-wrap gap-1">
                  {question.topics?.map((topic) => (
                    <span
                      key={topic}
                      className="text-xs bg-muted px-2 py-0.5 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                {question.questionImages?.[0] && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={question.questionImages[0]}
                      alt="Question preview"
                      className="max-h-[200px] w-auto rounded border object-contain"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Reorder.Item>
    );
  }
);

QuestionItem.displayName = "QuestionItem";

export default QuestionItem;
