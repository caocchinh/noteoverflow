import { CSSProperties, memo } from "react";
import { SelectedQuestion } from "../../constants/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";
import QuestionItem from "./QuestionItem";

export interface OrderableQuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
  isDragOverlay?: boolean;
}

const OrderableQuestionItem = memo(
  ({
    question,
    isSelected,
    onToggle,
    isDragOverlay = false,
  }: OrderableQuestionItemProps) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: question.id,
      disabled: isDragOverlay,
    });

    const style: CSSProperties = isDragOverlay
      ? {
          cursor: "grabbing",
        }
      : {
          transform: CSS.Transform.toString(transform),
          transition,
          // Hide original item while dragging - DragOverlay will show the visible copy
          opacity: isDragging ? 0 : 1,
        };

    const dragHandle = (
      <div
        className={cn(
          "cursor-grab active:cursor-grabbing p-1 -ml-1 mr-2 rounded hover:bg-foreground/10 touch-none",
          isSelected && "hover:bg-white/20",
          isDragOverlay && "cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        <Grip className="h-4 w-4 opacity-50" />
      </div>
    );

    return (
      <div ref={setNodeRef} style={style} className="list-none">
        <QuestionItem
          question={question}
          isSelected={isSelected}
          onToggle={onToggle}
          dragHandle={dragHandle}
        />
      </div>
    );
  }
);

OrderableQuestionItem.displayName = "OrderableQuestionItem";

export default OrderableQuestionItem;
