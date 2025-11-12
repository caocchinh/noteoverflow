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
} from "../../constants/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AnnotatableInspectImages } from "./AnnotatableInspectImages/AnnotatableInspectImages";
import { QuestionInformation } from "../QuestionInformation";
import BothViews from "./BothViews";

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

    const currentQuestionData = useMemo(() => {
      return partitionedTopicalData?.[currentTabThatContainsQuestion]?.[
        currentQuestionIndex
      ];
    }, [
      partitionedTopicalData,
      currentTabThatContainsQuestion,
      currentQuestionIndex,
    ]);

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
              currentView === "question" ? "block w-full" : "hidden"
            )}
          >
            <ScrollArea
              className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
              type="always"
              viewportRef={questionScrollAreaRef}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={false}
                  showSubject={false}
                />
              </div>
              <AnnotatableInspectImages
                imageSource={currentQuestionData?.questionImages ?? []}
                currentQuestionId={currentQuestionData?.id}
              />
              <div className="my-6"></div>
              <BrowseMoreQuestions
                partitionedTopicalData={partitionedTopicalData}
                onQuestionClick={onQuestionClick}
                isBrowseMoreOpen={isBrowseMoreOpen}
                setIsBrowseMoreOpen={setIsBrowseMoreOpen}
              />
            </ScrollArea>
          </div>
          <div
            className={cn(currentView === "answer" ? "block w-full" : "hidden")}
          >
            <ScrollArea
              className="h-[76dvh] w-full [&_.bg-border]:bg-logo-main/25 !pr-2"
              type="always"
              viewportRef={answerScrollAreaRef}
            >
              <div className="flex flex-row flex-wrap w-full gap-2 py-2 justify-start items-start">
                <QuestionInformation
                  question={currentQuestionData}
                  showCurriculumn={false}
                  showSubject={false}
                />
              </div>
              <AnnotatableInspectImages
                imageSource={currentQuestionData?.answers ?? []}
                currentQuestionId={currentQuestionData?.id}
              />
            </ScrollArea>
          </div>
          <div
            className={cn(currentView === "both" ? "block w-full" : "hidden")}
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
            />
          </div>
        </div>
        <CloseButton onClick={handleCloseClick} />
      </SidebarInset>
    );
  }
);

QuestionInspectMainContent.displayName = "QuestionInspectMainContent";

export default QuestionInspectMainContent;
