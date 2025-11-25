import { Button } from "@/components/ui/button";
import { SidebarInset } from "@/components/ui/sidebar";
import BrowseMoreQuestions from "./BrowseMoreQuestions";
import { useAuth } from "@/context/AuthContext";
import { useTopicalApp } from "@/features/topical/context/TopicalLayoutProvider";
import InspectUltilityBar from "./InspectUltilityBar";
import {
  forwardRef,
  memo,
  RefObject,
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
} from "../../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { QuestionInformation } from "../QuestionInformation";
import BothViews from "./BothViews";
import { createRoot, Root } from "react-dom/client";
import { createPortal } from "react-dom";

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

const initAnnotableImagesElement = ({
  imageSource,
  elementRef,
  questionId,
  elementRootRef,
  isSessionFetching,
  userName,
  setIsCalculatorOpen,
  isCalculatorOpen,
  imageTheme,
}: {
  imageSource: string[];
  elementRef: RefObject<HTMLDivElement | null>;
  elementRootRef: RefObject<Root | null>;
  questionId: string;
  isSessionFetching: boolean;
  userName: string | undefined;
  setIsCalculatorOpen: (isOpen: boolean) => void;
  isCalculatorOpen: boolean;
  imageTheme: "light" | "dark";
}) => {
  if (!elementRef.current) {
    elementRef.current = document.createElement("div");
    elementRef.current.className = "w-full h-full";
  }

  if (!elementRootRef.current && elementRef.current) {
    elementRootRef.current = createRoot(elementRef.current);
  }

  if (elementRootRef.current) {
    elementRootRef.current.render(
      <AnnotatableInspectImages
        imageSource={imageSource}
        currentQuestionId={questionId}
        isSessionFetching={isSessionFetching}
        userName={userName}
        setIsCalculatorOpen={setIsCalculatorOpen}
        isCalculatorOpen={isCalculatorOpen}
        imageTheme={imageTheme}
      />
    );
  }
};

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
      setIsOpen,
      isCoolDown,
      isInputFocused,
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
    const { isSessionFetching, user } = useAuth();
    const { setIsCalculatorOpen, isCalculatorOpen, uiPreferences } =
      useTopicalApp();
    const [isMounted, setIsMounted] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [key, setKey] = useState(0);

    const currentQuestionData = useMemo(() => {
      return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
        currentQuestionIndex
      ];
    }, [
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
    ]);

    useEffect(() => {
      if (!currentQuestionData || !isMounted) return;

      // Call initAnnotableImagesElement every time to update props
      // The function creates the root only if it doesn't exist,
      // then always calls render() with the updated component
      initAnnotableImagesElement({
        imageSource: currentQuestionData?.questionImages ?? [],
        elementRef: annotatableQuestionInspectImagesElementRef,
        elementRootRef: annotatableQuestionInspectImagesRootRef,
        isSessionFetching,
        questionId: currentQuestionData?.id,
        userName: user?.name,
        setIsCalculatorOpen,
        isCalculatorOpen,
        imageTheme: uiPreferences.imageTheme,
      });

      initAnnotableImagesElement({
        imageSource: currentQuestionData?.answers ?? [],
        elementRef: annotatableAnswerInspectImagesElementRef,
        elementRootRef: annotatableAnswerInspectImagesRootRef,
        isSessionFetching,
        questionId: currentQuestionData?.id,
        userName: user?.name,
        setIsCalculatorOpen,
        isCalculatorOpen,
        imageTheme: uiPreferences.imageTheme,
      });
      setKey((prev) => prev + 1);
    }, [
      currentQuestionId,
      currentQuestionData,
      isSessionFetching,
      user?.name,
      setIsCalculatorOpen,
      isCalculatorOpen,
      uiPreferences.imageTheme,
      isMounted,
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
        if (e.key === "e" && !isInputFocused.current) {
          e.preventDefault();
          if (currentView === "question") {
            setCurrentView("answer");
          } else {
            setCurrentView("question");
          }
        }
        if (e.key === "r" && !isInputFocused.current) {
          e.preventDefault();
          setCurrentView("both");
          setIsInspectSidebarOpen(false);
        }
        if (e.key === "t" && !isInputFocused.current) {
          e.preventDefault();
          setIsInspectSidebarOpen(!isInspectSidebarOpen);
        }
        if (isCoolDown.current) return;

        if (
          (e.key === "ArrowUp" ||
            ((e.key === "w" || e.key === "a") && !isInputFocused.current)) &&
          !sideBarInspectRef.current?.isHandlePreviousQuestionDisabled
        ) {
          e.preventDefault();
          sideBarInspectRef.current?.handlePreviousQuestion();
          isCoolDown.current = true;
          setTimeout(() => {
            isCoolDown.current = false;
          }, 25);
        } else if (
          (e.key === "ArrowDown" ||
            ((e.key === "s" || e.key === "d") && !isInputFocused.current)) &&
          !sideBarInspectRef.current?.isHandleNextQuestionDisabled
        ) {
          e.preventDefault();
          sideBarInspectRef.current?.handleNextQuestion();

          isCoolDown.current = true;
          setTimeout(() => {
            isCoolDown.current = false;
          }, 25);
        }
      },
      [
        currentView,
        isCoolDown,
        isInputFocused,
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
        sideBarInspectRef.current?.navigateToQuestion(questionId);
        resetScrollPositions();
      },
      [sideBarInspectRef, resetScrollPositions]
    );

    const handleCloseClick = useCallback(() => {
      if (currentQuestionId) {
        setIsOpen({ isOpen: false, questionId: currentQuestionId });
      }
    }, [currentQuestionId, setIsOpen]);

    return (
      <>
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
