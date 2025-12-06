import { ScrollArea } from "@/components/ui/scroll-area";
import QuestionItem from "./QuestionItem";
import { Search } from "lucide-react";
import { ExportSelectListProps } from "../../constants/types";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import type { Modifier } from "@dnd-kit/core";
import OrderableQuestionItem from "./OrderableQuestionItem";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const createAdjustOverlayOffset = (
  containerRef: React.RefObject<HTMLDivElement | null>
): Modifier => {
  return ({ transform, draggingNodeRect }) => {
    if (!containerRef.current || !draggingNodeRect) {
      return transform;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const xOffset = containerRect.left - draggingNodeRect.left;

    return {
      ...transform,
      x: xOffset,
    };
  };
};

const SelectList = memo(
  ({
    isOpen,
    canReorder,
    questionsForExportArray,
    setQuestionsForExportArray,
    filteredQuestions,
    toggleQuestion,
    currentlyPreviewQuestion,
    setCurrentlyPreviewQuestion,
    allQuestions,
    questionsForExport,
    setIsMobilePreviewOpen,
  }: ExportSelectListProps) => {
    const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const listScrollAreaRef = useRef<HTMLDivElement | null>(null);
    const isMobile = useIsMobile({ breakpoint: 886 });
    const secondMobileBreakPoint = useIsMobile({ breakpoint: 410 });
    const listVirtualizer = useVirtualizer({
      count: canReorder
        ? questionsForExportArray.length
        : filteredQuestions.length,
      getScrollElement: () => listScrollAreaRef.current,
      estimateSize: () => (secondMobileBreakPoint ? 100 : 65),
      enabled: isVirtualizationReady,
      getItemKey: (index) =>
        canReorder
          ? questionsForExportArray[index]
          : filteredQuestions[index]?.id,
    });
    const isMountedRef = useRef(false);

    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: {
          distance: 5,
        },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    const adjustOverlayOffset = useMemo(
      () => createAdjustOverlayOffset(listScrollAreaRef),
      []
    );

    useEffect(() => {
      if (isOpen) {
        setTimeout(() => {
          setIsVirtualizationReady(true);
          if (!isMountedRef.current) {
            isMountedRef.current = true;
          } else {
            return;
          }
          const predicate = canReorder
            ? questionsForExportArray
            : filteredQuestions.map((q) => q.id);
          const itemIndex =
            predicate.findIndex(
              (question) => question === currentlyPreviewQuestion
            ) ?? 0;

          if (itemIndex === -1) {
            return;
          }
          setTimeout(() => {
            listVirtualizer.scrollToIndex(itemIndex);
          }, 67);
        }, 0);
      } else {
        isMountedRef.current = false;
        setIsVirtualizationReady(false);
      }
    }, [
      canReorder,
      currentlyPreviewQuestion,
      filteredQuestions,
      isOpen,
      listVirtualizer,
      questionsForExportArray,
    ]);

    useEffect(() => {
      return () => {
        isMountedRef.current = false;
      };
    }, [canReorder]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
      setActiveId(event.active.id as string);
    }, []);

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active.id !== over.id) {
          const oldIndex = questionsForExportArray.indexOf(active.id as string);
          const newIndex = questionsForExportArray.indexOf(over.id as string);

          if (oldIndex !== -1 && newIndex !== -1) {
            const newArray = [...questionsForExportArray];
            newArray.splice(oldIndex, 1);
            newArray.splice(newIndex, 0, active.id as string);
            setQuestionsForExportArray(newArray);
          }
        }
      },
      [questionsForExportArray, setQuestionsForExportArray]
    );

    const handleDragCancel = useCallback(() => {
      setActiveId(null);
    }, []);

    const virtualItems = listVirtualizer.getVirtualItems();

    const activeQuestion = useMemo(() => {
      return activeId ? allQuestions.find((q) => q.id === activeId) : null;
    }, [activeId, allQuestions]);

    return (
      <ScrollArea
        className={cn(
          "flex-1 pr-4",
          isMobile ? "h-[49dvh]" : "h-[63dvh]",
          secondMobileBreakPoint && "h-[42dvh]!"
        )}
        type="always"
        viewportRef={listScrollAreaRef}
      >
        {canReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={handleDragCancel}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={questionsForExportArray}
              strategy={verticalListSortingStrategy}
            >
              <div
                style={{
                  height: `${listVirtualizer.getTotalSize()}px`,
                  width: "100%",
                  position: "relative",
                }}
              >
                {virtualItems.map((virtualItem) => {
                  const questionId = questionsForExportArray[virtualItem.index];
                  const question = allQuestions.find(
                    (q) => q.id === questionId
                  );
                  if (!question) return null;
                  return (
                    <div
                      key={questionId}
                      data-index={virtualItem.index}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        transform: `translateY(${virtualItem.start}px)`,
                      }}
                    >
                      <OrderableQuestionItem
                        index={virtualItem.index}
                        question={question}
                        setIsMobilePreviewOpen={setIsMobilePreviewOpen}
                        currentlyPreviewQuestion={currentlyPreviewQuestion}
                        isSelected={questionsForExport.has(questionId)}
                        onToggle={() => toggleQuestion(questionId)}
                        setCurrentlyPreviewQuestion={
                          setCurrentlyPreviewQuestion
                        }
                      />
                    </div>
                  );
                })}
              </div>
            </SortableContext>
            <DragOverlay
              modifiers={[adjustOverlayOffset, restrictToWindowEdges]}
            >
              {activeQuestion ? (
                <OrderableQuestionItem
                  question={activeQuestion}
                  currentlyPreviewQuestion={currentlyPreviewQuestion}
                  isSelected={questionsForExport.has(activeQuestion.id)}
                  onToggle={() => {}}
                  setIsMobilePreviewOpen={setIsMobilePreviewOpen}
                  isDragOverlay={true}
                  setCurrentlyPreviewQuestion={setCurrentlyPreviewQuestion}
                />
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div
            style={{
              height: `${listVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualItems.map((virtualItem) => {
              const question = filteredQuestions[virtualItem.index];
              return (
                <div
                  key={question.id}
                  data-index={virtualItem.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <QuestionItem
                    question={question}
                    currentlyPreviewQuestion={currentlyPreviewQuestion}
                    setIsMobilePreviewOpen={setIsMobilePreviewOpen}
                    isSelected={questionsForExport.has(question.id)}
                    setCurrentlyPreviewQuestion={setCurrentlyPreviewQuestion}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                </div>
              );
            })}
          </div>
        )}

        {filteredQuestions.length === 0 && (
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
