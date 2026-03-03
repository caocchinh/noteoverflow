import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarInset } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Root } from "react-dom/client";
import { useInspectContext } from "../../context/InspectContext";
import { AnnotatableInspectImagesHandle, QuestionInspectViewMode } from "../../types/components";
import { QuestionInformation } from "../QuestionInformation";
import AnnotatableImagesUpdater from "./AnnotatableInspectImages/AnnotatableImagesUpdater";
import BothViews from "./BothViews";
import BrowseMoreQuestions from "./BrowseMoreQuestions";
import InspectUltilityBar from "./InspectUltilityBar";

const CloseButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    className="mb-1 flex h-7 w-full cursor-pointer items-center justify-center"
    variant="outline"
    onClick={onClick}
  >
    Close
  </Button>
));

CloseButton.displayName = "CloseButton";

const QuestionInspectMainContent = forwardRef((_, ref) => {
  const {
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionIndex,
    currentQuestionId,
    listId,
    inspectUltilityBarRef,
    sideBarInspectRef,
    sortParameters,
    setSortParameters,
    isInspectSidebarOpen,
    setIsInspectSidebarOpen,
    BETTER_AUTH_URL,
    navigationButtonsContainerRef,
    isHavingUnsafeChangesRef,
    setIsOpen,
    isCoolDownRef,
    isInputFocusedRef,
    setIsAnnotationGuardDialogOpen,
    isAnnotationGuardDialogOpen,
  } = useInspectContext();
  const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
  const answerScrollAreaRef = useRef<HTMLDivElement>(null);
  const questionScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsQuestionScrollAreaRef = useRef<HTMLDivElement>(null);
  const bothViewsAnswerScrollAreaRef = useRef<HTMLDivElement>(null);
  const [isBrowseMoreOpen, setIsBrowseMoreOpen] = useState(false);
  const [currentView, setCurrentView] = useState<QuestionInspectViewMode>("question");
  const [questionViewContainer, setQuestionViewContainer] = useState<HTMLDivElement | null>(null);
  const pathname = usePathname();
  const [answerViewContainer, setAnswerViewContainer] = useState<HTMLDivElement | null>(null);
  const [bothViewsQuestionContainer, setBothViewsQuestionContainer] =
    useState<HTMLDivElement | null>(null);
  const [bothViewsAnswerContainer, setBothViewsAnswerContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const [annotatableQuestionInspectImagesElement] = useState<HTMLDivElement | null>(() => {
    if (typeof document !== "undefined") {
      const el = document.createElement("div");
      el.className = "w-full h-full";
      return el;
    }
    return null;
  });
  const annotatableQuestionInspectImagesRootRef = useRef<Root | null>(null);
  const [annotatableAnswerInspectImagesElement] = useState<HTMLDivElement | null>(() => {
    if (typeof document !== "undefined") {
      const el = document.createElement("div");
      el.className = "w-full h-full";
      return el;
    }
    return null;
  });
  const annotatableAnswerInspectImagesRootRef = useRef<Root | null>(null);
  const [isPendingCloseInspect, setIsPendingCloseInspect] = useState(false);
  const annotatableQuestionInspectImagesRootElementRef =
    useRef<AnnotatableInspectImagesHandle | null>(null);
  const annotatableAnswerInspectImagesRootElementRef =
    useRef<AnnotatableInspectImagesHandle | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [key, setKey] = useState(0);

  // Instantly initalizes the element since there's no constrain (act like normal React rerender cycle)

  const currentQuestionData = useMemo(() => {
    return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[currentQuestionIndex];
  }, [partitionedTopicalData, currentTabThatContainsQuestion, currentQuestionIndex]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetScrollPositions = useCallback(() => {
    questionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    answerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    bothViewsQuestionScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
    bothViewsAnswerScrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: "instant",
    });
  }, []);

  const handleKeyboardNavigation = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const isInterferingWithPdfEditor =
        (currentView === "question" &&
          annotatableQuestionInspectImagesRootElementRef.current?.isEditMode) ||
        (currentView === "answer" &&
          annotatableAnswerInspectImagesRootElementRef.current?.isEditMode);
      if (e.key === "e" && !isInputFocusedRef.current && !isInterferingWithPdfEditor) {
        e.preventDefault();
        if (currentView === "question") {
          setCurrentView("answer");
        } else {
          setCurrentView("question");
        }
      }
      if (e.key === "r" && !isInputFocusedRef.current && !isInterferingWithPdfEditor) {
        e.preventDefault();
        setCurrentView("both");
        setIsInspectSidebarOpen(false);
      }
      if (e.key === "t" && !isInputFocusedRef.current) {
        e.preventDefault();
        setIsInspectSidebarOpen(!isInspectSidebarOpen);
      }
      if (isCoolDownRef.current || isInterferingWithPdfEditor) return;

      if (
        (e.key === "ArrowUp" || ((e.key === "w" || e.key === "a") && !isInputFocusedRef.current)) &&
        !sideBarInspectRef.current?.isHandlePreviousQuestionDisabled
      ) {
        e.preventDefault();
        sideBarInspectRef.current?.handlePreviousQuestion();
        isCoolDownRef.current = true;
        setTimeout(() => {
          isCoolDownRef.current = false;
        }, 25);
      } else if (
        (e.key === "ArrowDown" ||
          ((e.key === "s" || e.key === "d") && !isInputFocusedRef.current)) &&
        !sideBarInspectRef.current?.isHandleNextQuestionDisabled
      ) {
        e.preventDefault();
        sideBarInspectRef.current?.handleNextQuestion();

        isCoolDownRef.current = true;
        setTimeout(() => {
          isCoolDownRef.current = false;
        }, 25);
      }
    },
    [
      currentView,
      isCoolDownRef,
      isInputFocusedRef,
      isInspectSidebarOpen,
      setIsInspectSidebarOpen,
      sideBarInspectRef,
    ],
  );

  useEffect(() => {
    setCurrentView("question");
    resetScrollPositions();
  }, [currentQuestionId, resetScrollPositions]);

  useImperativeHandle(
    ref,
    () => ({
      resetScrollPositions,
      setCurrentView,
      handleKeyboardNavigation,
    }),
    [resetScrollPositions, setCurrentView, handleKeyboardNavigation],
  );

  const onQuestionClick = useCallback(
    (questionId: string) => {
      sideBarInspectRef.current?.navigateToQuestion({ questionId });
      resetScrollPositions();
    },
    [sideBarInspectRef, resetScrollPositions],
  );

  const handleCloseClick = useCallback(() => {
    if (isHavingUnsafeChangesRef.current.question || isHavingUnsafeChangesRef.current.answer) {
      setIsAnnotationGuardDialogOpen(true);
      setIsPendingCloseInspect(true);
      return;
    }

    if (currentQuestionId) {
      setIsOpen({ isOpen: false, questionId: currentQuestionId });
    }
  }, [currentQuestionId, isHavingUnsafeChangesRef, setIsAnnotationGuardDialogOpen, setIsOpen]);

  useEffect(() => {
    if (isPendingCloseInspect && currentQuestionId && !isAnnotationGuardDialogOpen) {
      setIsPendingCloseInspect(false);
      setIsOpen({ isOpen: false, questionId: currentQuestionId });
    }
  }, [currentQuestionId, isAnnotationGuardDialogOpen, isPendingCloseInspect, setIsOpen]);

  return (
    <>
      <AnnotatableImagesUpdater
        isMounted={isMounted}
        elementRef={{ current: annotatableQuestionInspectImagesElement }}
        elementRootRef={annotatableQuestionInspectImagesRootRef}
        typeOfView="question"
        componentRef={annotatableQuestionInspectImagesRootElementRef}
        isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
        setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
        isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
        question={currentQuestionData}
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
        question={currentQuestionData}
      />
      <SidebarInset className="dark:bg-accent flex h-[inherit] w-full flex-col items-center justify-between gap-2 overflow-hidden rounded-md p-2 px-4">
        <div
          className="relative flex h-[inherit] w-full flex-col items-center justify-start gap-2"
          ref={sideBarInsetRef}
        >
          <InspectUltilityBar
            isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
            isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
            setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
            ref={inspectUltilityBarRef}
            currentView={currentView}
            setCurrentView={setCurrentView}
            currentQuestionData={currentQuestionData}
            listId={listId}
            navigationButtonsContainerRef={navigationButtonsContainerRef}
            sortParameters={sortParameters}
            setSortParameters={setSortParameters}
            isInspectSidebarOpen={isInspectSidebarOpen}
            setIsInspectSidebarOpen={setIsInspectSidebarOpen}
            BETTER_AUTH_URL={BETTER_AUTH_URL}
            sideBarInsetRef={sideBarInsetRef}
          />

          <div className={cn(currentView === "question" ? "w-full" : "absolute top-[-99999px]")}>
            <ScrollArea
              className="[&_.bg-border]:bg-logo-main/25 h-[76dvh] w-full pr-4!"
              type="always"
              viewportRef={questionScrollAreaRef}
            >
              <div className="flex w-full flex-row flex-wrap items-start justify-start gap-2">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={pathname == "/search"}
                  showSubject={pathname == "/search"}
                />
              </div>
              <div ref={setQuestionViewContainer}></div>

              <BrowseMoreQuestions
                partitionedTopicalData={partitionedTopicalData}
                onQuestionClick={onQuestionClick}
                isBrowseMoreOpen={isBrowseMoreOpen}
                setIsBrowseMoreOpen={setIsBrowseMoreOpen}
              />
            </ScrollArea>
          </div>
          <div className={cn(currentView === "answer" ? "w-full" : "absolute top-[-99999px]")}>
            <ScrollArea
              className="[&_.bg-border]:bg-logo-main/25 h-[76dvh] w-full pr-4!"
              type="always"
              viewportRef={answerScrollAreaRef}
            >
              <div className="flex w-full flex-row flex-wrap items-start justify-start gap-2">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={pathname == "/search"}
                  showSubject={pathname == "/search"}
                />
              </div>
              <div ref={setAnswerViewContainer}></div>
            </ScrollArea>
          </div>
          <div className={cn(currentView === "both" ? "w-full" : "absolute top-[-99999px]")}>
            <div className="-mb-3 flex w-full flex-row flex-wrap items-start justify-start gap-2 py-2">
              <QuestionInformation
                question={currentQuestionData}
                showCurriculumn={pathname == "/search"}
                showSubject={pathname == "/search"}
              />
            </div>
            <BothViews
              currentQuestionData={currentQuestionData}
              questionScrollAreaRef={bothViewsQuestionScrollAreaRef}
              answerScrollAreaRef={bothViewsAnswerScrollAreaRef}
              annotableQuestionContainerRef={setBothViewsQuestionContainer}
              annotableAnswerContainerRef={setBothViewsAnswerContainer}
            />
          </div>
        </div>
        <CloseButton onClick={handleCloseClick} />
      </SidebarInset>
      {questionViewContainer &&
        bothViewsQuestionContainer &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableQuestionInspectImagesElement &&
                currentView !== "both" &&
                annotatableQuestionInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableQuestionInspectImagesElement);
              }
            }}
            className="h-full w-full"
          />,
          questionViewContainer,
        )}
      {bothViewsQuestionContainer &&
        questionViewContainer &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableQuestionInspectImagesElement &&
                currentView === "both" &&
                annotatableQuestionInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableQuestionInspectImagesElement);
              }
            }}
            className="h-full w-full"
          />,
          bothViewsQuestionContainer,
        )}
      {answerViewContainer &&
        bothViewsAnswerContainer &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableAnswerInspectImagesElement &&
                currentView !== "both" &&
                annotatableAnswerInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableAnswerInspectImagesElement);
              }
            }}
            className="h-full w-full"
          />,
          answerViewContainer,
        )}
      {bothViewsAnswerContainer &&
        answerViewContainer &&
        createPortal(
          <div
            ref={(node) => {
              if (
                node &&
                annotatableAnswerInspectImagesElement &&
                currentView === "both" &&
                annotatableAnswerInspectImagesElement.parentNode !== node
              ) {
                node.appendChild(annotatableAnswerInspectImagesElement);
              }
            }}
            className="h-full w-full"
          />,
          bothViewsAnswerContainer,
        )}
    </>
  );
});

QuestionInspectMainContent.displayName = "QuestionInspectMainContent";

export default QuestionInspectMainContent;
