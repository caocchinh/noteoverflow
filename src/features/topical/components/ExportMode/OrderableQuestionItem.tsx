import { memo } from "react";
import { SelectedQuestion } from "../../constants/types";
import { Reorder, useDragControls } from "motion/react";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";
import QuestionItem from "./QuestionItem";

export interface OrderableQuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
}

const OrderableQuestionItem = memo(
  ({ question, isSelected, onToggle }: OrderableQuestionItemProps) => {
    const dragControls = useDragControls();

    const dragHandle = (
      <div
        className={cn(
          "cursor-grab active:cursor-grabbing p-1 -ml-1 mr-2 rounded hover:bg-foreground/10",
          isSelected && "hover:bg-white/20"
        )}
        onPointerDown={(e) => {
          e.stopPropagation();
          dragControls.start(e);
        }}
      >
        <Grip className="h-4 w-4 opacity-50" />
      </div>
    );

    return (
      <Reorder.Item
        value={question.id}
        dragListener={false}
        dragControls={dragControls}
        className="list-none"
      >
        <QuestionItem
          question={question}
          isSelected={isSelected}
          onToggle={onToggle}
          dragHandle={dragHandle}
        />
      </Reorder.Item>
    );
  }
);

OrderableQuestionItem.displayName = "OrderableQuestionItem";

export default OrderableQuestionItem;
