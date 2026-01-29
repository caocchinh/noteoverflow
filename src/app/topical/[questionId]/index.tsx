"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect, useEffectEvent } from "react";
import { ShareFilter } from "@/features/topical/components/ShareFilter";
import { BookmarkButton } from "@/features/topical/components/BookmarkButton/BookmarkButton";
import { QuestionInspectFinishedCheckbox } from "@/features/topical/components/QuestionInspect/QuestionInspectFinishedCheckbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QuestionInformation } from "@/features/topical/components/QuestionInformation";
import { BestExamHelpUltility } from "@/features/topical/components/BestExamHelpUltility";
import { useAuth } from "@/context/AuthContext";
import { createPortal } from "react-dom";
import { Root } from "react-dom/client";
import AnnotatableImagesUpdater from "@/features/topical/components/QuestionInspect/AnnotatableInspectImages/AnnotatableImagesUpdater";
import BothViews from "@/features/topical/components/QuestionInspect/BothViews";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import QuestionAnnotationGuardDialog from "@/features/topical/components/QuestionInspect/QuestionAnnotationGuardDialog";
import Link from "next/link";
import {
  AnnotatableInspectImagesHandle,
  UnsafeChangesState,
} from "@/features/topical/types/components";
import { SelectedQuestion } from "@/features/topical/types/models";

export const QuestionView = ({
  data,
  BETTER_AUTH_URL,
}: {
  data: SelectedQuestion;
  BETTER_AUTH_URL: string;
}) => {
  const [currentView, setCurrentView] = useState<
    "question" | "answer" | "both"
  >("question");
  const { isSessionPending } = useAuth();
  const { setIsCalculatorOpen, isCalculatorOpen } = useTopicalApp();

  const [questionViewContainer, setQuestionViewContainer] =
    useState<HTMLDivElement | null>(null);
  const [answerViewContainer, setAnswerViewContainer] =
    useState<HTMLDivElement | null>(null);
  const [bothViewsQuestionContainer, setBothViewsQuestionContainer] =
    useState<HTMLDivElement | null>(null);
  const [bothViewsAnswerContainer, setBothViewsAnswerContainer] =
    useState<HTMLDivElement | null>(null);
  const dummyLinkRef = useRef<HTMLAnchorElement | null>(null);

  const [annotatableQuestionInspectImagesElement] =
    useState<HTMLDivElement | null>(() => {
      if (typeof document !== "undefined") {
        const el = document.createElement("div");
        el.className = "w-full h-full";
        return el;
      }
      return null;
    });
  const annotatableQuestionInspectImagesRootRef = useRef<Root | null>(null);

  const [annotatableAnswerInspectImagesElement] =
    useState<HTMLDivElement | null>(() => {
      if (typeof document !== "undefined") {
        const el = document.createElement("div");
        el.className = "w-full h-full";
        return el;
      }
      return null;
    });
  const annotatableAnswerInspectImagesRootRef = useRef<Root | null>(null);

  const annotatableQuestionInspectImagesRootElementRef =
    useRef<AnnotatableInspectImagesHandle | null>(null);
  const annotatableAnswerInspectImagesRootElementRef =
    useRef<AnnotatableInspectImagesHandle | null>(null);

  const [isMounted, setIsMounted] = useState(false);
  const isHavingUnsafeChangesRef = useRef<UnsafeChangesState>({
    question: false,
    answer: false,
    questionId: "",
  });
  const [isAnnotationGuardDialogOpen, setIsAnnotationGuardDialogOpen] =
    useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  );

  const questionScrollAreaRef = useRef<HTMLDivElement>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsQuestionScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsAnswerScrollAreaRef = useRef<HTMLDivElement>(null);

  // Cleanup roots only when component unmounts
  useEffect(() => {
    setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => {
      setTimeout(() => {
        setIsMounted(false);
        if (annotatableQuestionInspectImagesRootRef.current) {
          annotatableQuestionInspectImagesRootRef.current.unmount();
          annotatableQuestionInspectImagesRootRef.current = null;
        }
        if (annotatableQuestionInspectImagesElement) {
          annotatableQuestionInspectImagesElement.remove();
        }
        if (annotatableAnswerInspectImagesRootRef.current) {
          annotatableAnswerInspectImagesRootRef.current.unmount();
          annotatableAnswerInspectImagesRootRef.current = null;
        }
        if (annotatableAnswerInspectImagesElement) {
          annotatableAnswerInspectImagesElement.remove();
        }
      }, 0);
    };
  }, [
    annotatableAnswerInspectImagesElement,
    annotatableQuestionInspectImagesElement,
  ]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (
        isHavingUnsafeChangesRef.current.question ||
        isHavingUnsafeChangesRef.current.answer
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      history.pushState(null, "", window.location.href);
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (
        anchor &&
        anchor.href &&
        (isHavingUnsafeChangesRef.current.question ||
          isHavingUnsafeChangesRef.current.answer)
      ) {
        if (anchor.target === "_blank" || e.ctrlKey || e.metaKey) return;

        e.preventDefault();
        e.stopPropagation();
        setPendingNavigation(anchor.href);
        setIsAnnotationGuardDialogOpen(true);
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  const onGuardComplete = useEffectEvent(() => {
    setPendingNavigation(null);
    dummyLinkRef.current?.click();
  });

  useEffect(() => {
    if (pendingNavigation && !isAnnotationGuardDialogOpen) {
      onGuardComplete();
    }
  }, [isAnnotationGuardDialogOpen, pendingNavigation]);

  return (
    <>
      <QuestionAnnotationGuardDialog isOpen={isAnnotationGuardDialogOpen} />
      <AnnotatableImagesUpdater
        isMounted={isMounted}
        elementRef={{ current: annotatableQuestionInspectImagesElement }}
        elementRootRef={annotatableQuestionInspectImagesRootRef}
        typeOfView="question"
        componentRef={annotatableQuestionInspectImagesRootElementRef}
        isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
        setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
        isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
        question={data}
      />
      <AnnotatableImagesUpdater
        isMounted={isMounted}
        elementRef={{ current: annotatableAnswerInspectImagesElement }}
        elementRootRef={annotatableAnswerInspectImagesRootRef}
        typeOfView="answer"
        componentRef={annotatableAnswerInspectImagesRootElementRef}
        isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
        setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
        isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
        question={data}
      />
      <div className="flex flex-col h-screen pt-16 px-4 relative">
        <div className="flex items-center justify-start w-full gap-4 flex-wrap mb-3 ">
          <div className="flex items-center w-max justify-center gap-2 p-[3px] bg-input/80 rounded-md  ">
            <Button
              onClick={() => setCurrentView("question")}
              className={cn(
                "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                currentView === "question" &&
                  "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 ",
              )}
            >
              Question
            </Button>
            <Button
              onClick={() => setCurrentView("answer")}
              className={cn(
                "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                currentView === "answer" &&
                  "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 ",
              )}
            >
              Answer
            </Button>
            <Button
              onClick={() => setCurrentView("both")}
              className={cn(
                "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2  bg-input text-black hover:bg-input dark:bg-transparent",
                currentView === "both" &&
                  "border-input bg-white hover:bg-white dark:text-white dark:bg-input/30 ",
              )}
            >
              Both
            </Button>
            <Button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              className={cn(
                "cursor-pointer border-2 border-transparent h-[calc(100%-1px)] dark:text-muted-foreground py-1 px-2 bg-input text-black hover:bg-input dark:bg-transparent",
                isCalculatorOpen &&
                  "border-logo-main! bg-logo-main! text-white! hover:bg-logo-main/80!",
              )}
            >
              Calculator
            </Button>
          </div>
          <BookmarkButton
            isBookmarkDisabled={isSessionPending}
            isInView={true}
            badgeClassName="!h-full"
            question={data}
          />
          <QuestionInspectFinishedCheckbox question={data} className="h-max!" />
          <BestExamHelpUltility question={data} />
          <ShareFilter
            isDisabled={false}
            url={`${BETTER_AUTH_URL}/topical/${encodeURIComponent(data.id)}`}
            type="question"
          />
        </div>
        <div
          className={cn(currentView === "question" ? "block w-full" : "hidden")}
        >
          <ScrollArea
            className="h-[76dvh]  w-full [&_.bg-border]:bg-transparent"
            type="always"
            viewportRef={questionScrollAreaRef}
          >
            <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
              <QuestionInformation
                question={data}
                showCurriculumn={true}
                showSubject={true}
              />
            </div>
            <div ref={setQuestionViewContainer}></div>
          </ScrollArea>
        </div>
        <div
          className={cn(currentView === "answer" ? "block w-full" : "hidden")}
        >
          <ScrollArea
            className="h-[76dvh] w-full [&_.bg-border]:bg-transparent"
            type="always"
            viewportRef={answerScrollAreaRef}
          >
            <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
              <QuestionInformation
                question={data}
                showCurriculumn={true}
                showSubject={true}
              />
            </div>
            <div ref={setAnswerViewContainer}></div>
          </ScrollArea>
        </div>
        <div className={cn(currentView === "both" ? "block w-full" : "hidden")}>
          <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
            <QuestionInformation
              question={data}
              showCurriculumn={true}
              showSubject={true}
            />
          </div>
          <BothViews
            currentQuestionData={data}
            questionScrollAreaRef={bothViewsQuestionScrollAreaRef}
            answerScrollAreaRef={bothViewsAnswerScrollAreaRef}
            annotableQuestionContainerRef={setBothViewsQuestionContainer}
            annotableAnswerContainerRef={setBothViewsAnswerContainer}
          />
        </div>
      </div>
      {bothViewsQuestionContainer &&
        questionViewContainer &&
        (currentView === "question" || currentView === "both") &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableQuestionInspectImagesElement &&
                annotatableQuestionInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableQuestionInspectImagesElement);
              }
            }}
            className="w-full h-full"
          />,
          currentView === "both"
            ? bothViewsQuestionContainer
            : questionViewContainer,
        )}
      {bothViewsAnswerContainer &&
        answerViewContainer &&
        (currentView === "answer" || currentView === "both") &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableAnswerInspectImagesElement &&
                annotatableAnswerInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableAnswerInspectImagesElement);
              }
            }}
            className="w-full h-full"
          />,
          currentView === "both"
            ? bothViewsAnswerContainer
            : answerViewContainer,
        )}
      <Link ref={dummyLinkRef} href={pendingNavigation || ""} />
    </>
  );
};
