import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { Ref, RefObject, useCallback, useState } from "react";
import { SelectedQuestion } from "../../types/models";

interface InspectPanelProps {
  title: string;
  defaultSize: number;
  minSize: number;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  scrollAreaClassName?: string;
  initialHidden?: boolean;
  annotableContainerRef: Ref<HTMLDivElement>;
}

const InspectPanel = ({
  title,
  defaultSize,
  minSize,
  scrollAreaRef,
  scrollAreaClassName,
  initialHidden = false,
  annotableContainerRef,
}: InspectPanelProps) => {
  const [isHiding, setIsHiding] = useState(initialHidden);
  const isMobile = useIsMobile();

  return (
    <ResizablePanel defaultSize={defaultSize} minSize={minSize}>
      <div
        className="mt-2 mb-2 ml-3 flex w-max cursor-pointer flex-row flex-wrap items-center justify-start gap-1"
        title="Toggle visibility"
        onClick={useCallback(() => {
          setIsHiding(!isHiding);
        }, [isHiding])}
      >
        <p className="text-sm">{title}</p>
        {!isHiding ? <Eye strokeWidth={2} /> : <EyeClosed strokeWidth={2} />}
      </div>
      <ScrollArea
        className={cn(
          "[&_.bg-border]:bg-logo-main/25 h-[65dvh] w-full pt-0 pr-3 pb-5",
          isMobile && "h-full!",
          isHiding && "blur-sm",
          scrollAreaClassName,
        )}
        type="always"
        viewportRef={scrollAreaRef}
      >
        <div ref={annotableContainerRef}></div>
      </ScrollArea>
    </ResizablePanel>
  );
};

const BothViews = ({
  currentQuestionData,
  questionScrollAreaRef,
  answerScrollAreaRef,
  annotableQuestionContainerRef,
  annotableAnswerContainerRef,
}: {
  currentQuestionData: SelectedQuestion | undefined;
  questionScrollAreaRef: RefObject<HTMLDivElement | null>;
  answerScrollAreaRef: RefObject<HTMLDivElement | null>;
  annotableQuestionContainerRef: Ref<HTMLDivElement>;
  annotableAnswerContainerRef: Ref<HTMLDivElement>;
}) => {
  const isAnswerMultipleChoice = !currentQuestionData?.answers?.[0]?.includes("http");
  const isMobile = useIsMobile();

  return (
    <ResizablePanelGroup
      orientation={isMobile ? "vertical" : "horizontal"}
      className={cn("w-full rounded-lg border", isMobile ? "h-[65dvh]!" : "h-[70dvh]!")}
    >
      <InspectPanel
        key={`question-${currentQuestionData?.id}`}
        title="Question"
        defaultSize={isAnswerMultipleChoice ? 77 : 50}
        minSize={15}
        scrollAreaRef={questionScrollAreaRef}
        annotableContainerRef={annotableQuestionContainerRef}
      />
      <ResizableHandle withHandle className={cn(isMobile && "w-full")} />
      <InspectPanel
        key={`answer-${currentQuestionData?.id}`}
        title="Answer"
        defaultSize={isAnswerMultipleChoice ? 23 : 50}
        minSize={15}
        scrollAreaRef={answerScrollAreaRef}
        scrollAreaClassName="pl-3 pr-0"
        initialHidden={true}
        annotableContainerRef={annotableAnswerContainerRef}
      />
    </ResizablePanelGroup>
  );
};

export default BothViews;
