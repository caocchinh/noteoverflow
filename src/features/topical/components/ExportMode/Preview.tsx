/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/AuthContext";
import "@/features/topical/components/react-photo-view.css";
import { cn } from "@/lib/utils";
import { Loader2, MousePointerClick } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { PhotoProvider, PhotoView } from "react-photo-view";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import { extractQuestionNumber, splitContent } from "../../lib/utils";
import { SelectedQuestion } from "../../types/models";
import { BookmarkButton } from "../BookmarkButton/BookmarkButton";
import { QuestionInformation } from "../QuestionInformation";
import { QuestionInspectFinishedCheckbox } from "../QuestionInspect/QuestionInspectFinishedCheckbox";

type PreviewViewMode = "question" | "answer";

const EmptyState = memo(() => {
  return (
    <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-4">
      <MousePointerClick className="h-16 w-16 opacity-50" />
      <p className="text-center text-lg font-medium">Select a question to preview</p>
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
      <div className="bg-input/80 flex w-max items-center justify-center gap-2 rounded-md p-[3px]">
        <Button
          onClick={() => setCurrentView("question")}
          className={cn(
            "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
            currentView === "question" &&
              "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
          )}
        >
          Question
        </Button>
        <Button
          onClick={() => setCurrentView("answer")}
          className={cn(
            "dark:text-muted-foreground bg-input hover:bg-input h-[calc(100%-1px)] cursor-pointer border-2 border-transparent px-2 py-1 text-black dark:bg-transparent",
            currentView === "answer" &&
              "border-input dark:bg-input/30 bg-white hover:bg-white dark:text-white",
          )}
        >
          Answer
        </Button>
      </div>
    );
  },
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
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <ViewModeToggle currentView={currentView} setCurrentView={setCurrentView} />
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
        <QuestionInformation question={question} showCurriculumn={false} showSubject={false} />
      </div>
    );
  },
);

PreviewUtilityBar.displayName = "PreviewUtilityBar";

const PreviewImages = memo(
  ({ question, currentView }: { question: SelectedQuestion; currentView: PreviewViewMode }) => {
    const { uiPreferences } = useTopicalApp();

    const { images: imageUrls, text } = useMemo(() => {
      if (!question) return { images: [], text: [] };
      const items = currentView === "question" ? question.questionImages : question.answers;
      return splitContent(items);
    }, [question, currentView]);

    return (
      <div className="relative flex h-full min-h-[100px] w-full flex-col items-center justify-start">
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
                  "relative z-2 h-full w-full max-w-[750px]! cursor-pointer object-contain",
                  uiPreferences.imageTheme === "dark" && "invert!",
                )}
                src={item}
                alt={currentView === "question" ? "Question image" : "Answer image"}
                loading="lazy"
              />
            </PhotoView>
          ))}
        </PhotoProvider>
        {imageUrls.length > 0 && (
          <Loader2 className="text-red absolute top-0 left-1/2 z-1 h-4 w-4 -translate-x-1/2 animate-spin" />
        )}
        {text.map((item, index) => (
          <p key={`text-${index}`}>{item}</p>
        ))}
      </div>
    );
  },
);

PreviewImages.displayName = "PreviewImages";

const Preview = memo(
  ({ previewQuestionData }: { previewQuestionData: SelectedQuestion | undefined }) => {
    const [currentView, setCurrentView] = useState<PreviewViewMode>("question");

    if (!previewQuestionData) {
      return (
        <div className="border-border flex h-full w-full items-center justify-center border-l pl-4">
          <EmptyState />
        </div>
      );
    }

    return (
      <div className="border-border flex h-full w-full flex-col overflow-hidden border-l pl-4">
        <ScrollArea className="h-[75dvh] pr-4 lg:h-[62dvh]">
          <PreviewUtilityBar
            question={previewQuestionData}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
          <div className="flex-1 overflow-y-auto">
            <PreviewImages question={previewQuestionData} currentView={currentView} />
          </div>
        </ScrollArea>
      </div>
    );
  },
);

Preview.displayName = "Preview";

export default Preview;
