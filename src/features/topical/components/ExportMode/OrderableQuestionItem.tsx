import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Grip } from "lucide-react";
import { CSSProperties, Dispatch, memo, SetStateAction } from "react";
import { SelectedQuestion } from "../../types/models";
import QuestionItem from "./QuestionItem";

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
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
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
          "hover:bg-foreground/10 mr-2 -ml-1 flex cursor-grab touch-none flex-row items-center justify-center gap-1 rounded p-1 active:cursor-grabbing",
          isSelected && "hover:bg-white/20",
          isDragOverlay && "cursor-grabbing",
        )}
        title="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        {index !== undefined && <span> {index + 1}. </span>}
        <div className="flex flex-row items-center justify-center gap-0">
          <Grip className="h-4 w-4 opacity-50" />
          <Grip className={cn("ml-[-2px] h-4 w-4 opacity-50", mobileBreakpoint && "hidden!")} />
        </div>
      </div>
    );

    return (
      <div ref={setNodeRef} style={style} className={cn("list-none", isDragOverlay && "")}>
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
  },
);

OrderableQuestionItem.displayName = "OrderableQuestionItem";

export default OrderableQuestionItem;
