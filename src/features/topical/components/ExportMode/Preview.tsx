/* eslint-disable @next/next/no-img-element */
import "@/features/topical/components/react-photo-view.css";
import { SelectedQuestion } from "../../constants/types";
import { memo, useMemo, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { QuestionInspectFinishedCheckbox } from "../QuestionInspect/QuestionInspectFinishedCheckbox";
import { BookmarkButton } from "../BookmarkButton/BookmarkButton";
import { useAuth } from "@/context/AuthContext";
import { splitContent, extractQuestionNumber } from "../../lib/utils";
import { cn } from "@/lib/utils";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { Loader2, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuestionInformation } from "../QuestionInformation";
import { ScrollArea } from "@/components/ui/scroll-area";

type PreviewViewMode = "question" | "answer";

const EmptyState = memo(() => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full gap-4 text-muted-foreground">
      <MousePointerClick className="w-16 h-16 opacity-50" />
      <p className="text-center text-lg font-medium">
        Select a question to preview
      </p>
      <p className="text-center text-sm">
        Click on any question from the list to view its contents here
      </p>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const ViewModeToggle = memo(
  ({
    currentView,
    setCurrentView,
  }: {
    currentView: PreviewViewMode;
    setCurrentView: (view: PreviewViewMode) => void;
  }) => {
    return (
      <div className="flex items-center w-max justify-center gap-2 p-[3px] bg-input/80 rounded-md">
        <Button
          onClick={() => setCurrentView("question")}
          className={cn(
            "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2 bg-input text-black hover:bg-input dark:bg-transparent",
            currentView === "question" &&
              "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30"
          )}
        >
          Question
        </Button>
        <Button
          onClick={() => setCurrentView("answer")}
          className={cn(
            "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2 bg-input text-black hover:bg-input dark:bg-transparent",
            currentView === "answer" &&
              "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30"
          )}
        >
          Answer
        </Button>
      </div>
    );
  }
);

ViewModeToggle.displayName = "ViewModeToggle";

const PreviewUtilityBar = memo(
  ({
    question,
    currentView,
    setCurrentView,
  }: {
    question: SelectedQuestion;
    currentView: PreviewViewMode;
    setCurrentView: (view: PreviewViewMode) => void;
  }) => {
    const { isSessionPending } = useAuth();

    return (
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <ViewModeToggle
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <div className="flex items-center gap-2">
          <QuestionInspectFinishedCheckbox question={question} />
          <BookmarkButton
            triggerButtonClassName="h-[35px] w-[35px] border-black border !static"
            badgeClassName="h-[35px] min-h-[35px] !static"
            question={question}
            isBookmarkDisabled={isSessionPending}
            popOverAlign="start"
            isInView={true}
          />
        </div>
        <QuestionInformation
          question={question}
          showCurriculumn={false}
          showSubject={false}
        />
      </div>
    );
  }
);

PreviewUtilityBar.displayName = "PreviewUtilityBar";

const PreviewImages = memo(
  ({
    question,
    currentView,
  }: {
    question: SelectedQuestion;
    currentView: PreviewViewMode;
  }) => {
    const { uiPreferences } = useTopicalApp();

    const { images: imageUrls, text } = useMemo(() => {
      if (!question) return { images: [], text: [] };
      const items =
        currentView === "question" ? question.questionImages : question.answers;
      return splitContent(items);
    }, [question, currentView]);

    return (
      <div className="w-full h-full flex items-center relative justify-start flex-col min-h-[100px]">
        <PhotoProvider>
          {imageUrls.map((item) => (
            <PhotoView
              key={`${item}${question.id}${currentView}${
                question.id &&
                extractQuestionNumber({
                  questionId: question.id,
                })
              }`}
              src={item}
            >
              <img
                className={cn(
                  "w-full h-full object-contain relative z-2 max-w-[750px]! cursor-pointer",
                  uiPreferences.imageTheme === "dark" && "invert!"
                )}
                src={item}
                alt={
                  currentView === "question" ? "Question image" : "Answer image"
                }
                loading="lazy"
              />
            </PhotoView>
          ))}
        </PhotoProvider>
        {imageUrls.length > 0 && (
          <Loader2 className="animate-spin text-red absolute h-4 w-4 left-1/2 -translate-x-1/2 z-1 top-0" />
        )}
        {text.map((item, index) => (
          <p key={`text-${index}`}>{item}</p>
        ))}
      </div>
    );
  }
);

PreviewImages.displayName = "PreviewImages";

const Preview = ({
  previewQuestionData,
}: {
  previewQuestionData: SelectedQuestion | undefined;
}) => {
  const [currentView, setCurrentView] = useState<PreviewViewMode>("question");

  if (!previewQuestionData) {
    return (
      <div className="w-[50%] h-full flex items-center justify-center border-l border-border pl-4">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="w-[60%] h-full flex flex-col border-l border-border pl-4 overflow-hidden">
      <ScrollArea className="h-[62dvh] pr-4">
        <PreviewUtilityBar
          question={previewQuestionData}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        <div className="flex-1 overflow-y-auto">
          <PreviewImages
            question={previewQuestionData}
            currentView={currentView}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default memo(Preview);
