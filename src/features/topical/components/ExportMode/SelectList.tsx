import { ScrollArea } from "@/components/ui/scroll-area";
import OrderableQuestionItem from "./OrderableQuestionItem";
import QuestionItem from "./QuestionItem";
import { Reorder } from "motion/react";
import { Search } from "lucide-react";
import { ExportSelectListProps } from "../../constants/types";
import { memo } from "react";

const SelectList = memo(
  ({
    canReorder,
    questionsForExportArray,
    setQuestionsForExportArray,
    unselectedQuestions,
    toggleQuestion,
    allQuestions,
    questionsForExport,
  }: ExportSelectListProps) => {
    return (
      <ScrollArea className="h-[60dvh] pr-4" type="always">
        {canReorder ? (
          <Reorder.Group
            axis="y"
            className="flex flex-col gap-3"
            values={questionsForExportArray}
            onReorder={setQuestionsForExportArray}
          >
            {questionsForExportArray.map((questionId) => (
              <OrderableQuestionItem
                key={questionId}
                question={allQuestions.find((q) => q.id === questionId)!}
                isSelected={questionsForExport.has(questionId)}
                onToggle={() => toggleQuestion(questionId)}
              />
            ))}
          </Reorder.Group>
        ) : (
          <div className="space-y-0">
            {unselectedQuestions.map((question) => (
              <QuestionItem
                key={question.id}
                question={question}
                isSelected={questionsForExport.has(question.id)}
                onToggle={() => toggleQuestion(question.id)}
              />
            ))}
          </div>
        )}

        {unselectedQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No questions found</p>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </ScrollArea>
    );
  }
);

SelectList.displayName = "SelectList";

export default SelectList;
