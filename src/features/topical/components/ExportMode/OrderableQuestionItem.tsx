import { memo } from "react";
import { SelectedQuestion } from "../../constants/types";
import { Reorder, useDragControls } from "motion/react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";
import QuestionItem from "./QuestionItem";

export interface OrderableQuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
}

const OrderableQuestionItem = memo(
  ({
    question,
    isSelected,
    onToggle,
    isExpanded,
    onExpandToggle,
  }: OrderableQuestionItemProps) => {
    const dragControls = useDragControls();

    const dragHandle = (
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
    );

    return (
      <Reorder.Item
        value={question}
        dragListener={false}
        dragControls={dragControls}
        className="list-none"
      >
        <QuestionItem
          question={question}
          isSelected={isSelected}
          onToggle={onToggle}
          isExpanded={isExpanded}
          onExpandToggle={onExpandToggle}
          dragHandle={dragHandle}
        />
      </Reorder.Item>
    );
  }
);

OrderableQuestionItem.displayName = "OrderableQuestionItem";

export default OrderableQuestionItem;
