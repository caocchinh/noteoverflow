import { CSSProperties, Dispatch, memo, SetStateAction } from "react";
import { SelectedQuestion } from "../../constants/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Grip } from "lucide-react";
import QuestionItem from "./QuestionItem";
import { useIsMobile } from "@/hooks/use-mobile";

export interface OrderableQuestionItemProps {
  question: SelectedQuestion;
  isSelected: boolean;
  onToggle: () => void;
  isDragOverlay?: boolean;
  index?: number;
  currentlyPreviewQuestion: string | null;
  setCurrentlyPreviewQuestion: Dispatch<SetStateAction<string | null>>;
  setIsMobilePreviewOpen: Dispatch<SetStateAction<boolean>>;
}

const OrderableQuestionItem = memo(
  ({
    question,
    isSelected,
    onToggle,
    setCurrentlyPreviewQuestion,
    setIsMobilePreviewOpen,
    index,
    isDragOverlay = false,
    currentlyPreviewQuestion,
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
    const mobileBreakpoint = useIsMobile({ breakpoint: 440 });

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
          "cursor-grab flex flex-row gap-1 items-center justify-center active:cursor-grabbing p-1 -ml-1 mr-2 rounded hover:bg-foreground/10 touch-none",
          isSelected && "hover:bg-white/20",
          isDragOverlay && "cursor-grabbing"
        )}
        {...attributes}
        {...listeners}
      >
        {index !== undefined && <span> {index + 1}. </span>}
        <div className="flex flex-row gap-0 items-center justify-center">
          <Grip className="h-4 w-4 opacity-50" />
          <Grip
            className={cn(
              "h-4 w-4 ml-[-2px] opacity-50",
              mobileBreakpoint && "hidden!"
            )}
          />
        </div>
      </div>
    );

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn("list-none", isDragOverlay && "")}
      >
        <QuestionItem
          question={question}
          currentlyPreviewQuestion={currentlyPreviewQuestion}
          isSelected={isSelected}
          onToggle={onToggle}
          setIsMobilePreviewOpen={setIsMobilePreviewOpen}
          setCurrentlyPreviewQuestion={setCurrentlyPreviewQuestion}
          dragHandle={dragHandle}
        />
      </div>
    );
  }
);

OrderableQuestionItem.displayName = "OrderableQuestionItem";

export default OrderableQuestionItem;
