"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { updateSearchParams } from "../../lib/utils";
import {
  InspectSidebarRef,
  InspectUltilityBarRef,
  QuestionInspectProps,
} from "../../constants/types";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTopicalApp } from "../../context/TopicalLayoutProvider";
import InspectSidebar from "./InspectSidebar";
import { QuestionInspectMainContentRef } from "../../constants/types";
import QuestionInspectMainContent from "./QuestionInspectMainContent";

const sidebarProviderStyle = {
  "--sidebar-width": "299.6px",
  height: "inherit",
  minHeight: "inherit !important",
} as React.CSSProperties;

const QuestionInspect = ({
  isOpen,
  currentQuery,
  setIsOpen,
  partitionedTopicalData,
  listId,
  BETTER_AUTH_URL,
  sortParameters,
  setSortParameters,
  isInspectSidebarOpen,
  setIsInspectSidebarOpen,
}: QuestionInspectProps) => {
  const [currentTabThatContainsQuestion, setCurrentTabThatContainsQuestion] =
    useState(0);
  const [currentQuestionId, setCurrentQuestionId] = useState<
    string | undefined
  >(undefined);
  const { isCalculatorOpen } = useTopicalApp();
  const isMobile = useIsMobile();
  const currentQuestionIndex = useMemo(() => {
    return (
      partitionedTopicalData?.[currentTabThatContainsQuestion]?.findIndex(
        (question) => question.id === currentQuestionId
      ) ?? 0
    );
  }, [
    partitionedTopicalData,
    currentTabThatContainsQuestion,
    currentQuestionId,
  ]);
  const isInputFocused = useRef(false);
  const allQuestions = useMemo(() => {
    return partitionedTopicalData?.flat() ?? [];
  }, [partitionedTopicalData]);

  useEffect(() => {
    if (isMobile) {
      setIsInspectSidebarOpen(false);
    }
  }, [isMobile, setIsInspectSidebarOpen]);

  const questionInspectMainContentRef =
    useRef<QuestionInspectMainContentRef | null>(null);
  const sideBarInspectRef = useRef<InspectSidebarRef | null>(null);
  const inspectUltilityBarRef = useRef<InspectUltilityBarRef | null>(null);

  const isCoolDown = useRef(false);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      questionInspectMainContentRef.current?.handleKeyboardNavigation(e);
    },
    []
  );

  const handleKeyUp = useCallback(() => {
    isCoolDown.current = false;
  }, []);

  const handleInteractOutside = useCallback(
    (e: Event) => {
      if (isOpen.isOpen && isCalculatorOpen) {
        e.preventDefault();
      }
    },
    [isOpen.isOpen, isCalculatorOpen]
  );

  useEffect(() => {
    if (isOpen.isOpen) {
      questionInspectMainContentRef.current?.setCurrentView("question");
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        isInspectOpen: true,
        questionId: isOpen.questionId ?? "",
      });
    } else {
      isInputFocused.current = false;
      if (currentQuery?.curriculumId && currentQuery?.subjectId) {
        updateSearchParams({
          query: JSON.stringify(currentQuery),
          questionId: isOpen.questionId ?? "",
          isInspectOpen: false,
        });
      }
    }
  }, [currentQuery, isOpen]);

  useEffect(() => {
    if (currentQuery && currentQuestionId) {
      updateSearchParams({
        query: JSON.stringify(currentQuery),
        isInspectOpen: true,
        questionId: currentQuestionId,
      });
    }
  }, [currentQuestionId, currentQuery]);

  return (
    <>
      <Dialog
        open={isOpen.isOpen}
        onOpenChange={(open) => {
          setIsOpen({
            isOpen: open,
            questionId:
              currentQuestionId ??
              isOpen.questionId ??
              partitionedTopicalData?.[0]?.[0]?.id ??
              "",
          });
        }}
        modal={false}
      >
        {isOpen.isOpen && (
          <div className="fixed inset-0 z-[100003] bg-black/50" />
        )}
        <DialogContent
          className="w-[95vw] h-[94dvh] flex flex-row items-center justify-center !max-w-screen dark:bg-accent overflow-hidden p-0"
          showCloseButton={false}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onInteractOutside={handleInteractOutside}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Question and answer inspector</DialogTitle>
            <DialogDescription>
              View the question and answer for individual questions
            </DialogDescription>
          </DialogHeader>
          <SidebarProvider
            onOpenChange={setIsInspectSidebarOpen}
            openMobile={isInspectSidebarOpen}
            onOpenChangeMobile={setIsInspectSidebarOpen}
            open={isInspectSidebarOpen}
            className="!min-h-[inherit]"
            style={sidebarProviderStyle}
          >
            <InspectSidebar
              ref={sideBarInspectRef}
              overflowScrollHandler={
                inspectUltilityBarRef.current?.overflowScrollHandler
              }
              allQuestions={allQuestions}
              partitionedTopicalData={partitionedTopicalData}
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              currentTabThatContainsQuestion={currentTabThatContainsQuestion}
              setCurrentTabThatContainsQuestion={
                setCurrentTabThatContainsQuestion
              }
              isInspectSidebarOpen={isInspectSidebarOpen}
              currentQuestionId={currentQuestionId}
              setCurrentQuestionId={setCurrentQuestionId}
              setCurrentView={(view) =>
                questionInspectMainContentRef.current?.setCurrentView(view)
              }
              resetScrollPositions={() =>
                questionInspectMainContentRef.current?.resetScrollPositions()
              }
              listId={listId}
              currentQuestionIndex={currentQuestionIndex}
              isInputFocused={isInputFocused}
              navigationButtonsPortalContainer={
                inspectUltilityBarRef.current?.navigationButtonsContainerRef
              }
            />
            <QuestionInspectMainContent
              ref={questionInspectMainContentRef}
              partitionedTopicalData={partitionedTopicalData}
              currentTabThatContainsQuestion={currentTabThatContainsQuestion}
              currentQuestionIndex={currentQuestionIndex}
              currentQuestionId={currentQuestionId}
              listId={listId}
              inspectUltilityBarRef={inspectUltilityBarRef}
              sideBarInspectRef={sideBarInspectRef}
              sortParameters={sortParameters}
              setSortParameters={setSortParameters}
              isCalculatorOpen={isCalculatorOpen}
              isInspectSidebarOpen={isInspectSidebarOpen}
              setIsInspectSidebarOpen={setIsInspectSidebarOpen}
              BETTER_AUTH_URL={BETTER_AUTH_URL}
              setIsOpen={setIsOpen}
              isCoolDown={isCoolDown}
              isInputFocused={isInputFocused}
            />
          </SidebarProvider>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default QuestionInspect;
