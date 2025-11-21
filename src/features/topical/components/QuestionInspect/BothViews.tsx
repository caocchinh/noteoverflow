import { RefObject, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { SelectedQuestion } from "../../constants/types";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AnnotatableInspectImages,
  AnnotatableInspectImagesHandle,
} from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { useIsMobile } from "@/hooks/use-mobile";

interface InspectPanelProps {
  title: string;
  defaultSize: number;
  minSize: number;
  imageSource: string[];
  currentQuestionId: string | undefined;
  scrollAreaRef: RefObject<HTMLDivElement | null>;
  scrollAreaClassName?: string;
  initialHidden?: boolean;
  imagesRef?: RefObject<AnnotatableInspectImagesHandle | null>;
  viewerId: string;
}

const InspectPanel = ({
  title,
  defaultSize,
  minSize,
  imageSource,
  currentQuestionId,
  scrollAreaRef,
  scrollAreaClassName,
  initialHidden = false,
  imagesRef,
  viewerId,
}: InspectPanelProps) => {
  const [isHiding, setIsHiding] = useState(initialHidden);
  const isMobile = useIsMobile();

  return (
    <ResizablePanel
      defaultSize={defaultSize}
      minSize={minSize}
      onResize={(e) => {
        imagesRef?.current?.updatePdfViewerSize();
      }}
    >
      <div
        className="ml-3 m-2 mb-3 flex flex-row gap-1 items-center justify-start flex-wrap cursor-pointer w-max"
        title="Toggle visibility"
        onClick={() => {
          setIsHiding(!isHiding);
        }}
      >
        <p className="text-sm">{title}</p>
        {!isHiding ? <Eye strokeWidth={2} /> : <EyeClosed strokeWidth={2} />}
      </div>
      <ScrollArea
        className={cn(
          "h-[65dvh] w-full [&_.bg-border]:bg-logo-main/25 pr-3 pb-5 pt-0",
          isMobile && "!h-full",
          isHiding && "blur-sm",
          scrollAreaClassName
        )}
        type="always"
        viewportRef={scrollAreaRef}
      >
        <AnnotatableInspectImages
          ref={imagesRef as RefObject<AnnotatableInspectImagesHandle>}
          viewerId={viewerId}
          imageSource={imageSource}
          currentQuestionId={currentQuestionId}
        />
      </ScrollArea>
    </ResizablePanel>
  );
};

const BothViews = ({
  currentQuestionData,
  questionScrollAreaRef,
  answerScrollAreaRef,
  questionImagesRef,
  answerImagesRef,
}: {
  currentQuestionData: SelectedQuestion | undefined;
  questionScrollAreaRef: RefObject<HTMLDivElement | null>;
  answerScrollAreaRef: RefObject<HTMLDivElement | null>;
  questionImagesRef?: RefObject<AnnotatableInspectImagesHandle | null>;
  answerImagesRef?: RefObject<AnnotatableInspectImagesHandle | null>;
}) => {
  const isAnswerMultipleChoice =
    !currentQuestionData?.answers?.[0]?.includes("http");
  const isMobile = useIsMobile();

  return (
    <ResizablePanelGroup
      direction={isMobile ? "vertical" : "horizontal"}
      className={cn(
        "rounded-lg border w-full",
        isMobile ? "!h-[65dvh]" : "!h-[70dvh]"
      )}
    >
      <InspectPanel
        key={`question-${currentQuestionData?.id}`}
        title="Question"
        defaultSize={isAnswerMultipleChoice ? 77 : 50}
        minSize={15}
        imageSource={currentQuestionData?.questionImages ?? []}
        currentQuestionId={currentQuestionData?.id}
        scrollAreaRef={questionScrollAreaRef}
        imagesRef={questionImagesRef}
        viewerId="pdf-viewer-both-question"
      />
      <ResizableHandle withHandle />
      <InspectPanel
        key={`answer-${currentQuestionData?.id}`}
        title="Answer"
        defaultSize={isAnswerMultipleChoice ? 23 : 50}
        minSize={15}
        imageSource={currentQuestionData?.answers ?? []}
        currentQuestionId={currentQuestionData?.id}
        scrollAreaRef={answerScrollAreaRef}
        scrollAreaClassName="pl-3 pr-0"
        initialHidden={true}
        imagesRef={answerImagesRef}
        viewerId="pdf-viewer-both-answer"
      />
    </ResizablePanelGroup>
  );
};

export default BothViews;
