import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import BrowseMoreQuestions from "./BrowseMoreQuestions";
import InspectUltilityBar from "./InspectUltilityBar";
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
import {
  QuestionInspectMainContentProps,
  QuestionInspectViewMode,
  AnnotatableInspectImagesHandle,
} from "../../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { QuestionInformation } from "../QuestionInformation";
import BothViews from "./BothViews";
import { Root } from "react-dom/client";
import { createPortal } from "react-dom";
import AnnotatableImagesUpdater from "./AnnotatableImagesUpdater";

const CloseButton = memo(({ onClick }: { onClick: () => void }) => (
  <Button
    className="w-full h-7 flex items-center justify-center cursor-pointer mb-1"
    variant="outline"
    onClick={onClick}
  >
    Close
  </Button>
));

CloseButton.displayName = "CloseButton";

const QuestionInspectMainContent = forwardRef(
  (
    {
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
    }: QuestionInspectMainContentProps,
    ref
  ) => {
    const sideBarInsetRef = useRef<HTMLDivElement | null>(null);
    const answerScrollAreaRef = useRef<HTMLDivElement>(null);
    const questionScrollAreaRef = useRef<HTMLDivElement>(null);
    const bothViewsQuestionScrollAreaRef = useRef<HTMLDivElement>(null);
    const bothViewsAnswerScrollAreaRef = useRef<HTMLDivElement>(null);
    const [isBrowseMoreOpen, setIsBrowseMoreOpen] = useState(false);
    const [currentView, setCurrentView] =
      useState<QuestionInspectViewMode>("question");
    const questionViewContainer = useRef<HTMLDivElement | null>(null);
    const answerViewContainer = useRef<HTMLDivElement | null>(null);
    const bothViewsQuestionContainer = useRef<HTMLDivElement | null>(null);
    const bothViewsAnswerContainer = useRef<HTMLDivElement | null>(null);
    const annotatableQuestionInspectImagesElementRef =
      useRef<HTMLDivElement | null>(null);
    const annotatableQuestionInspectImagesRootRef = useRef<Root | null>(null);
    const annotatableAnswerInspectImagesElementRef =
      useRef<HTMLDivElement | null>(null);
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
    if (
      !annotatableQuestionInspectImagesElementRef.current &&
      typeof document !== "undefined"
    ) {
      annotatableQuestionInspectImagesElementRef.current =
        document.createElement("div");
      annotatableQuestionInspectImagesElementRef.current.className =
        "w-full h-full";
    }

    if (
      !annotatableAnswerInspectImagesElementRef.current &&
      typeof document !== "undefined"
    ) {
      annotatableAnswerInspectImagesElementRef.current =
        document.createElement("div");
      annotatableAnswerInspectImagesElementRef.current.className =
        "w-full h-full";
    }

    const currentQuestionData = useMemo(() => {
      return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
        currentQuestionIndex
      ];
    }, [
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
    ]);

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
          if (annotatableQuestionInspectImagesElementRef.current) {
            annotatableQuestionInspectImagesElementRef.current.remove();
            annotatableQuestionInspectImagesElementRef.current = null;
          }
          if (annotatableAnswerInspectImagesRootRef.current) {
            annotatableAnswerInspectImagesRootRef.current.unmount();
            annotatableAnswerInspectImagesRootRef.current = null;
          }
          if (annotatableAnswerInspectImagesElementRef.current) {
            annotatableAnswerInspectImagesElementRef.current.remove();
            annotatableAnswerInspectImagesElementRef.current = null;
          }
        }, 0);
      };
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
            annotatableQuestionInspectImagesRootElementRef.current
              ?.isEditMode) ||
          (currentView === "answer" &&
            annotatableAnswerInspectImagesRootElementRef.current?.isEditMode);
        if (
          e.key === "e" &&
          !isInputFocusedRef.current &&
          !isInterferingWithPdfEditor
        ) {
          e.preventDefault();
          if (currentView === "question") {
            setCurrentView("answer");
          } else {
            setCurrentView("question");
          }
        }
        if (
          e.key === "r" &&
          !isInputFocusedRef.current &&
          !isInterferingWithPdfEditor
        ) {
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
          (e.key === "ArrowUp" ||
            ((e.key === "w" || e.key === "a") && !isInputFocusedRef.current)) &&
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
      ]
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
      [resetScrollPositions, setCurrentView, handleKeyboardNavigation]
    );

    const onQuestionClick = useCallback(
      (questionId: string) => {
        sideBarInspectRef.current?.navigateToQuestion({ questionId });
        resetScrollPositions();
      },
      [sideBarInspectRef, resetScrollPositions]
    );

    const handleCloseClick = useCallback(() => {
      if (
        isHavingUnsafeChangesRef.current.question ||
        isHavingUnsafeChangesRef.current.answer
      ) {
        setIsAnnotationGuardDialogOpen(true);
        setIsPendingCloseInspect(true);
        return;
      }

      if (currentQuestionId) {
        setIsOpen({ isOpen: false, questionId: currentQuestionId });
      }
    }, [
      currentQuestionId,
      isHavingUnsafeChangesRef,
      setIsAnnotationGuardDialogOpen,
      setIsOpen,
    ]);

    useEffect(() => {
      if (
        isPendingCloseInspect &&
        currentQuestionId &&
        !isAnnotationGuardDialogOpen
      ) {
        setIsPendingCloseInspect(false);
        setIsOpen({ isOpen: false, questionId: currentQuestionId });
      }
    }, [
      currentQuestionId,
      isAnnotationGuardDialogOpen,
      isPendingCloseInspect,
      setIsOpen,
    ]);

    return (
      <>
        <AnnotatableImagesUpdater
          isMounted={isMounted}
          imageSource={currentQuestionData?.questionImages ?? []}
          elementRef={annotatableQuestionInspectImagesElementRef}
          elementRootRef={annotatableQuestionInspectImagesRootRef}
          questionId={currentQuestionData?.id ?? ""}
          typeOfView="question"
          componentRef={annotatableQuestionInspectImagesRootElementRef}
          isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
          setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
          isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
          question={currentQuestionData}
        />
        <AnnotatableImagesUpdater
          isMounted={isMounted}
          imageSource={currentQuestionData?.answers ?? []}
          elementRef={annotatableAnswerInspectImagesElementRef}
          elementRootRef={annotatableAnswerInspectImagesRootRef}
          questionId={currentQuestionData?.id ?? ""}
          typeOfView="answer"
          componentRef={annotatableAnswerInspectImagesRootElementRef}
          isHavingUnsafeChangesRef={isHavingUnsafeChangesRef}
          setIsAnnotationGuardDialogOpen={setIsAnnotationGuardDialogOpen}
          isAnnotationGuardDialogOpen={isAnnotationGuardDialogOpen}
          question={currentQuestionData}
        />
        <SidebarInset className="h-[inherit] w-full p-2 rounded-md px-4 dark:bg-accent gap-2 overflow-hidden flex flex-col items-center justify-between">
          <div
            className="w-full h-[inherit] flex flex-col gap-2 items-center justify-start relative"
            ref={sideBarInsetRef}
          >
            <InspectUltilityBar
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

            <div
              className={cn(
                currentView === "question"
                  ? "w-full"
                  : "absolute top-[-99999px]"
              )}
            >
              <ScrollArea
                className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                type="always"
                viewportRef={questionScrollAreaRef}
              >
                <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start">
                  <QuestionInformation
                    question={currentQuestionData}
                    showCurriculumn={false}
                    showSubject={false}
                  />
                </div>
                <div ref={questionViewContainer}></div>

                <BrowseMoreQuestions
                  partitionedTopicalData={partitionedTopicalData}
                  onQuestionClick={onQuestionClick}
                  isBrowseMoreOpen={isBrowseMoreOpen}
                  setIsBrowseMoreOpen={setIsBrowseMoreOpen}
                />
              </ScrollArea>
            </div>
            <div
              className={cn(
                currentView === "answer" ? "w-full" : "absolute top-[-99999px]"
              )}
            >
              <ScrollArea
                className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
                type="always"
                viewportRef={answerScrollAreaRef}
              >
                <div className="flex flex-row flex-wrap w-full gap-2 justify-start items-start">
                  <QuestionInformation
                    question={currentQuestionData}
                    showCurriculumn={false}
                    showSubject={false}
                  />
                </div>
                <div ref={answerViewContainer}></div>
              </ScrollArea>
            </div>
            <div
              className={cn(
                currentView === "both" ? "w-full" : "absolute top-[-99999px]"
              )}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 -mb-3 py-2 justify-start items-start">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={false}
                  showSubject={false}
                />
              </div>
              <BothViews
                currentQuestionData={currentQuestionData}
                questionScrollAreaRef={bothViewsQuestionScrollAreaRef}
                answerScrollAreaRef={bothViewsAnswerScrollAreaRef}
                annotableQuestionContainerRef={bothViewsQuestionContainer}
                annotableAnswerContainerRef={bothViewsAnswerContainer}
              />
            </div>
          </div>
          <CloseButton onClick={handleCloseClick} />
        </SidebarInset>
        {bothViewsQuestionContainer.current &&
          questionViewContainer.current &&
          (currentView === "question" || currentView === "both") &&
          createPortal(
            <div
              ref={(node) => {
                if (
                  node &&
                  annotatableQuestionInspectImagesElementRef.current
                ) {
                  node.appendChild(
                    annotatableQuestionInspectImagesElementRef.current
                  );
                }
              }}
              className="w-full h-full"
            />,
            currentView === "both"
              ? bothViewsQuestionContainer.current
              : questionViewContainer.current
          )}
        {bothViewsAnswerContainer.current &&
          answerViewContainer.current &&
          (currentView === "answer" || currentView === "both") &&
          createPortal(
            <div
              ref={(node) => {
                if (node && annotatableAnswerInspectImagesElementRef.current) {
                  node.appendChild(
                    annotatableAnswerInspectImagesElementRef.current
                  );
                }
              }}
              className="w-full h-full"
            />,
            currentView === "both"
              ? bothViewsAnswerContainer.current
              : answerViewContainer.current
          )}
      </>
    );
  }
);

QuestionInspectMainContent.displayName = "QuestionInspectMainContent";

export default QuestionInspectMainContent;
