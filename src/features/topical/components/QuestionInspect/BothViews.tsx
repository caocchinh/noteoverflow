import { RefObject, useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SelectedQuestion } from "../../constants/types";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { useIsMobile } from "@/hooks/use-mobile";

const BothViews = ({
  currentQuestionData,
  questionScrollAreaRef,
  answerScrollAreaRef,
}: {
  currentQuestionData: SelectedQuestion | undefined;
  questionScrollAreaRef: RefObject<HTMLDivElement | null>;
  answerScrollAreaRef: RefObject<HTMLDivElement | null>;
}) => {
  const [isHidingAnswer, setIsHidingAnswer] = useState(true);
  const [isHidingQuestion, setIsHidingQuestion] = useState(false);
  const [key, setKey] = useState(0);
  const isAnswerMultipleChoice =
    !currentQuestionData?.answers?.[0]?.includes("http");
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsHidingAnswer(true);
    setIsHidingQuestion(false);
    setKey((prev) => prev + 1);
  }, [currentQuestionData]);

  return (
    <ResizablePanelGroup
      key={key}
      direction={isMobile ? "vertical" : "horizontal"}
      className={cn(
        "rounded-lg border w-full",
        isMobile ? "!h-[65dvh]" : "!h-[70dvh]"
      )}
    >
      <ResizablePanel
        defaultSize={isAnswerMultipleChoice ? 77 : 50}
        minSize={15}
      >
        <div
          className="ml-3 m-2 mb-3 flex flex-row gap-1 items-center justify-start flex-wrap cursor-pointer w-max"
          title="Toggle visibility"
          onClick={() => {
            setIsHidingQuestion(!isHidingQuestion);
          }}
        >
          <p className="text-sm">Question</p>
          {!isHidingQuestion ? (
            <Eye strokeWidth={2} />
          ) : (
            <EyeClosed strokeWidth={2} />
          )}
        </div>
        <ScrollArea
          className={cn(
            "h-[65dvh] w-full [&_.bg-border]:bg-logo-main/25 pr-3 pb-5 pt-0",
            isMobile && "!h-full",
            isHidingQuestion && "blur-sm"
          )}
          type="always"
          viewportRef={questionScrollAreaRef}
        >
          <AnnotatableInspectImages
            imageSource={currentQuestionData?.questionImages ?? []}
            currentQuestionId={currentQuestionData?.id}
          />
        </ScrollArea>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel
        defaultSize={isAnswerMultipleChoice ? 23 : 50}
        minSize={15}
      >
        <div
          className="ml-3 w-max m-2 mb-3 flex flex-row gap-1 items-center justify-start flex-wrap cursor-pointer"
          title="Toggle visibility"
          onClick={() => {
            setIsHidingAnswer(!isHidingAnswer);
          }}
        >
          <p className="text-sm">Answer</p>
          {!isHidingAnswer ? <Eye strokeWidth={2} /> : <EyeClosed />}
        </div>
        <ScrollArea
          className={cn(
            "h-[65dvh] w-full [&_.bg-border]:bg-logo-main/25 pl-3 pb-5 pt-0",
            isMobile && "!h-full",
            isHidingAnswer && "blur-sm"
          )}
          type="always"
          viewportRef={answerScrollAreaRef}
        >
          <AnnotatableInspectImages
            imageSource={currentQuestionData?.answers ?? []}
            currentQuestionId={currentQuestionData?.id}
          />
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default BothViews;
